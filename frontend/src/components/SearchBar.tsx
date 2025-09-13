import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { SearchSuggestions } from './SearchSuggestions';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'category';
  count?: number;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  category?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search for styles, templates, or ideas...",
  className = '',
  category
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { query, searchResults, isLoading, search, clearSearch } = useSearch({
    category,
    limit: 10
  });

  // Get categories for suggestions
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: apiService.getCategories,
  });

  // Handle search input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    search(value);
    setShowSuggestions(value.length > 0);
    onSearch?.(value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    search(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
    onSearch?.(suggestion);
  };

  // Handle clear search
  const handleClear = () => {
    clearSearch();
    setShowSuggestions(false);
    inputRef.current?.focus();
    onSearch?.('');
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (query.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Generate suggestions
  const generateSuggestions = (): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    
    // Add search results as suggestions
    if (searchResults.length > 0) {
      searchResults.slice(0, 5).forEach((result) => {
        suggestions.push({
          id: `result-${result.id}`,
          text: result.title,
          type: 'trending' as const,
          count: searchResults.length
        });
      });
    }

    // Add category suggestions
    if (categories && query.length > 0) {
      const matchingCategories = categories.filter(cat => 
        cat.toLowerCase().includes(query.toLowerCase())
      );
      matchingCategories.slice(0, 3).forEach(cat => {
        suggestions.push({
          id: `category-${cat}`,
          text: cat,
          type: 'category' as const
        });
      });
    }

    return suggestions;
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm transition-all duration-200 ${
            isFocused ? 'bg-white shadow-md' : ''
          }`}
        />
        
        {query.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
          </motion.button>
        )}
      </div>

      <SearchSuggestions
        suggestions={generateSuggestions()}
        isVisible={showSuggestions && isFocused}
        onSelect={handleSuggestionSelect}
        onClear={handleClear}
      />
    </div>
  );
};
