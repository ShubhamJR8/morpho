import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonCardProps {
  height?: string;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  height = 'h-64', 
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-white rounded-3xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Image skeleton */}
      <div className={`${height} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 relative overflow-hidden`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear'
          }}
        />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
              delay: 0.2
            }}
          />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'linear',
                delay: 0.4
              }}
            />
          </div>
          <div className="h-3 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'linear',
                delay: 0.6
              }}
            />
          </div>
        </div>
        
        {/* Category skeleton */}
        <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
              delay: 0.8
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <SkeletonCard height={index % 3 === 0 ? 'h-64' : index % 3 === 1 ? 'h-80' : 'h-72'} />
        </motion.div>
      ))}
    </div>
  );
};
