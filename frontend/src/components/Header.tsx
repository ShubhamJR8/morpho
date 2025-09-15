import React from 'react';
import { Link } from 'react-router-dom';
import { User, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/Button';
import { MagneticButton } from './MicroInteractions';
import { SearchBar } from './SearchBar';
import { useApiStatus } from '../hooks/useApiStatus';
import { useSearchContext } from '../contexts/SearchContext';

export const Header: React.FC = () => {
  const { isConnected, isLoading } = useApiStatus();
  const { search, selectedCategory } = useSearchContext();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <SearchBar
              onSearch={search}
              placeholder="Search for styles, templates, or ideas..."
              category={selectedCategory !== 'all' ? selectedCategory : undefined}
            />
          </div>
          
          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <MagneticButton strength={0.2}>
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-200">Morpho</span>
              </Link>
            </MagneticButton>
          </div>
          
          {/* Right: Connection Status & User Icon */}
          <div className="flex-1 flex justify-end items-center space-x-2">
            {/* Connection Status */}
            <div className="flex items-center space-x-1" role="status" aria-label="Connection status">
              {isLoading ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="sr-only">Checking connection...</span>
                </>
              ) : isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" aria-hidden="true" />
                  <span className="sr-only">Connected to server</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" aria-hidden="true" />
                  <span className="sr-only">Disconnected from server</span>
                </>
              )}
            </div>
            
            <MagneticButton strength={0.3}>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-all duration-200"
                aria-label="User menu"
              >
                <User className="h-6 w-6" aria-hidden="true" />
              </Button>
            </MagneticButton>
          </div>
        </div>
      </div>
    </header>
  );
};
