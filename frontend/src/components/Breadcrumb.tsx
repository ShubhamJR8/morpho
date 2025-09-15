import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            )}
            {item.path && !item.isActive ? (
              <Link
                to={item.path}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center"
              >
                {index === 0 && <Home className="h-4 w-4 mr-1" />}
                {item.label}
              </Link>
            ) : (
              <span 
                className={`flex items-center ${
                  item.isActive 
                    ? 'text-gray-900 font-medium' 
                    : 'text-gray-500'
                }`}
              >
                {index === 0 && <Home className="h-4 w-4 mr-1" />}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
