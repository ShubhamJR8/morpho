import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'category';
  count?: number;
}

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  isVisible: boolean;
  onSelect: (suggestion: string) => void;
  onClear: () => void;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  isVisible,
  onSelect,
  onClear,
  className = ''
}) => {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'category':
        return <Search className="h-4 w-4 text-blue-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto ${className}`}
      >
        <div className="p-2">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto text-left hover:bg-gray-50 rounded-xl"
                onClick={() => onSelect(suggestion.text)}
              >
                <div className="flex items-center space-x-3 w-full">
                  {getIcon(suggestion.type)}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{suggestion.text}</div>
                    {suggestion.count && (
                      <div className="text-xs text-gray-500">{suggestion.count} results</div>
                    )}
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
        
        <div className="border-t border-gray-100 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-500 hover:text-gray-700"
            onClick={onClear}
          >
            <X className="h-4 w-4 mr-2" />
            Clear search
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
