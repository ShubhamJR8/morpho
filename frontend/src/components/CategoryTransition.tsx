import React from 'react';
import { motion } from 'framer-motion';

interface CategoryTransitionProps {
  isVisible: boolean;
  category: string;
}

export const CategoryTransition: React.FC<CategoryTransitionProps> = ({
  isVisible,
  category
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-0 left-0 right-0 bg-red-50 border-b border-red-200 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
          />
          <span className="text-sm text-red-700 font-medium">
            Loading {category === 'all' ? 'all styles' : `${category} styles`}...
          </span>
        </div>
      </div>
    </motion.div>
  );
};
