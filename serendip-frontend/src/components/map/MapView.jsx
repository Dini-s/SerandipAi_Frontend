import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapView = ({ mapStyle, isMobile, isTablet, isDesktop, onMapLoad }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [80.7718, 7.8731],
      zoom: isMobile ? 6.5 : isTablet ? 7 : 7.5,
      pitch: isMobile ? 30 : 45,
      maxBounds: [[79.5, 5.8], [82.0, 9.9]],
    });

    // Add controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
      isMobile ? 'bottom-right' : 'top-right'
    );

    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      isMobile ? 'bottom-right' : 'top-right'
    );

    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric',
      }),
      'bottom-left'
    );

    map.current.addControl(
      new mapboxgl.FullscreenControl(),
      'top-right'
    );

    map.current.on('load', () => {
      console.log('Map loaded successfully');
      onMapLoad(map.current);
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapStyle, isMobile, isTablet, isDesktop, onMapLoad]);

  return <div ref={mapContainer} className="absolute inset-0" />;
};

export default MapView;