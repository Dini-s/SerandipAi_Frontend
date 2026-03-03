import React from 'react';
import { Layers, Navigation } from 'lucide-react';

const MapControls = ({ isMobile, mapStyle, onStyleChange, onGoToUserLocation }) => {
  return (
    <div className={`
      absolute z-10 flex flex-col gap-2
      ${isMobile ? 'bottom-20 right-2' : 'top-24 right-4'}
    `}>
      <button
        onClick={() => onStyleChange(mapStyle === 'outdoors' ? 'satellite' : 'outdoors')}
        className="bg-white/90 backdrop-blur p-2 sm:p-3 rounded-lg shadow-lg hover:bg-gray-100"
        title="Change map style"
      >
        <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      
      <button
        onClick={onGoToUserLocation}
        className="bg-white/90 backdrop-blur p-2 sm:p-3 rounded-lg shadow-lg hover:bg-gray-100"
        title="Go to my location"
      >
        <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default MapControls;