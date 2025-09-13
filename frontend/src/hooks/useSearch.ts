import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  category?: string;
  limit?: number;
}

export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    category,
    limit = 20
  } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Search query
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery, category, limit],
    queryFn: () => apiService.searchTemplates(debouncedQuery, category, limit),
    enabled: debouncedQuery.length >= minQueryLength,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const hasResults = searchResults && searchResults.length > 0;
  const isSearching = query.length >= minQueryLength && isLoading;
  const showNoResults = query.length >= minQueryLength && !isLoading && !hasResults;

  return {
    query,
    debouncedQuery,
    searchResults: searchResults || [],
    isLoading: isSearching,
    error,
    hasResults,
    showNoResults,
    search,
    clearSearch,
    isActive: query.length >= minQueryLength
  };
};
