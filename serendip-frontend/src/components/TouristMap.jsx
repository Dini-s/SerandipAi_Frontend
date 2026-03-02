import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useResponsive } from '../hooks/useResponsive';
import { 
  Search, Mic, MicOff, Menu, X, Navigation, 
  Compass, Map, Layers, Star, Filter, MapPin 
} from 'lucide-react';

// Set Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_TOKEN;

const TouristMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const searchInputRef = useRef(null);

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mapStyle, setMapStyle] = useState('outdoors');
  const [userLocation, setUserLocation] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  const { user } = useAuth();
  const { preferredLanguage } = useLanguage();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Map styles
  const mapStyles = {
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
  };

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Places', icon: '🌍' },
    { id: 'beach', name: 'Beaches', icon: '🏖️' },
    { id: 'temple', name: 'Temples', icon: '🛕' },
    { id: 'mountain', name: 'Mountains', icon: '⛰️' },
    { id: 'historical', name: 'Historical', icon: '🏛️' },
    { id: 'wildlife', name: 'Wildlife', icon: '🦁' },
    { id: 'waterfall', name: 'Waterfalls', icon: '💧' },
  ];

  // Fetch places
  useEffect(() => {
    fetchPlaces();
    getUserLocation();
    loadFavorites();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[mapStyle],
      center: [80.7718, 7.8731],
      zoom: isMobile ? 6.5 : isTablet ? 7 : 7.5,
      pitch: isMobile ? 30 : 45,
      maxBounds: [[79.5, 5.8], [82.0, 9.9]],
    });

    // Add navigation control
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
      isMobile ? 'bottom-right' : 'top-right'
    );

    // Add geolocation control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      isMobile ? 'bottom-right' : 'top-right'
    );

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric',
      }),
      'bottom-left'
    );

    // Add 3D buildings on desktop
    if (isDesktop) {
      map.current.on('load', () => {
        map.current.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              16, ['get', 'height']
            ],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6,
          },
        });
      });
    }

    // Handle resize
    const handleResize = () => {
      map.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      map.current?.remove();
    };
  }, [mapStyle, isMobile, isTablet, isDesktop]);

  // Update markers when places change
  useEffect(() => {
    if (map.current && filteredPlaces && Array.isArray(filteredPlaces) && filteredPlaces.length > 0) {
      updateMarkers();
    }
  }, [filteredPlaces, favorites, map.current]);

  const fetchPlaces = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tourist-places`);
      console.log('API Response:', response.data); // Debug log
      
      // Handle different response structures
      let placesData = [];
      if (Array.isArray(response.data)) {
        placesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        placesData = response.data.data;
      } else if (response.data && response.data.places) {
        placesData = response.data.places;
      }
      
      console.log('Processed places:', placesData); // Debug log
      
      setPlaces(placesData);
      setFilteredPlaces(placesData);
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlaces([]);
      setFilteredPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing favorites:', e);
        setFavorites([]);
      }
    }
  };

  const updateMarkers = () => {
    // Safety check
    if (!filteredPlaces || !Array.isArray(filteredPlaces)) {
      console.warn('filteredPlaces is not an array:', filteredPlaces);
      return;
    }

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    filteredPlaces.forEach((place) => {
      // Skip if place doesn't have valid coordinates
      if (!place.location || !place.location.coordinates || !Array.isArray(place.location.coordinates)) {
        console.warn('Invalid place coordinates:', place);
        return;
      }

      const isFavorite = favorites.includes(place._id);
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = `
        <div class="relative group">
          <div class="
            ${isMobile ? 'w-8 h-8' : isTablet ? 'w-9 h-9' : 'w-10 h-10'}
            bg-gradient-to-r from-amber-500 to-orange-500 
            rounded-full shadow-lg flex items-center justify-center
            transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12
            ${isFavorite ? 'ring-4 ring-yellow-300 animate-pulse' : ''}
          ">
            <svg class="${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
          ${!isMobile ? `
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
              <div class="bg-white px-3 py-1 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap">
                ${place.name || 'Unknown'}
              </div>
            </div>
          ` : ''}
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: isMobile ? '200px' : '300px',
      }).setHTML(`
        <div class="p-2 sm:p-3">
          <h3 class="font-bold text-sm sm:text-base">${place.name || 'Unknown'}</h3>
          <p class="text-xs sm:text-sm text-gray-600">${place.category || 'Uncategorized'}</p>
          <p class="text-xs text-gray-500 mt-1">${place.province || 'Unknown'}</p>
          <button 
            class="mt-2 w-full bg-blue-500 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-600 transition-colors view-details"
            data-id="${place._id}"
          >
            View Details
          </button>
        </div>
      `);

      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat(place.location.coordinates)
        .setPopup(popup)
        .addTo(map.current);

      markers.current[place._id] = marker;

      // Handle marker click
      el.addEventListener('click', () => {
        setSelectedPlace(place);
        trackActivity(place._id, 'viewed');
      });
    });
  };

  const trackActivity = async (placeId, action) => {
    if (!user) return;
    
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/activity`, {
        touristPlaceId: placeId,
        action,
        language: preferredLanguage,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredPlaces(places);
      return;
    }

    const filtered = places.filter(place =>
      place.name?.toLowerCase().includes(query.toLowerCase()) ||
      place.description?.toLowerCase().includes(query.toLowerCase()) ||
      place.category?.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredPlaces(filtered);

    // Fly to first result if only one
    if (filtered.length === 1 && map.current) {
      map.current.flyTo({
        center: filtered[0].location?.coordinates || [80.7718, 7.8731],
        zoom: 14,
        duration: 2000,
      });
    }
  }, [places]);

  const handleVoiceSearch = () => {
    if (!isListening) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = preferredLanguage;
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        handleSearch(transcript);
      };
      
      recognition.start();
    } else {
      setIsListening(false);
    }
  };

  const handleCategoryFilter = (categoryId) => {
    setActiveCategory(categoryId);
    
    if (categoryId === 'all') {
      setFilteredPlaces(places);
    } else {
      const filtered = places.filter(p => 
        p.category?.toLowerCase().includes(categoryId.toLowerCase())
      );
      setFilteredPlaces(filtered);
    }
  };

  const handleProvinceFilter = (province) => {
    if (!province) {
      setFilteredPlaces(places);
      map.current?.flyTo({
        center: [80.7718, 7.8731],
        zoom: isMobile ? 6.5 : 7.5,
        duration: 2000,
      });
    } else {
      const filtered = places.filter(p => p.province === province);
      setFilteredPlaces(filtered);
      
      // Province centers
      const centers = {
        'Central': [80.6337, 7.2906],
        'Northern': [80.0255, 9.6615],
        'Eastern': [81.7479, 7.0817],
        'Western': [79.8612, 6.9271],
        'Southern': [80.7703, 6.0037],
        'Uva': [81.3395, 6.8428],
        'Sabaragamuwa': [80.3656, 6.7395],
        'North Western': [79.9948, 7.6176],
        'North Central': [80.5, 8.3333],
      };
      
      if (centers[province] && map.current) {
        map.current.flyTo({
          center: centers[province],
          zoom: 9,
          duration: 2000,
        });
      }
    }
  };

  const handleMapStyleChange = (style) => {
    setMapStyle(style);
    map.current?.setStyle(mapStyles[style]);
  };

  const goToUserLocation = () => {
    if (userLocation && map.current) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 2000,
      });
    }
  };

  const toggleFavorite = (placeId) => {
    const newFavorites = favorites.includes(placeId)
      ? favorites.filter(id => id !== placeId)
      : [...favorites, placeId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading amazing places...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Mobile Header */}
      {isMobile && (
        <div className="absolute top-0 left-0 right-0 z-10 p-2 flex items-center gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className="bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search places..."
              className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur text-sm"
            />
            <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
          </div>
          
          <button
            onClick={handleVoiceSearch}
            className={`p-3 rounded-xl shadow-lg ${
              isListening ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-4 max-w-md">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              🌴 Sri Lanka Explorer
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
              Discover the pearl of the Indian Ocean
            </p>
            
            <div className="mt-4 flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search places..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
              <button
                onClick={handleVoiceSearch}
                className={`p-2 rounded-lg ${
                  isListening ? 'bg-red-500 text-white' : 'bg-gray-100'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <div className="mt-2 text-xs sm:text-sm text-gray-500">
              Found {filteredPlaces?.length || 0} places
            </div>
          </div>
        </div>
      )}

      {/* Categories Filter - Desktop */}
      {!isMobile && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-4">
            <h3 className="font-semibold mb-3 text-sm">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className={`
        absolute z-10 flex flex-col gap-2
        ${isMobile ? 'bottom-20 right-2' : 'top-24 right-4'}
      `}>
        <button
          onClick={() => handleMapStyleChange(mapStyle === 'outdoors' ? 'satellite' : 'outdoors')}
          className="bg-white/90 backdrop-blur p-2 sm:p-3 rounded-lg shadow-lg hover:bg-gray-100"
          title="Change map style"
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <button
          onClick={goToUserLocation}
          className="bg-white/90 backdrop-blur p-2 sm:p-3 rounded-lg shadow-lg hover:bg-gray-100"
          title="Go to my location"
        >
          <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Mobile Filter Panel */}
      {isMobile && showFilters && (
        <div className="absolute inset-0 z-20 bg-black/50" onClick={() => setShowFilters(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white/95 backdrop-blur overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        handleCategoryFilter(category.id);
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        activeCategory === category.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provinces */}
              <div>
                <h4 className="text-sm font-medium mb-2">Provinces</h4>
                <div className="space-y-2">
                  {['Central', 'Northern', 'Eastern', 'Western', 'Southern', 'Uva', 'Sabaragamuwa', 'North Western', 'North Central'].map((province) => (
                    <button
                      key={province}
                      onClick={() => {
                        handleProvinceFilter(province);
                        setShowFilters(false);
                      }}
                      className="w-full text-left px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                    >
                      {province}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Place Details */}
      {selectedPlace && (
        <div className={`
          absolute z-20
          ${isMobile 
            ? 'bottom-0 left-0 right-0' 
            : 'bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4'
          }
        `}>
          <div className={`
            bg-white rounded-t-3xl md:rounded-2xl shadow-2xl
            ${isMobile ? 'max-h-[80vh] overflow-y-auto' : ''}
          `}>
            <div className="p-3 sm:p-4 md:p-6 relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute top-2 right-2 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Place Image */}
              {selectedPlace.images && selectedPlace.images[0] && (
                <img
                  src={selectedPlace.images[0]}
                  alt={selectedPlace.name}
                  className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg mb-3"
                />
              )}

              {/* Place Info */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold pr-8">
                {selectedPlace.name}
              </h2>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {selectedPlace.category}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {selectedPlace.province}
                </span>
              </div>

              <p className="mt-3 text-sm sm:text-base text-gray-600">
                {selectedPlace.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleFavorite(selectedPlace._id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    favorites.includes(selectedPlace._id)
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className="w-4 h-4 inline mr-1" />
                  {favorites.includes(selectedPlace._id) ? 'Favorited' : 'Add to Favorites'}
                </button>
                
                <button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.location.coordinates[1]},${selectedPlace.location.coordinates[0]}`,
                      '_blank'
                    );
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Count (Mobile) */}
      {isMobile && searchQuery && (
        <div className="absolute top-20 left-2 right-2 z-10 bg-white/90 backdrop-blur rounded-lg p-2 text-center text-sm">
          Found {filteredPlaces?.length || 0} places matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default TouristMap;