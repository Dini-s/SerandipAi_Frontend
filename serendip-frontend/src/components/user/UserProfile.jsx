// src/components/user/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useResponsive } from '../../hooks/useResponsive';
import { 
  User, Mail, Phone, MapPin, Globe, Calendar, 
  Edit2, Save, X, Camera, Heart, LogOut, Star
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const UserProfile = ({ onLogout }) => {
  const { user, updateUser, logout } = useAuth();
  const { preferredLanguage, setPreferredLanguage, languages } = useLanguage();
  const { isMobile } = useResponsive();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNo: '',
    Gender: '',
    country: '',
    preferredLanguage: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [stats, setStats] = useState({
    favorites: 0,
    placesVisited: 0,
    reviews: 0
  });

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        contactNo: user.contactNo || '',
        Gender: user.Gender || '',
        country: user.country || '',
        preferredLanguage: user.preferredLanguage || preferredLanguage,
      });
      setPreviewImage(user.profileImgUrl?.url || null);
    }
    fetchUserStats();
  }, [user, preferredLanguage]);

  const fetchUserStats = async () => {
    try {
      // Fetch favorites from localStorage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]').length;
      
      // You can replace these with actual API calls when you have endpoints
      setStats({
        favorites,
        placesVisited: 12, // This should come from your API
        reviews: 8 // This should come from your API
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    setProfileImage(file);

    // Auto upload
    await handleImageUpload(file);
  };

  // Upload profile image
  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = getToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/upload-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      if (data) {
        // Update user in context
        updateUser({ profileImgUrl: data.profileImgUrl });
        toast.success('Profile picture updated!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await updateUserProfile(formData);
      if (data.user) {
        updateUser(data.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout?.();
    toast.success('Logged out successfully');
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="primary"
              size="sm"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="secondary"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="primary"
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute -bottom-12 left-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                  {uploadingImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : previewImage ? (
                    <img 
                      src={previewImage} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <User className="w-12 h-12 text-blue-500" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{user.name}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  {isEditing ? (
                    <Input
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleInputChange}
                      placeholder="Enter contact number"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{user.contactNo || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{user.Gender || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  {isEditing ? (
                    <Input
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Enter your country"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>{user.country || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language
                  </label>
                  {isEditing ? (
                    <select
                      name="preferredLanguage"
                      value={formData.preferredLanguage}
                      onChange={(e) => {
                        handleInputChange(e);
                        setPreferredLanguage(e.target.value);
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <span>
                        {languages.find(l => l.code === user.preferredLanguage)?.flag} {' '}
                        {languages.find(l => l.code === user.preferredLanguage)?.name || user.preferredLanguage}
                      </span>
                    </div>
                  )}
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Heart className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.favorites}</p>
                <p className="text-sm text-gray-500">Favorites</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.placesVisited}</p>
                <p className="text-sm text-gray-500">Places Visited</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.reviews}</p>
                <p className="text-sm text-gray-500">Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <Button
            onClick={handleLogout}
            variant="danger"
            className="w-full md:w-auto"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;