import React from 'react';
import { motion, type PanInfo } from 'framer-motion';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = ''
}) => {
  const handleDragEnd = (_event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = 500;

    if (info.offset.x > threshold || info.velocity.x > velocity) {
      onSwipeRight?.();
    } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      onSwipeLeft?.();
    } else if (info.offset.y > threshold || info.velocity.y > velocity) {
      onSwipeDown?.();
    } else if (info.offset.y < -threshold || info.velocity.y < -velocity) {
      onSwipeUp?.();
    }
  };

  return (
    <motion.div
      className={className}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, rotate: 2 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => void;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (info.offset.y > 100 && !isRefreshing) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 2000);
    }
  };

  return (
    <motion.div
      className={className}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.2, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ y: isRefreshing ? 50 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {isRefreshing && (
        <motion.div
          className="flex justify-center items-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
      {children}
    </motion.div>
  );
};

interface PinchZoomProps {
  children: React.ReactNode;
  className?: string;
  minScale?: number;
  maxScale?: number;
}

export const PinchZoom: React.FC<PinchZoomProps> = ({
  children,
  className = '',
  minScale = 0.5,
  maxScale = 2
}) => {
  return (
    <motion.div
      className={className}
      drag
      dragMomentum={false}
      whileDrag={{ cursor: 'grabbing' }}
      whileHover={{ cursor: 'grab' }}
      style={{
        scale: 1,
      }}
      onWheel={(e) => {
        e.preventDefault();
        const scale = Math.max(minScale, Math.min(maxScale, 1 + e.deltaY * -0.01));
        e.currentTarget.style.transform = `scale(${scale})`;
      }}
    >
      {children}
    </motion.div>
  );
};
