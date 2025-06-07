import React from 'react';
import { TrendingUp } from 'lucide-react';

const TrendingToggle = ({ timeWindow, onTimeWindowChange, disabled }) => {
  return (
    <div className="flex items-center space-x-2">
      <TrendingUp className="h-4 w-4 text-purple-400" />
      <span className="text-gray-300 text-sm">Trending:</span>
      <div className="flex bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => onTimeWindowChange('day')}
          disabled={disabled}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            timeWindow === 'day'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => onTimeWindowChange('week')}
          disabled={disabled}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            timeWindow === 'week'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          This Week
        </button>
      </div>
    </div>
  );
};

export default TrendingToggle;
