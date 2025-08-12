import { useEffect, useCallback, useState } from 'react';

const useAccessibility = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  // Check for user preferences
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(contrastQuery.matches);

    const handleContrastChange = (e) => setIsHighContrast(e.matches);
    contrastQuery.addEventListener('change', handleContrastChange);

    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }

    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    if (savedHighContrast === 'true') {
      setIsHighContrast(true);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;

    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (isReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    root.setAttribute('data-font-size', fontSize);
  }, [isHighContrast, isReducedMotion, fontSize]);

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((event, onEnter, onEscape) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onEnter?.();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onEscape?.();
    }
  }, []);

  // Focus management
  const focusElement = useCallback((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
    }
  }, []);

  // Announce to screen readers
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Toggle functions
  const toggleHighContrast = useCallback(() => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    localStorage.setItem('accessibility-high-contrast', newValue.toString());
    announce(newValue ? 'High contrast enabled' : 'High contrast disabled');
  }, [isHighContrast, announce]);

  const changeFontSize = useCallback((size) => {
    setFontSize(size);
    localStorage.setItem('accessibility-font-size', size);
    announce(`Font size changed to ${size}`);
  }, [announce]);

  return {
    // State
    isHighContrast,
    isReducedMotion,
    fontSize,
    
    // Functions
    handleKeyboardNavigation,
    focusElement,
    announce,
    toggleHighContrast,
    changeFontSize,
    
    // Accessibility props generators
    getButtonProps: (onClick, label) => ({
      onClick,
      onKeyDown: (e) => handleKeyboardNavigation(e, onClick),
      'aria-label': label,
      role: 'button',
      tabIndex: 0,
    }),
    
    getLinkProps: (href, label) => ({
      href,
      'aria-label': label,
      target: href.startsWith('http') ? '_blank' : undefined,
      rel: href.startsWith('http') ? 'noopener noreferrer' : undefined,
    }),
    
    getImageProps: (alt, isDecorative = false) => ({
      alt: isDecorative ? '' : alt,
      role: isDecorative ? 'presentation' : undefined,
      'aria-hidden': isDecorative ? 'true' : undefined,
    }),
  };
};

export default useAccessibility;
