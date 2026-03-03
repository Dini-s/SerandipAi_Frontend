import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Set default icon
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LeafletMap = ({ 
  center = [7.8731, 80.7718], // [lat, lng] for Sri Lanka
  zoom = 7.5,
  markers = [],
  onMarkerClick,
  selectedPlace,
  isMobile,
  isTablet,
  onMapReady
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('Initializing Leaflet map...');

    // Create map instance
    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

    // Add OpenStreetMap tiles (completely free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      minZoom: 6,
    }).addTo(mapInstanceRef.current);

    // Add scale control
    L.control.scale({ 
      imperial: false, 
      metric: true,
      position: 'bottomleft'
    }).addTo(mapInstanceRef.current);

    // Add fullscreen control (optional - install leaflet.fullscreen if needed)
    // L.control.fullscreen().addTo(mapInstanceRef.current);

    // Map loaded event
    mapInstanceRef.current.whenReady(() => {
      console.log('Leaflet map loaded successfully');
      setMapLoaded(true);
      if (onMapReady) {
        onMapReady(mapInstanceRef.current);
      }
    });

    // Handle resize
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  // Update view when center/zoom props change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    mapInstanceRef.current.setView(center, zoom);
  }, [center, zoom, mapLoaded]);

  // Handle markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    console.log('Updating markers...', markers.length);

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    markers.forEach(place => {
      if (!place.location?.coordinates) return;

      const [lng, lat] = place.location.coordinates; // GeoJSON is [lng, lat]
      const isFavorite = place.isFavorite || false;

      // Create custom marker icon
      const markerIcon = L.divIcon({
        className: 'custom-marker cursor-pointer',
        html: `
          <div class="relative group">
            <div class="
              ${isMobile ? 'w-8 h-8' : isTablet ? 'w-9 h-9' : 'w-10 h-10'}
              bg-gradient-to-r from-amber-500 to-orange-500 
              rounded-full shadow-lg flex items-center justify-center
              transform transition-all duration-300 hover:scale-110 hover:rotate-12
              ${isFavorite ? 'ring-4 ring-yellow-300 animate-pulse' : ''}
            ">
              <svg class="${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [isMobile ? 32 : 40, isMobile ? 32 : 40],
        iconAnchor: [isMobile ? 16 : 20, isMobile ? 16 : 20],
        popupAnchor: [0, -20],
        
      });

      // Create popup content
      const popupContent = `
        <div class="p-3 min-w-[200px] max-w-[250px]">
          <h3 class="font-bold text-sm sm:text-base mb-1">${place.name || 'Unknown'}</h3>
          <p class="text-xs text-gray-600 mb-1">${place.category || 'Uncategorized'}</p>
          <p class="text-xs text-gray-500 mb-2">${place.province || 'Unknown'}</p>
          <button 
            class="w-full bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600 transition-colors view-details-btn"
            data-id="${place._id}"
          >
            View Details
          </button>
        </div>
      `;

      // Create marker
      const marker = L.marker([lat, lng], { icon: markerIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(popupContent, {
          className: 'custom-popup',
          closeButton: true,
          maxWidth: 300,
          minWidth: 200
        });

      // Store marker reference
      markersRef.current[place._id] = marker;

      // Add click event
      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(place);
        }
      });

      // Handle popup button click
      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.querySelector(`.view-details-btn[data-id="${place._id}"]`);
          if (btn) {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onMarkerClick) {
                onMarkerClick(place);
              }
              marker.closePopup();
            });
          }
        }, 100);
      });
    });
  }, [markers, isMobile, isTablet, mapLoaded]);

  // Fly to selected place
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !selectedPlace?.location?.coordinates) return;

    const [lng, lat] = selectedPlace.location.coordinates;
    mapInstanceRef.current.flyTo([lat, lng], 14, {
      duration: 1.5
    });

    // Open popup for selected place
    setTimeout(() => {
      const marker = markersRef.current[selectedPlace._id];
      if (marker) {
        marker.openPopup();
      }
    }, 1600);
  }, [selectedPlace, mapLoaded]);

  return <div ref={mapRef} className="absolute inset-0 z-0" style={{ background: '#f0f0f0' }} />;
};

export default LeafletMap;