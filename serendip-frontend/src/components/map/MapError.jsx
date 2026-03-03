import React from 'react';

const MapError = ({ message }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Map Error</h2>
        <p className="text-gray-700 mb-4">{message}</p>
        <p className="text-sm text-gray-500">
          Please check your Mapbox token in the .env file and ensure it's valid.
        </p>
      </div>
    </div>
  );
};

export default MapError;