import React, { useEffect, useRef, useState } from 'react';

interface MasonryGridProps {
  children: React.ReactNode[];
  columns?: number;
  gap?: number;
  className?: string;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ 
  children, 
  columns = 4, 
  gap = 16, 
  className = '' 
}) => {
  const [columnHeights, setColumnHeights] = useState<number[]>(new Array(columns).fill(0));
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current) {
        const containerWidth = gridRef.current.offsetWidth;
        const newColumns = Math.max(1, Math.floor(containerWidth / 250)); // 250px min width per column
        if (newColumns !== columns) {
          setColumnHeights(new Array(newColumns).fill(0));
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columns]);

  // These functions are kept for future masonry optimization
  // const getShortestColumn = () => {
  //   return columnHeights.indexOf(Math.min(...columnHeights));
  // };

  // const updateColumnHeights = (index: number, height: number) => {
  //   setColumnHeights(prev => {
  //     const newHeights = [...prev];
  //     newHeights[index] += height + gap;
  //     return newHeights;
  //   });
  // };

  const columnsArray = Array.from({ length: columns }, (_, i) => i);

  return (
    <div 
      ref={gridRef}
      className={`masonry-grid ${className}`}
      style={{ 
        display: 'flex', 
        gap: `${gap}px`,
        alignItems: 'flex-start'
      }}
    >
      {columnsArray.map((columnIndex) => (
        <div 
          key={columnIndex}
          className="masonry-column"
          style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: `${gap}px`
          }}
        >
          {children
            .filter((_, index) => index % columns === columnIndex)
            .map((child, index) => (
              <div
                key={index}
                ref={(el) => {
                  itemRefs.current[index * columns + columnIndex] = el;
                }}
                className="masonry-item"
                style={{ 
                  breakInside: 'avoid',
                  marginBottom: `${gap}px`
                }}
              >
                {child}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

// Responsive Masonry Grid Hook
export const useResponsiveColumns = () => {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(1); // Mobile
      } else if (width < 768) {
        setColumns(2); // Small tablet
      } else if (width < 1024) {
        setColumns(3); // Large tablet
      } else if (width < 1280) {
        setColumns(4); // Desktop
      } else {
        setColumns(5); // Large desktop
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
};
