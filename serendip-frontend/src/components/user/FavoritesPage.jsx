
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star, Trash2, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import { touristPlaceAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All', icon: '🌍' },
    { id: 'beach', name: 'Beaches', icon: '🏖️' },
    { id: 'temple', name: 'Temples', icon: '🛕' },
    { id: 'historical', name: 'Historical', icon: '🏛️' },
    { id: 'nature', name: 'Nature', icon: '🌲' },
    { id: 'wildlife', name: 'Wildlife', icon: '🦁' },
  ];

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    filterFavorites();
  }, [searchQuery, selectedCategory, favorites]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setFilteredFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch all places and filter favorites
      const response = await touristPlaceAPI.getAll();
      const allPlaces = response.data?.data || response.data || [];
      
      const favoritePlaces = allPlaces.filter(place => 
        favoriteIds.includes(place._id)
      );
      
      setFavorites(favoritePlaces);
      setFilteredFavorites(favoritePlaces);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const filterFavorites = () => {
    let filtered = [...favorites];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place =>
        place.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredFavorites(filtered);
  };

  const removeFavorite = (placeId) => {
    const newFavorites = favorites.filter(p => p._id !== placeId);
    setFavorites(newFavorites);
    
    const favoriteIds = newFavorites.map(p => p._id);
    localStorage.setItem('favorites', JSON.stringify(favoriteIds));
    
    toast.success('Removed from favorites');
  };

  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to remove all favorites?')) {
      setFavorites([]);
      localStorage.setItem('favorites', JSON.stringify([]));
      toast.success('All favorites cleared');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your favorites..." />;
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-blue-50">
        <div className="text-center p-8">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 max-w-md">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring Sri Lanka and add places to your favorites!
            </p>
            <Button
              onClick={() => navigate('/')}
              variant="primary"
              className="w-full"
            >
              Explore Places
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Favorites</h1>
            <p className="text-gray-600 text-sm mt-1">
              You have {favorites.length} saved places
            </p>
          </div>
          
          {favorites.length > 0 && (
            <Button
              onClick={clearAllFavorites}
              variant="danger"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No favorites match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFavorites.map(place => (
              <FavoriteCard
                key={place._id}
                place={place}
                onRemove={removeFavorite}
                onClick={() => navigate('/', { state: { selectedPlace: place } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FavoriteCard = ({ place, onRemove, onClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="relative h-48 cursor-pointer" onClick={onClick}>
        {place.images && place.images[0] && !imageError ? (
          <img
            src={place.images[0]}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Heart className="w-12 h-12 text-white opacity-50" />
          </div>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(place._id);
          }}
          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-lg backdrop-blur">
            {place.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{place.name}</h3>
        <p className="text-sm text-gray-500 mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {place.province}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {place.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
          <Button
            onClick={onClick}
            variant="primary"
            size="sm"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;