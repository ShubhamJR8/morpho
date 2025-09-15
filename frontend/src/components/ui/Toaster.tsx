import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                'flex items-start space-x-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
                {
                  'bg-green-50/95 border-green-200 text-green-800': toast.type === 'success',
                  'bg-red-50/95 border-red-200 text-red-800': toast.type === 'error',
                  'bg-blue-50/95 border-blue-200 text-blue-800': toast.type === 'info',
                  'bg-yellow-50/95 border-yellow-200 text-yellow-800': toast.type === 'warning',
                  'bg-white/95 border-gray-200': !toast.type,
                }
              )}
            >
              {getIcon(toast.type)}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <div className="font-semibold text-sm">{toast.title}</div>
                )}
                {toast.description && (
                  <div className="text-sm opacity-90 mt-1">{toast.description}</div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
