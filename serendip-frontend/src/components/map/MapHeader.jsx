import React from 'react';
import { Search, Mic, MicOff, Menu } from 'lucide-react';

const MapHeader = ({ 
  isMobile, 
  searchQuery, 
  onSearchChange, 
  onVoiceSearch, 
  isListening,
  onOpenFilters,
  filteredCount,
  nearbyCount 
}) => {
  if (isMobile) {
    return (
      <div className="absolute top-0 left-0 right-0 z-10 p-2 flex items-center gap-2">
        <button
          onClick={onOpenFilters}
          className="bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search places..."
            className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur text-sm"
          />
          <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
        </div>
        
        <button
          onClick={onVoiceSearch}
          className={`p-3 rounded-xl shadow-lg ${
            isListening ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-4 max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          🌴 SerendipAi
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm mt-1">
          Discover the pearl of the Indian Ocean
        </p>
        
        <div className="mt-4 flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search places..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
          </div>
          <button
            onClick={onVoiceSearch}
            className={`p-2 rounded-lg ${
              isListening ? 'bg-red-500 text-white' : 'bg-gray-100'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-2 text-xs sm:text-sm text-gray-500">
          Found {filteredCount} places
        </div>

        {nearbyCount > 0 && (
          <div className="mt-2 text-xs text-green-600">
            🏃 {nearbyCount} places near you
          </div>
        )}
      </div>
    </div>
  );
};

export default MapHeader;