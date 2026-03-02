import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Map, Heart, User, Home, Search } from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            isActive('/') ? 'text-primary-500' : 'text-gray-600'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          to="/search"
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            isActive('/search') ? 'text-primary-500' : 'text-gray-600'
          }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Search</span>
        </Link>

        <Link
          to="/map"
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            isActive('/map') ? 'text-primary-500' : 'text-gray-600'
          }`}
        >
          <Map className="w-6 h-6" />
          <span className="text-xs mt-1">Map</span>
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              to="/favorites"
              className={`flex flex-col items-center justify-center flex-1 py-2 ${
                isActive('/favorites') ? 'text-primary-500' : 'text-gray-600'
              }`}
            >
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">Favorites</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center flex-1 py-2 ${
                isActive('/profile') ? 'text-primary-500' : 'text-gray-600'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center justify-center flex-1 py-2 ${
              isActive('/login') || isActive('/register') ? 'text-primary-500' : 'text-gray-600'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;