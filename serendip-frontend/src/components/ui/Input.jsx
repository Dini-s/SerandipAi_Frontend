// src/components/ui/Input.jsx
import React from 'react';

const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors';
  
  const stateStyles = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${baseStyles} ${stateStyles} ${className} ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;