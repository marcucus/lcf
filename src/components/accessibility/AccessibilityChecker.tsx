'use client';

import { useEffect } from 'react';

/**
 * Accessibility Checker Component
 * 
 * This component runs axe-core accessibility audits in development mode only.
 * It logs any accessibility violations to the console.
 * 
 * WCAG 2.1 AA compliance checking.
 */
export function AccessibilityChecker() {
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Dynamically import axe-core only in development
    import('@axe-core/react')
      .then((axe) => {
        const React = require('react');
        const ReactDOM = require('react-dom');
        
        // Initialize axe with custom configuration
        axe.default(React, ReactDOM, 1000, {
          rules: [
            {
              id: 'color-contrast',
              enabled: true,
            },
            {
              id: 'label',
              enabled: true,
            },
            {
              id: 'button-name',
              enabled: true,
            },
            {
              id: 'link-name',
              enabled: true,
            },
          ],
        });
        
        console.log('♿ Accessibility checker enabled in development mode');
      })
      .catch((error) => {
        console.warn('Failed to load accessibility checker:', error);
      });
  }, []);

  // This component doesn't render anything
  return null;
}
