import { useEffect } from 'react';

interface UseAccessibilityOptions {
  announceChanges?: boolean;
  focusManagement?: boolean;
}

export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const { announceChanges = true, focusManagement = true } = options;

  // Announce changes to screen readers
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges) return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Focus management
  const focusElement = (selector: string) => {
    if (!focusManagement) return;
    
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  };

  // Skip to content functionality
  const skipToContent = () => {
    const main = document.querySelector('main');
    if (main) {
      main.focus();
      main.scrollIntoView();
    }
  };

  // Keyboard navigation helpers
  const handleKeyNavigation = (
    event: KeyboardEvent,
    onEnter?: () => void,
    onEscape?: () => void,
    onArrowUp?: () => void,
    onArrowDown?: () => void
  ) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
    }
  };

  // Add skip to content button
  useEffect(() => {
    const skipButton = document.createElement('button');
    skipButton.textContent = 'Skip to main content';
    skipButton.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
    skipButton.onclick = skipToContent;
    
    document.body.insertBefore(skipButton, document.body.firstChild);
    
    return () => {
      if (document.body.contains(skipButton)) {
        document.body.removeChild(skipButton);
      }
    };
  }, []);

  return {
    announce,
    focusElement,
    skipToContent,
    handleKeyNavigation,
  };
};
