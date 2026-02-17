# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented for LCF Auto Performance web application, following Section 2.2 (Performance) of the specifications.

## Core Web Vitals Targets

Based on specifications.md Section 2.2, the application targets:

- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100 milliseconds
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8 seconds

## Implemented Optimizations

### 1. Image Optimization

#### Modern Format Support
- WebP format conversion for all images (85% quality)
- AVIF format support in Next.js configuration
- Automated image optimization script: `npm run optimize-images`

#### Lazy Loading
- All images use Next.js Image component with automatic lazy loading
- Priority loading for hero/LCP images
- Optimized image sizes for different viewports

#### Benefits
- 24-91% file size reduction
- Faster page load times
- Reduced bandwidth usage

### 2. Font Optimization

#### Preconnect to Font Providers
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

#### Font Display Strategy
- `font-display: swap` to prevent invisible text during font loading
- Inter and Poppins fonts with optimized weight ranges

### 3. Resource Hints

#### DNS Prefetch
- Google Maps API
- External resources

#### Benefits
- Reduced DNS lookup time
- Faster resource loading
- Improved Time to First Byte (TTFB)

### 4. Service Worker Caching

#### Strategy by Resource Type

| Resource Type | Strategy | Cache Duration | Max Entries |
|--------------|----------|----------------|-------------|
| Modern Images (WebP/AVIF) | CacheFirst | 30 days | 100 |
| Google Fonts | CacheFirst | 365 days | 10 |
| JavaScript/CSS | StaleWhileRevalidate | 24 hours | 50 |
| Next.js Images | CacheFirst | 30 days | 100 |
| Pages | NetworkFirst | 24 hours | 50 |
| API Routes | Never cached | - | - |

#### Benefits
- Offline functionality
- Reduced server requests
- Faster repeat visits
- Better user experience on slow connections

### 5. Next.js Configuration

#### Production Optimizations
```typescript
{
  compress: true,                      // Gzip compression
  productionBrowserSourceMaps: false,  // Smaller production bundles
  experimental: {
    optimizeCss: true,                 // CSS optimization
  },
  images: {
    formats: ['image/avif', 'image/webp'],  // Modern formats
    minimumCacheTTL: 60,                    // Cache optimization
  }
}
```

### 6. CSS Optimization

#### Critical CSS
- Inline critical CSS for above-the-fold content
- Async loading of non-critical styles
- Tailwind CSS purging of unused styles

#### Animation Performance
- Hardware-accelerated animations using transform and opacity
- RequestAnimationFrame for smooth animations
- Intersection Observer for scroll-based animations

### 7. JavaScript Optimization

#### Code Splitting
- Automatic route-based code splitting by Next.js
- Dynamic imports for heavy components
- Tree shaking to remove unused code

#### Bundle Size Management
- Production source maps disabled
- Minification and compression enabled
- Module preloading for critical paths

### 8. Performance Monitoring

#### Web Vitals Tracking
- Real-time Core Web Vitals monitoring
- Development console logging with color-coded ratings
- Ready for integration with analytics services

```typescript
// Track all Core Web Vitals
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)
- INP (Interaction to Next Paint)
```

## Testing Tools

### Recommended Tools for Performance Audits

1. **Lighthouse**
   ```bash
   # Chrome DevTools > Lighthouse tab
   # Or use CLI:
   npx lighthouse https://your-site.com --view
   ```

2. **PageSpeed Insights**
   - Visit: https://pagespeed.web.dev/
   - Provides both lab and field data
   - Tests on mobile and desktop

3. **WebPageTest**
   - Visit: https://www.webpagetest.org/
   - Advanced testing options
   - Filmstrip view
   - Connection throttling

4. **Chrome DevTools**
   - Performance panel for recording
   - Network panel for resource analysis
   - Coverage tool for unused code
   - Rendering panel for paint flashing

## Build and Optimization Commands

```bash
# Install dependencies
npm install

# Optimize all images
npm run optimize-images

# Build for production (optimized)
npm run build

# Start production server
npm start

# Development with hot reload
npm run dev
```

## Best Practices

### For Developers

1. **Images**
   - Always use Next.js Image component
   - Run `npm run optimize-images` after adding new images
   - Use appropriate sizes and srcset
   - Add width and height to prevent CLS

2. **Fonts**
   - Limit font weights and variations
   - Use system fonts as fallbacks
   - Avoid FOUT (Flash of Unstyled Text)

3. **JavaScript**
   - Use dynamic imports for large libraries
   - Avoid blocking the main thread
   - Debounce/throttle expensive operations
   - Use React.memo for expensive components

4. **CSS**
   - Minimize use of custom CSS
   - Leverage Tailwind's utility classes
   - Avoid layout-shifting animations
   - Use transform and opacity for animations

5. **Third-Party Scripts**
   - Load asynchronously when possible
   - Use facade pattern for heavy embeds
   - Monitor impact on performance

## Performance Budget

### Target Metrics
- Total page weight: < 1.5 MB
- JavaScript bundle: < 300 KB
- First load JS: < 200 KB
- Time to Interactive: < 3.5 seconds
- Speed Index: < 3.0 seconds

## Monitoring in Production

### Setup Analytics Integration

To enable production monitoring, integrate with analytics services:

```typescript
// Example: Google Analytics 4
function sendToAnalytics(metric: WebVitalsMetric) {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', metric.name, {
      value: metric.value,
      metric_rating: metric.rating,
      metric_id: metric.id,
    });
  }
}
```

### Regular Performance Reviews

1. Weekly Lighthouse audits
2. Monitor Core Web Vitals in Search Console
3. Review field data from real users
4. Set up alerts for performance degradation

## Troubleshooting

### Common Performance Issues

**Slow LCP**
- Check image optimization
- Verify resource priorities
- Check server response time
- Review critical rendering path

**High FID/INP**
- Reduce main thread work
- Split long tasks
- Optimize event handlers
- Review third-party scripts

**CLS Issues**
- Add dimensions to images/videos
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS transforms instead of layout changes

## References

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- Specifications: Section 2.2 (Performance)

## Changelog

### Version 1.0 - Initial Implementation
- Image optimization with WebP conversion
- Font loading optimization
- Service worker caching strategies
- Performance monitoring setup
- Next.js configuration optimization
- Resource hints and preconnect
- Documentation
