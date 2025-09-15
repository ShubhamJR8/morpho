import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useSearch } from '../hooks/useSearch';

interface SearchContextType {
  query: string;
  searchResults: any[];
  isLoading: boolean;
  isActive: boolean;
  search: (query: string) => void;
  clearSearch: () => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const searchHook = useSearch({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    limit: 50
  });

  const contextValue: SearchContextType = {
    ...searchHook,
    selectedCategory,
    setSelectedCategory,
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
