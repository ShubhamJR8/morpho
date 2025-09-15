import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LazyImage } from './LazyImage';
import { RippleButton } from './MicroInteractions';
import { SwipeableCard } from './GestureAnimations';
import { useAccessibility } from '../hooks/useAccessibility';
import { Heart, Share2, MoreHorizontal, Sparkles } from 'lucide-react';
import type { Template } from '../services/api';

interface TemplateCardProps {
  template: Omit<Template, 'prompt'>;
}

export const TemplateCard: React.FC<TemplateCardProps> = memo(({ template }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { announce } = useAccessibility();

  return (
    <SwipeableCard
      onSwipeLeft={() => console.log('Swiped left')}
      onSwipeRight={() => console.log('Swiped right')}
      className="group relative"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Pinterest-style Pin with 3D Effect */}
        <div 
          className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] border border-gray-100/50"
          role="article"
          aria-label={`Template: ${template.title}`}
          tabIndex={0}
        >
        {/* Image Container with 3D Effect */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <Link to={`/edit/${template.id}`}>
            <LazyImage
              src={template.previewUrl}
              alt={template.title}
              className="w-full object-cover transition-transform duration-300 group-hover:scale-110"
              fallbackText={template.title}
              style={{ aspectRatio: 'auto' }}
            />
          </Link>
          
          {/* Hover Actions Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showActions ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-3 right-3 flex space-x-2"
          >
            <RippleButton
              onClick={() => {
                setIsLiked(!isLiked);
                announce(isLiked ? 'Removed from favorites' : 'Added to favorites');
              }}
              className="h-9 w-9 p-0 bg-white/95 hover:bg-white shadow-lg hover:shadow-xl rounded-full border border-gray-200/50"
              aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart 
                className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
                aria-hidden="true"
              />
            </RippleButton>
            
            <RippleButton 
              className="h-9 w-9 p-0 bg-white/95 hover:bg-white shadow-lg hover:shadow-xl rounded-full border border-gray-200/50"
              aria-label="Share template"
            >
              <Share2 className="h-4 w-4 text-gray-700" aria-hidden="true" />
            </RippleButton>
            
            <RippleButton 
              className="h-9 w-9 p-0 bg-white/95 hover:bg-white shadow-lg hover:shadow-xl rounded-full border border-gray-200/50"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-700" aria-hidden="true" />
            </RippleButton>
          </motion.div>

          {/* Use This Style Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showActions ? 1 : 0, y: showActions ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-3 left-3 right-3"
          >
            <Link to={`/edit/${template.id}`}>
              <RippleButton 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-full shadow-lg hover:shadow-xl border border-red-500/20"
                aria-label={`Use ${template.title} style for editing`}
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Use This Style
              </RippleButton>
            </Link>
          </motion.div>
        </div>
        
        {/* Pin Content with Enhanced Styling */}
        <div className="p-4 bg-gradient-to-b from-white to-gray-50/50">
          <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight">
            {template.title}
          </h3>
          
          {template.description && (
            <p className="text-gray-600 text-xs line-clamp-2 mb-3 leading-relaxed">
              {template.description}
            </p>
          )}
          
          {template.category && (
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200/50 shadow-sm">
                {template.category}
              </span>
            </div>
          )}
        </div>
      </div>
      </motion.div>
    </SwipeableCard>
  );
});
