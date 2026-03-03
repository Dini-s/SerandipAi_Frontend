import React from 'react';
import { X, Star, MapPin, Volume2, Loader, ChevronLeft, ChevronRight } from 'lucide-react';

const PlaceDetails = ({
  place,
  onClose,
  onToggleFavorite,
  isFavorite,
  translatedDescription,
  isTranslating,
  isSpeaking,
  onSpeak,
  currentImageIndex,
  onNextImage,
  onPrevImage,
  preferredLanguage,
  languages
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 md:bottom-8 md:left-1/2 md:transform md:-translate-x-1/2 md:w-full md:max-w-2xl md:px-4 z-20">
      <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-3 sm:p-4 md:p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image Gallery */}
          {place.images && place.images.length > 0 && (
            <div className="relative mb-3">
              <img
                src={place.images[currentImageIndex]}
                alt={place.name}
                className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                }}
              />
              
              {place.images.length > 1 && (
                <>
                  <button
                    onClick={onPrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {place.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Place Info */}
          <div className="flex justify-between items-start">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold pr-8">
              {place.name}
            </h2>
            
            <button
              onClick={onSpeak}
              disabled={isSpeaking || isTranslating}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
              title={isSpeaking ? 'Speaking...' : 'Listen to description'}
            >
              {isSpeaking ? (
                <Volume2 className="w-5 h-5 animate-pulse" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {place.category}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
              {place.province}
            </span>
          </div>

          {/* Description */}
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-medium text-gray-500">
                {preferredLanguage !== 'en' ? `Translated to ${preferredLanguage}` : 'Description'}
              </p>
              {isTranslating && (
                <Loader className="w-3 h-3 animate-spin text-blue-500" />
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              {translatedDescription || place.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onToggleFavorite(place._id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                isFavorite
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className="w-4 h-4 inline mr-1" />
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
            
            <button
              onClick={() => {
                if (place.location?.coordinates) {
                  const [lng, lat] = place.location.coordinates;
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                    '_blank'
                  );
                }
              }}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              <MapPin className="w-4 h-4 inline mr-1" />
              Directions
            </button>
          </div>

          {/* Language Info */}
          {preferredLanguage !== 'en' && (
            <div className="mt-3 text-xs text-gray-400 text-center">
              🌐 Description translated to {languages.find(l => l.code === preferredLanguage)?.name || preferredLanguage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;