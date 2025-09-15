import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TemplateCard } from '../components/TemplateCard';
import { MasonryGrid, useResponsiveColumns } from '../components/MasonryGrid';
import { Button } from '../components/ui/Button';
import { SkeletonGrid } from '../components/LoadingSkeleton';
import { ParallaxSection } from '../components/ParallaxSection';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useSearchContext } from '../contexts/SearchContext';
import { CategoryTransition } from '../components/CategoryTransition';
import { SearchBar } from '../components/SearchBar';
import { apiService } from '../services/api';
import { 
  Home, 
  Sparkles, 
  AlertCircle, 
  Palette, 
  Camera, 
  Zap,
  Star,
  TrendingUp
} from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [displayedTemplates, setDisplayedTemplates] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const columns = useResponsiveColumns();

  // Search functionality from context
  const { 
    selectedCategory, 
    setSelectedCategory, 
    searchResults, 
    isActive: isSearchActive, 
    clearSearch,
    search
  } = useSearchContext();

  const { data: templates, isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ['templates'],
    queryFn: apiService.getTemplates,
    retry: 1,
    retryDelay: 1000,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: apiService.getCategories,
  });

  const { data: templatesByCategory, isLoading: categoryTemplatesLoading } = useQuery({
    queryKey: ['templates', selectedCategory],
    queryFn: () => apiService.getTemplatesByCategory(selectedCategory),
    enabled: selectedCategory !== 'all',
  });

  const isLoading = templatesLoading || categoriesLoading || categoryTemplatesLoading;
  const allTemplates = selectedCategory === 'all' ? templates : templatesByCategory;
  
  // Determine which templates to display
  const templatesToDisplay = isSearchActive ? searchResults : allTemplates;

  // Infinite scroll functionality
  const loadMoreTemplates = useCallback(() => {
    if (allTemplates && allTemplates.length > 0) {
      const itemsPerPage = 8;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newTemplates = allTemplates.slice(startIndex, endIndex);
      
      setDisplayedTemplates(prev => [...prev, ...newTemplates]);
      setPage(prev => prev + 1);
    }
  }, [allTemplates, page]);

  // Initialize displayed templates when data changes
  React.useEffect(() => {
    if (templatesToDisplay && templatesToDisplay.length > 0) {
      setDisplayedTemplates(templatesToDisplay.slice(0, 8));
      setPage(2);
    } else {
      setDisplayedTemplates([]);
      setPage(1);
    }
  }, [templatesToDisplay]);

  // Handle category selection with smooth transitions
  const handleCategorySelect = (category: string) => {
    if (category === selectedCategory) return; // Prevent unnecessary transitions
    
    setIsTransitioning(true);
    
    // Clear search when switching categories for smooth transition
    if (isSearchActive) {
      clearSearch();
    }
    
    setSelectedCategory(category);
    
    // Reset transition state after a short delay
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // Infinite scroll hook
  const { isLoading: isLoadingMore } = useInfiniteScroll(loadMoreTemplates, {
    enabled: !isLoading && displayedTemplates.length > 0
  });

  // Pinterest-style category icons
  const categoryIcons: { [key: string]: React.ReactNode } = {
    'all': <Home className="h-4 w-4" />,
    'artistic': <Palette className="h-4 w-4" />,
    'photography': <Camera className="h-4 w-4" />,
    'vintage': <Star className="h-4 w-4" />,
    'modern': <Zap className="h-4 w-4" />,
    'trending': <TrendingUp className="h-4 w-4" />,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Search Bar */}
      <div className="block sm:hidden bg-white border-b border-gray-200 p-4">
        <SearchBar
          onSearch={search}
          placeholder="Search styles..."
          category={selectedCategory !== 'all' ? selectedCategory : undefined}
        />
      </div>

      {/* Category Transition Indicator */}
      <CategoryTransition 
        isVisible={isTransitioning} 
        category={selectedCategory} 
      />
      
      {/* Sticky Progressive Category Navigation */}
      <motion.div 
        className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-16 z-40 shadow-sm"
        animate={{ 
          backgroundColor: isTransitioning ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
          boxShadow: isTransitioning ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 py-4 overflow-x-auto scrollbar-hide">
            {categories && categories.length > 0 && (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleCategorySelect('all')}
                    className={`flex items-center space-x-2 whitespace-nowrap rounded-full px-4 py-2 transition-all duration-300 ${
                      selectedCategory === 'all' 
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' 
                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50 hover:shadow-sm'
                    }`}
                  >
                    {categoryIcons['all']}
                    <span className="font-medium">Home</span>
                  </Button>
                </motion.div>
                
                {categories.map((category) => (
                  <motion.div
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant={selectedCategory === category ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleCategorySelect(category)}
                      className={`flex items-center space-x-2 whitespace-nowrap rounded-full px-4 py-2 transition-all duration-300 ${
                        selectedCategory === category 
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' 
                          : 'text-gray-700 hover:text-red-600 hover:bg-red-50 hover:shadow-sm'
                      }`}
                    >
                      {categoryIcons[category.toLowerCase()] || <Sparkles className="h-4 w-4" />}
                      <span className="font-medium capitalize">{category}</span>
                    </Button>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State with Skeletons */}
        {(isLoading || isTransitioning) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="py-6"
          >
            <SkeletonGrid count={12} />
          </motion.div>
        )}

        {/* Search Results Indicator */}
        {isSearchActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <p className="text-gray-600">
              {searchResults.length > 0 
                ? `Found ${searchResults.length} results for your search`
                : 'No results found for your search'
              }
            </p>
          </motion.div>
        )}

        {/* Templates Masonry Grid with Parallax */}
        {displayedTemplates && displayedTemplates.length > 0 && !isTransitioning && (
          <ParallaxSection speed={0.1}>
            <motion.div
              key={`${selectedCategory}-${isSearchActive ? 'search' : 'category'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <MasonryGrid columns={columns} gap={16}>
                {displayedTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TemplateCard template={template} />
                  </motion.div>
                ))}
              </MasonryGrid>
            </motion.div>
          </ParallaxSection>
        )}

        {/* Infinite Scroll Sentinel */}
        <div id="infinite-scroll-sentinel" className="h-4" />

        {/* Loading More State */}
        {isLoadingMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-8"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {templatesError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {templatesError.message?.includes('Failed to fetch') 
                ? 'Unable to connect to the server. Please check your internet connection and try again.'
                : templatesError.message || 'We couldn\'t load the templates. Please try again.'
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Switch to mock data as fallback
                  localStorage.setItem('useMockData', 'true');
                  window.location.reload();
                }}
              >
                Use Offline Mode
              </Button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !isTransitioning && !templatesError && (!displayedTemplates || displayedTemplates.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {isSearchActive ? 'No search results found' : 'No styles found'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {isSearchActive 
                ? 'Try adjusting your search terms or browse different categories.'
                : selectedCategory === 'all' 
                  ? 'We\'re working on adding more amazing styles. Check back soon!' 
                  : `No styles found in "${selectedCategory}". Try a different category.`
              }
            </p>
            {isSearchActive && (
              <div className="mt-6">
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
