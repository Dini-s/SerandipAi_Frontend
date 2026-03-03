import React from 'react';
import { X } from 'lucide-react';

const MobileFilterPanel = ({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  onProvinceChange, 
  onClose 
}) => {
  const provinces = [
    'Central', 'Northern', 'Eastern', 'Western', 'Southern', 
    'Uva', 'Sabaragamuwa', 'North Western', 'North Central'
  ];

  return (
    <div className="absolute inset-0 z-20 bg-black/50" onClick={onClose}>
      <div 
        className="absolute left-0 top-0 bottom-0 w-64 bg-white/95 backdrop-blur overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.id);
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    activeCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Provinces */}
          <div>
            <h4 className="text-sm font-medium mb-2">Provinces</h4>
            <div className="space-y-2">
              {provinces.map((province) => (
                <button
                  key={province}
                  onClick={() => {
                    onProvinceChange(province);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                >
                  {province}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterPanel;