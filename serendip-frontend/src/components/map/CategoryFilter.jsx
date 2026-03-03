import React from 'react';
import { Globe } from 'lucide-react';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-4 max-w-xs">
        <h3 className="font-semibold mb-3 text-sm flex items-center">
          <Globe className="w-4 h-4 mr-1" />
          Categories
        </h3>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;