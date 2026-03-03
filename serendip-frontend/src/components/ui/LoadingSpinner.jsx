// src/components/ui/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizes = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Spinner */}
        <div className={`
          animate-spin rounded-full 
          border-blue-200 border-t-blue-500
          ${sizes[size]}
        `}></div>
        
        {/* Optional inner dot */}
        {size !== 'sm' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Message */}
      {message && (
        <p className={`mt-3 text-gray-600 ${textSizes[size]}`}>{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;