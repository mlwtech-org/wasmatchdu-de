import { useEffect, useCallback } from 'react';

export const useSpatialNavigation = () => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!keys.includes(e.key)) return;

    // Prevent default scrolling for arrow keys if we're handling spatial navigation
    e.preventDefault();

    const focusableSelector = '[data-focusable="true"]';
    const focusableElements = Array.from(document.querySelectorAll(focusableSelector)) as HTMLElement[];
    
    if (focusableElements.length === 0) return;

    const currentFocus = document.activeElement as HTMLElement;
    
    // If nothing is focused, or the focused element isn't one of our focusables, focus the first one
    if (!currentFocus || !currentFocus.matches(focusableSelector)) {
      focusableElements[0].focus();
      return;
    }

    const currentRect = currentFocus.getBoundingClientRect();
    let bestMatch: HTMLElement | null = null;
    let minDistance = Number.MAX_VALUE;

    focusableElements.forEach((el) => {
      if (el === currentFocus) return;

      const rect = el.getBoundingClientRect();
      let isValidDirection = false;
      let distance = 0;

      // Center points for calculating distance
      const currentCenterX = currentRect.left + currentRect.width / 2;
      const currentCenterY = currentRect.top + currentRect.height / 2;
      const elCenterX = rect.left + rect.width / 2;
      const elCenterY = rect.top + rect.height / 2;

      const dx = elCenterX - currentCenterX;
      const dy = elCenterY - currentCenterY;

      switch (e.key) {
        case 'ArrowUp':
          isValidDirection = dy < 0 && Math.abs(dy) > Math.abs(dx) * 0.5;
          break;
        case 'ArrowDown':
          isValidDirection = dy > 0 && Math.abs(dy) > Math.abs(dx) * 0.5;
          break;
        case 'ArrowLeft':
          isValidDirection = dx < 0 && Math.abs(dx) > Math.abs(dy) * 0.5;
          break;
        case 'ArrowRight':
          isValidDirection = dx > 0 && Math.abs(dx) > Math.abs(dy) * 0.5;
          break;
      }

      if (isValidDirection) {
        // Euclidean distance
        distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = el;
        }
      }
    });

    if (bestMatch) {
      (bestMatch as HTMLElement).focus();
      (bestMatch as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
