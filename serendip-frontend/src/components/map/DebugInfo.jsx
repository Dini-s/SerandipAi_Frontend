import React from 'react';

const DebugInfo = ({ places, filteredPlaces, markersCount }) => {
  // Check if we're in development mode using import.meta.env
  if (import.meta.env.MODE !== 'development') return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/75 text-white px-4 py-2 rounded-lg text-xs">
      Places: {places.length} | Filtered: {filteredPlaces.length} | Markers: {markersCount}
    </div>
  );
};

export default DebugInfo;