'use client';

import { useEffect } from 'react';

/**
 * Web Vitals Performance Monitor
 * Tracks and logs Core Web Vitals metrics for performance monitoring
 * Reference: Section 2.2 (Performance) - specifications.md
 */

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Get rating for a metric based on Core Web Vitals thresholds
 */
function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    // Largest Contentful Paint (LCP) - Target: < 2.5s
    LCP: { good: 2500, poor: 4000 },
    // First Input Delay (FID) - Target: < 100ms
    FID: { good: 100, poor: 300 },
    // Cumulative Layout Shift (CLS)
    CLS: { good: 0.1, poor: 0.25 },
    // First Contentful Paint (FCP)
    FCP: { good: 1800, poor: 3000 },
    // Time to First Byte (TTFB)
    TTFB: { good: 800, poor: 1800 },
    // Interaction to Next Paint (INP)
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Send metric to analytics (can be extended to send to actual analytics service)
 */
function sendToAnalytics(metric: WebVitalsMetric) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `${emoji} [Web Vitals] ${metric.name}:`,
      {
        value: `${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'}`,
        rating: metric.rating,
        id: metric.id,
      }
    );
  }

  // In production, this could send to analytics service like Google Analytics, Vercel Analytics, etc.
  // Example: window.gtag?.('event', metric.name, { value: metric.value, metric_rating: metric.rating });
}

/**
 * Report Web Vitals metric
 */
function reportWebVitals(metric: { name: string; value: number; delta: number; id: string }) {
  const rating = getMetricRating(metric.name, metric.value);
  const webVitalsMetric: WebVitalsMetric = {
    ...metric,
    rating,
  };
  sendToAnalytics(webVitalsMetric);
}

/**
 * WebVitalsMonitor Component
 * Automatically tracks and reports Core Web Vitals when mounted
 */
export default function WebVitalsMonitor() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Dynamically import web-vitals to avoid SSR issues
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      // Track Core Web Vitals
      onLCP(reportWebVitals);
      onCLS(reportWebVitals);
      onFCP(reportWebVitals);
      onTTFB(reportWebVitals);
      onINP(reportWebVitals);
    });
  }, []);

  // This component doesn't render anything
  return null;
}

/**
 * Export utility function for manual metric reporting
 */
export { reportWebVitals };
