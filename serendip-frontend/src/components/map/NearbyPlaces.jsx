import React from 'react';

const NearbyPlaces = ({ places, onSelectPlace }) => {
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
      <h4 className="font-semibold text-sm mb-2">📍 Near You</h4>
      <div className="space-y-2 max-w-xs">
        {places.slice(0, 3).map(place => (
          <button
            key={place._id}
            onClick={() => onSelectPlace(place)}
            className="w-full text-left text-xs hover:bg-gray-100 p-2 rounded transition-colors"
          >
            <div className="font-medium">{place.name}</div>
            <div className="text-gray-500">{place.category} • {place.province}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NearbyPlaces;