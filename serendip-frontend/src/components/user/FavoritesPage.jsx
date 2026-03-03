import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Heart, 
  MapPin, 
  Star, 
  Trash2, 
  Search, 
  X, 
  RefreshCw,
  Filter,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All Places', icon: '🌍' },
    { id: 'beach', name: 'Beaches', icon: '🏖️' },
    { id: 'temple', name: 'Temples', icon: '🛕' },
    { id: 'historical', name: 'Historical', icon: '🏛️' },
    { id: 'mountain', name: 'Mountains', icon: '⛰️' },
    { id: 'wildlife', name: 'Wildlife', icon: '🦁' },
    { id: 'waterfall', name: 'Waterfalls', icon: '💧' },
  ];

  // Load favorites when component mounts or user changes
  useEffect(() => {
    loadFavorites();
  }, [user]);

  // Filter favorites when search, category, or favorites change
  useEffect(() => {
    filterFavorites();
  }, [searchQuery, selectedCategory, favorites]);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // If user is logged in, fetch from API
      if (user) {
        await fetchFavoritesFromAPI();
      } else {
        // For non-logged-in users, load from localStorage
        await loadFavoritesFromLocal();
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Failed to load favorites. Please try again.');
      toast.error('Failed to load favorites');
      
      // Try localStorage as fallback for logged-in users too
      if (user) {
        await loadFavoritesFromLocal();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoritesFromAPI = async () => {
    try {
      console.log('Fetching favorites from API for user:', user._id || user.id);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/activity/favorites`,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          },
        }
      );
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // Extract tourist places from activity records
        const favoriteActivities = response.data.data;
        
        // Map to get the actual place objects
        const favoritePlaces = favoriteActivities
          .map(activity => activity.touristPlace)
          .filter(place => place != null); // Remove any null places
        
        console.log('Fetched favorite places:', favoritePlaces.length);
        
        setFavorites(favoritePlaces);
        setFilteredFavorites(favoritePlaces);
        
        // Update localStorage for offline access
        const favoriteIds = favoritePlaces.map(place => place._id);
        localStorage.setItem('favorites', JSON.stringify(favoriteIds));
        
        toast.success(`Loaded ${favoritePlaces.length} favorites from your account`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        // If endpoint not found, fall back to localStorage
        console.log('Favorites endpoint not found, falling back to localStorage');
        await loadFavoritesFromLocal();
      } else {
        throw error;
      }
    }
  };

  const loadFavoritesFromLocal = async () => {
    try {
      console.log('Loading favorites from localStorage');
      
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setFilteredFavorites([]);
        return;
      }

      // Fetch all places and filter favorites
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/touristPlace/`);
      const allPlaces = response.data?.data || response.data || [];
      
      const favoritePlaces = allPlaces.filter(place => 
        favoriteIds.includes(place._id)
      );
      
      console.log('Loaded from localStorage:', favoritePlaces.length);
      
      setFavorites(favoritePlaces);
      setFilteredFavorites(favoritePlaces);
      
      if (user) {
        toast.info('Showing locally saved favorites. Sign in to sync across devices.');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setFavorites([]);
      setFilteredFavorites([]);
      setError('Could not load favorites from storage');
    }
  };

  const syncFavoritesFromServer = async () => {
    if (!user) {
      toast.error('Please login to sync favorites');
      return;
    }
    
    setSyncing(true);
    try {
      await fetchFavoritesFromAPI();
      toast.success('Favorites synced successfully');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync favorites');
    } finally {
      setSyncing(false);
    }
  };

  const filterFavorites = () => {
    let filtered = [...favorites];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(place =>
        place.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.province?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place =>
        place.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredFavorites(filtered);
  };

  const removeFavorite = async (placeId) => {
    // Find the place being removed
    const removedPlace = favorites.find(p => p._id === placeId);
    
    // Optimistic update
    const newFavorites = favorites.filter(p => p._id !== placeId);
    setFavorites(newFavorites);
    
    const favoriteIds = newFavorites.map(p => p._id);
    localStorage.setItem('favorites', JSON.stringify(favoriteIds));
    
    // If user is logged in, remove from server
    if (user) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/activity/favorites/${placeId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        
        toast.success(`Removed ${removedPlace?.name || 'place'} from favorites`);
      } catch (error) {
        console.error('Error removing favorite from server:', error);
        
        // Revert optimistic update if server fails
        setFavorites(favorites);
        localStorage.setItem('favorites', JSON.stringify(favorites.map(p => p._id)));
        
        toast.error('Failed to remove from server');
      }
    } else {
      toast.success(`Removed ${removedPlace?.name || 'place'} from favorites`);
    }
  };

  const clearAllFavorites = async () => {
    if (!window.confirm('Are you sure you want to remove all favorites?')) {
      return;
    }

    // Optimistic update
    const oldFavorites = [...favorites];
    setFavorites([]);
    localStorage.setItem('favorites', JSON.stringify([]));

    // If user is logged in, remove all from server
    if (user && oldFavorites.length > 0) {
      try {
        // Remove each favorite individually
        await Promise.all(
          oldFavorites.map(place => 
            axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/activity/favorites/${place._id}`,
              {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              }
            )
          )
        );
        
        toast.success('All favorites cleared');
      } catch (error) {
        console.error('Error clearing favorites from server:', error);
        
        // Revert optimistic update if server fails
        setFavorites(oldFavorites);
        localStorage.setItem('favorites', JSON.stringify(oldFavorites.map(p => p._id)));
        
        toast.error('Failed to clear favorites from server');
      }
    } else {
      toast.success('All favorites cleared');
    }
  };

  const handleCardClick = (place) => {
    // Navigate to map with selected place
    navigate('/', { 
      state: { 
        selectedPlace: place,
        fromFavorites: true 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-blue-50">
        <LoadingSpinner message="Loading your favorite places..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-blue-50">
        <div className="text-center p-8">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={loadFavorites}
                variant="primary"
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                className="w-full"
              >
                Back to Map
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-blue-50">
        <div className="text-center p-8">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 max-w-md">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">
              {user 
                ? "You haven't added any favorites to your account yet. Start exploring Sri Lanka and save places you love!"
                : "Start exploring Sri Lanka and add places to your favorites! Sign in to sync across devices."}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/')}
                variant="primary"
                className="w-full"
              >
                Explore Places
              </Button>
              {!user && (
                <Button
                  onClick={() => navigate('/login')}
                  variant="secondary"
                  className="w-full"
                >
                  Sign In to Sync
                </Button>
              )}
            </div>
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
              You have {favorites.length} saved {favorites.length === 1 ? 'place' : 'places'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {user && (
              <Button
                onClick={syncFavoritesFromServer}
                variant="secondary"
                size="sm"
                disabled={syncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync'}
              </Button>
            )}
            
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

            {/* Mobile filter toggle */}
            {isMobile && (
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                size="sm"
              >
                <Filter className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* User info banner */}
        {user ? (
          <div className="mb-4 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg flex items-center">
            <Heart className="w-4 h-4 mr-2 fill-current" />
            <span>Your favorites are synced across all devices</span>
          </div>
        ) : (
          <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Sign in to sync your favorites across devices and never lose them</span>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by name, description, or province..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10"
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

            {/* Category Filters - Desktop */}
            {!isMobile && (
              <div className="flex gap-2 overflow-x-auto pb-2">
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
            )}

            {/* Mobile Filters Dropdown */}
            {isMobile && showFilters && (
              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Filter by Category</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowFilters(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-1">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Found {filteredFavorites.length} {filteredFavorites.length === 1 ? 'place' : 'places'} 
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-lg">
            <p className="text-gray-500">No favorites match your filters</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              variant="secondary"
              size="sm"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFavorites.map(place => (
                <FavoriteCard
                  key={place._id}
                  place={place}
                  onRemove={removeFavorite}
                  onClick={() => handleCardClick(place)}
                  user={user}
                />
              ))}
            </div>

            {/* Results count */}
            <div className="mt-6 text-sm text-gray-500 text-center">
              Showing {filteredFavorites.length} of {favorites.length} favorites
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const FavoriteCard = ({ place, onRemove, onClick, user }) => {
  const [imageError, setImageError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (isRemoving) return;
    
    setIsRemoving(true);
    await onRemove(place._id);
    setIsRemoving(false);
  };

  // Get the first image or use placeholder
  const imageUrl = place.images && place.images.length > 0 
    ? place.images[0] 
    : 'https://images.unsplash.com/photo-1590523741831-0c9b3e201e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="relative h-48 cursor-pointer group" onClick={onClick}>
        {/* Image with loading state */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <img
          src={imageUrl}
          alt={place.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
        
        {imageError && (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Heart className="w-12 h-12 text-white opacity-50" />
          </div>
        )}
        
        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className={`absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg ${
            isRemoving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-lg backdrop-blur">
            {place.category || 'Place'}
          </span>
        </div>

        {/* Sync status badge for logged in users */}
        {user && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 bg-green-500/80 text-white text-xs rounded-lg backdrop-blur flex items-center">
              <Heart className="w-3 h-3 mr-1 fill-current" />
              Synced
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{place.name}</h3>
        
        <p className="text-sm text-gray-500 mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{place.province || 'Sri Lanka'}</span>
        </p>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {place.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600">
              {place.rating || '4.5'}
            </span>
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