import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useResponsive } from '../hooks/useResponsive';
import { useTranslation } from '../hooks/useTranslation';
import { 
  Search, Mic, MicOff, Menu, X, Navigation, 
  Layers, Star, MapPin, Volume2,
  Globe, Loader, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import sub-components
import MapHeader from './map/MapHeader';
import MapControls from './map/MapControls';
import CategoryFilter from './map/CategoryFilter';
import MobileFilterPanel from './map/MobileFilterPanel';
import PlaceDetails from './map/PlaceDetails';
import NearbyPlaces from './map/NearbyPlaces';
import MapError from './map/MapError';
import LoadingSpinner from './map/LoadingSpinner';
import DebugInfo from './map/DebugInfo';
import LeafletMap from './map/LeafletMap'; // Import LeafletMap instead of MapView

const TouristMap = () => {
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
  const [translatedDescription, setTranslatedDescription] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [mapError, setMapError] = useState(null);
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]); // [lat, lng]
  const [mapZoom, setMapZoom] = useState(7.5);

  const { user } = useAuth();
  const { preferredLanguage, languages } = useLanguage();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { translate, speak, isTranslating, isSpeaking } = useTranslation();

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

  // Province centers for navigation
  const provinceCenters = {
    'Central': [7.2906, 80.6337], // [lat, lng]
    'Northern': [9.6615, 80.0255],
    'Eastern': [7.0817, 81.7479],
    'Western': [6.9271, 79.8612],
    'Southern': [6.0037, 80.7703],
    'Uva': [6.8428, 81.3395],
    'Sabaragamuwa': [6.7395, 80.3656],
    'North Western': [7.6176, 79.9948],
    'North Central': [8.3333, 80.5],
  };

  // Fetch places from backend
  useEffect(() => {
    fetchPlaces();
    getUserLocation();
    loadFavorites();
  }, []);

  // Translate description when selected place or language changes
  useEffect(() => {
    if (selectedPlace && selectedPlace.description) {
      handleTranslate(selectedPlace.description);
    }
  }, [selectedPlace, preferredLanguage]);

  // Fetch nearby places when user location changes
  useEffect(() => {
    if (userLocation) {
      fetchNearbyPlaces(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  const fetchPlaces = async () => {
    try {
      console.log('Fetching places from:', `${import.meta.env.VITE_API_BASE_URL}/touristPlace/`);
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/touristPlace/`);
      console.log('API Response:', response.data);
      
      let placesData = [];
      if (Array.isArray(response.data)) {
        placesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        placesData = response.data.data;
      } else if (response.data && response.data.places) {
        placesData = response.data.places;
      } else {
        console.error('Unexpected response structure:', response.data);
        setMapError('API returned unexpected data format');
        return;
      }
      
      console.log('Processed places:', placesData.length);
      
      const placesWithCoordinates = placesData.filter(p => 
        p.location && 
        p.location.coordinates && 
        Array.isArray(p.location.coordinates) && 
        p.location.coordinates.length === 2
      );
      
      console.log('Places with valid coordinates:', placesWithCoordinates.length);
      
      if (placesWithCoordinates.length === 0) {
        console.warn('No places with valid coordinates found!');
        toast.error('No places with location data found in the database');
      }
      
      setPlaces(placesData);
      setFilteredPlaces(placesData);
    } catch (error) {
      console.error('Error fetching places:', error);
      setMapError(`Failed to fetch places: ${error.message}`);
      setPlaces([]);
      setFilteredPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyPlaces = async (lat, lng) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/touristPlace/nearby?lat=${lat}&lng=${lng}&distance=10000`
      );
      
      let nearbyData = [];
      if (Array.isArray(response.data)) {
        nearbyData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        nearbyData = response.data.data;
      }
      
      setNearbyPlaces(nearbyData);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          console.log('User location:', location);
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

  const handleTranslate = async (text) => {
    if (preferredLanguage === 'en') {
      setTranslatedDescription(text);
      return;
    }
    
    const translated = await translate(text, preferredLanguage);
    setTranslatedDescription(translated);
  };

  const handleSpeak = async () => {
    const textToSpeak = translatedDescription || selectedPlace?.description;
    if (textToSpeak) {
      await speak(textToSpeak, preferredLanguage);
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice search is not supported in your browser');
      return;
    }

    if (!isListening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = preferredLanguage;
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
      };
      
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
  }, [places]);

  const handleCategoryFilter = (categoryId) => {
    setActiveCategory(categoryId);
    
    if (categoryId === 'all') {
      setFilteredPlaces(places);
    } else {
      const filtered = places.filter(p => 
        p.category?.toLowerCase() === categoryId.toLowerCase()
      );
      setFilteredPlaces(filtered);
    }
  };

  const handleProvinceFilter = (province) => {
    if (!province) {
      setFilteredPlaces(places);
      setMapCenter([7.8731, 80.7718]);
      setMapZoom(isMobile ? 6.5 : 7.5);
    } else {
      const filtered = places.filter(p => p.province === province);
      setFilteredPlaces(filtered);
      
      if (provinceCenters[province]) {
        setMapCenter(provinceCenters[province]);
        setMapZoom(9);
      }
    }
  };

  const goToUserLocation = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(14);
    }
  };

  const toggleFavorite = async (placeId) => {
      const isCurrentlyFavorite = favorites.includes(placeId);
      
      // Update local state
      const newFavorites = isCurrentlyFavorite
          ? favorites.filter(id => id !== placeId)
          : [...favorites, placeId];
      
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      
      // Track the activity if user is logged in
      if (user) {
          try {
              await axios.post(
                  `${import.meta.env.VITE_API_BASE_URL}/activity/`,
                  {
                      touristPlaceId: placeId,
                      action: isCurrentlyFavorite ? 'unfavorite' : 'favorite',
                      language: preferredLanguage,
                  },
                  {
                      headers: { 
                          Authorization: `Bearer ${localStorage.getItem('token')}` 
                      },
                  }
              );
              
              toast.success(
                  isCurrentlyFavorite 
                      ? 'Removed from favorites' 
                      : 'Added to favorites'
              );
          } catch (error) {
              console.error('Error tracking favorite:', error);
              // Revert local state if tracking fails
              setFavorites(isCurrentlyFavorite ? [...favorites, placeId] : favorites.filter(id => id !== placeId));
              localStorage.setItem('favorites', JSON.stringify(isCurrentlyFavorite ? [...favorites, placeId] : favorites.filter(id => id !== placeId)));
              toast.error('Failed to update favorite');
          }
      } else {
          toast.success(
              isCurrentlyFavorite 
                  ? 'Removed from favorites' 
                  : 'Added to favorites (saved locally)'
          );
      }
  };

  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
    setCurrentImageIndex(0);
    trackActivity(place._id, 'viewed');
  };

  const nextImage = () => {
    if (selectedPlace?.images && currentImageIndex < selectedPlace.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  if (mapError) {
    return <MapError message={mapError} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Container */}
      <LeafletMap
        center={mapCenter}
        zoom={mapZoom}
        markers={filteredPlaces.map(place => ({
          ...place,
          isFavorite: favorites.includes(place._id)
        }))}
        onMarkerClick={handleMarkerClick}
        selectedPlace={selectedPlace}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Debug Info */}
      <DebugInfo 
        places={places} 
        filteredPlaces={filteredPlaces} 
        markersCount={filteredPlaces.length} 
      />

      {/* Header */}
      <MapHeader
        isMobile={isMobile}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onVoiceSearch={handleVoiceSearch}
        isListening={isListening}
        onOpenFilters={() => setShowFilters(true)}
        filteredCount={filteredPlaces?.length || 0}
        nearbyCount={nearbyPlaces.length}
      />

      {/* Category Filter - Desktop */}
      {!isMobile && (
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryFilter}
        />
      )}

      {/* Map Controls - Note: mapStyle is now visual only since Leaflet uses different styles */}
      <MapControls
        isMobile={isMobile}
        mapStyle={mapStyle}
        onStyleChange={() => {}} // Leaflet doesn't have built-in style changes
        onGoToUserLocation={goToUserLocation}
      />

      {/* Mobile Filter Panel */}
      {isMobile && showFilters && (
        <MobileFilterPanel
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryFilter}
          onProvinceChange={handleProvinceFilter}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Place Details */}
      {selectedPlace && (
        <PlaceDetails
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(selectedPlace._id)}
          translatedDescription={translatedDescription}
          isTranslating={isTranslating}
          isSpeaking={isSpeaking}
          onSpeak={handleSpeak}
          currentImageIndex={currentImageIndex}
          onNextImage={nextImage}
          onPrevImage={prevImage}
          preferredLanguage={preferredLanguage}
          languages={languages}
        />
      )}

      {/* Search Results Count (Mobile) */}
      {isMobile && searchQuery && (
        <div className="absolute top-20 left-2 right-2 z-10 bg-white/90 backdrop-blur rounded-lg p-2 text-center text-sm">
          Found {filteredPlaces?.length || 0} places matching "{searchQuery}"
        </div>
      )}

      {/* Nearby Places Indicator */}
      {!isMobile && nearbyPlaces.length > 0 && !selectedPlace && (
        <NearbyPlaces
          places={nearbyPlaces}
          onSelectPlace={setSelectedPlace}
        />
      )}
    </div>
  );
};

export default TouristMap;