# PWA Testing Guide - LCF Auto Performance

## Overview

This guide provides step-by-step instructions for testing the Progressive Web App features implemented in the LCF Auto Performance application.

## Prerequisites

- Build the application: `npm run build`
- Start the production server: `npm start`
- Use a modern browser (Chrome, Edge, Firefox, or Safari)
- HTTPS connection (Firebase Hosting provides this automatically)

## Test 1: Verify Manifest File

### Steps:
1. Open the application in Chrome/Edge
2. Open DevTools (F12)
3. Go to the **Application** tab
4. Click **Manifest** in the left sidebar

### Expected Results:
- ✅ Manifest is loaded and displayed
- ✅ App Name: "LCF Auto Performance"
- ✅ Short Name: "LCF Auto"
- ✅ Theme Color: #1CCEFF
- ✅ Display: standalone
- ✅ All 8 icons (72x72 to 512x512) are listed and accessible

### Screenshot locations:
- Manifest panel shows all properties
- Icons section shows 8 icons with proper sizes

---

## Test 2: Verify Service Worker Registration

### Steps:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in the left sidebar

### Expected Results:
- ✅ Service worker is registered for the application
- ✅ Status shows "activated and running"
- ✅ Source: `/sw.js`
- ✅ No errors in console

### Common Issues:
- ❌ If not showing: Hard refresh (Ctrl+Shift+R)
- ❌ If error: Check console for details
- ❌ In development mode: Service worker is disabled (expected)

---

## Test 3: Install PWA on Desktop

### Chrome/Edge (Windows/Mac/Linux):

#### Steps:
1. Visit the application URL
2. Look for the install icon in the address bar (➕ or 📱)
3. Click the install icon
4. Click **Install** in the popup dialog

#### Expected Results:
- ✅ Install prompt appears
- ✅ App name and icon are displayed in prompt
- ✅ After installing, app opens in standalone window
- ✅ App appears in Start Menu/Applications folder
- ✅ Desktop shortcut created (if enabled)

#### Verification:
- Open the installed app
- Check that address bar is hidden (standalone mode)
- Verify app icon in taskbar/dock

---

## Test 4: Install PWA on Mobile

### Android (Chrome):

#### Steps:
1. Open the application in Chrome
2. Tap the menu icon (⋮) in top-right
3. Select **"Add to Home screen"** or **"Install app"**
4. Confirm installation

#### Expected Results:
- ✅ Install prompt appears with app icon
- ✅ App is added to home screen
- ✅ Tapping icon opens in standalone mode
- ✅ Splash screen shows (with theme color)

### iOS (Safari):

#### Steps:
1. Open the application in Safari
2. Tap the Share button (□↑)
3. Scroll and tap **"Add to Home Screen"**
4. Tap **"Add"** in top-right

#### Expected Results:
- ✅ App icon preview shows
- ✅ App is added to home screen
- ✅ Opening app hides Safari UI
- ✅ App runs in standalone mode

---

## Test 5: Offline Functionality

### Test Cached Pages:

#### Steps:
1. Visit several pages in the app:
   - Home page
   - Services page
   - Contact page
   - About page
2. Open DevTools (F12)
3. Go to **Network** tab
4. Change throttling to **"Offline"**
5. Try navigating back to visited pages

#### Expected Results:
- ✅ Previously visited pages load from cache
- ✅ Images and styles are displayed correctly
- ✅ Navigation works for cached pages
- ✅ No "no internet" browser error

### Test Offline Fallback:

#### Steps:
1. In offline mode (from above)
2. Try to visit a page NOT yet visited
3. Or try to access appointments/vehicles

#### Expected Results:
- ✅ Offline fallback page (/offline) is shown
- ✅ Page displays "Mode Hors Ligne" heading
- ✅ Lists available features (cached pages)
- ✅ Lists unavailable features (appointments, etc.)
- ✅ "Retry" button is present

---

## Test 6: Cache Strategy Verification

### Steps:
1. Open DevTools > **Application** tab
2. Expand **Cache Storage** in left sidebar
3. Examine different cache entries

### Expected Cache Names:
- ✅ `google-fonts-webfonts`
- ✅ `google-fonts-stylesheets`
- ✅ `static-font-assets`
- ✅ `static-image-assets`
- ✅ `next-image`
- ✅ `static-js-assets`
- ✅ `static-style-assets`
- ✅ `next-data`
- ✅ `static-data-assets`
- ✅ `others`
- ✅ `start-url`

### Verify Cache Contents:
- Click on each cache to see cached files
- Verify appropriate files are cached
- Check that API routes are NOT cached

---

## Test 7: Performance Benefits

### Test Initial Load:

#### Steps:
1. Clear all site data in DevTools
2. Hard refresh (Ctrl+Shift+R)
3. Note the load time

### Test Subsequent Loads:

#### Steps:
1. Navigate away and come back
2. Note the load time

#### Expected Results:
- ✅ Subsequent loads are significantly faster
- ✅ Images load instantly from cache
- ✅ Fonts and CSS load instantly
- ✅ Overall improved performance

---

## Test 8: Service Worker Update

### Steps:
1. Make a small change to the app (e.g., change text)
2. Build: `npm run build`
3. Deploy or restart server
4. Reload the app in browser (may need hard refresh)

#### Expected Results:
- ✅ Service worker detects new version
- ✅ Old service worker becomes "waiting"
- ✅ New service worker activates (may require closing/reopening)
- ✅ Updated content is visible after activation

---

## Test 9: Mobile-Specific Features

### Test Splash Screen (Android):

#### Steps:
1. Install app on Android
2. Close the app completely
3. Tap app icon to reopen

#### Expected Results:
- ✅ Splash screen appears briefly
- ✅ Background color matches theme (#1CCEFF or white)
- ✅ App icon is displayed
- ✅ Smooth transition to app

### Test Orientation Lock:

#### Steps:
1. Open installed app on mobile
2. Rotate device

#### Expected Results:
- ✅ App prefers portrait orientation
- ✅ Still allows landscape if needed
- ✅ Responsive design works in both orientations

---

## Test 10: Lighthouse PWA Audit

### Steps:
1. Open DevTools
2. Go to **Lighthouse** tab
3. Select "Progressive Web App" category
4. Click **"Analyze page load"**

### Expected Results:
- ✅ Score: 90+ out of 100
- ✅ ✓ Installable
- ✅ ✓ Provides a valid manifest
- ✅ ✓ Registers a service worker
- ✅ ✓ Responds with 200 when offline
- ✅ ✓ Uses HTTPS
- ✅ ✓ Has a viewport meta tag
- ✅ ✓ Content is sized correctly for viewport

---

## Troubleshooting Common Issues

### Issue: Service Worker Not Registering

**Solutions:**
- Clear browser cache and service workers
- Hard refresh (Ctrl+Shift+R)
- Check console for errors
- Verify HTTPS is enabled
- Ensure not in development mode

### Issue: Install Button Not Appearing

**Solutions:**
- Verify manifest.json is accessible
- Check that all required manifest fields are present
- Ensure icons are accessible
- Use HTTPS (or localhost)
- Try in Chrome/Edge (best PWA support)
- Clear site data and reload

### Issue: Offline Mode Not Working

**Solutions:**
- Visit pages before going offline (they need to be cached first)
- Verify service worker is active
- Check cache storage in DevTools
- Ensure proper cache strategies are configured
- Hard refresh to update service worker

### Issue: Updates Not Applying

**Solutions:**
- Close all tabs of the app
- Hard refresh (Ctrl+Shift+R)
- Unregister service worker in DevTools:
  - Application > Service Workers > Unregister
- Clear site data and reload

### Issue: Icons Not Loading

**Solutions:**
- Verify icons exist in `/public/icons/`
- Check manifest.json icon paths
- Ensure icons are correct size
- Regenerate icons: `npm run generate-icons`

---

## Performance Benchmarks

### Target Metrics (from specifications):

- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **FID (First Input Delay)**: < 100ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅

### Test with Lighthouse:
- Performance score should be > 90
- PWA score should be > 90
- Best Practices score should be > 90

---

## Testing Checklist

Use this checklist for complete PWA validation:

- [ ] Manifest loads correctly
- [ ] Service worker registers and activates
- [ ] App can be installed on desktop
- [ ] App can be installed on mobile (Android)
- [ ] App can be installed on mobile (iOS)
- [ ] Offline mode works for cached pages
- [ ] Offline fallback page appears for uncached pages
- [ ] All cache strategies work as expected
- [ ] Performance improves on subsequent loads
- [ ] Service worker updates when app is redeployed
- [ ] Splash screen works on mobile
- [ ] Lighthouse PWA audit passes (90+)
- [ ] Works in standalone mode (no browser UI)
- [ ] Icons display correctly in all contexts
- [ ] Theme color applies correctly

---

## Additional Testing Tools

### Online Tools:
- **Lighthouse**: Built into Chrome DevTools
- **PWA Builder**: https://www.pwabuilder.com/
- **Web.dev Measure**: https://web.dev/measure/

### Browser Extensions:
- **Lighthouse**: Chrome extension for quick audits
- **PWA Analyzer**: Detailed PWA analysis

### Mobile Testing:
- **Chrome DevTools Remote Debugging**: Test on real Android devices
- **BrowserStack**: Test on multiple devices/browsers
- **Safari Web Inspector**: Test on real iOS devices

---

## Next Steps After Testing

1. **Deploy to Production**: Deploy to Firebase Hosting with HTTPS
2. **Monitor**: Use Firebase Analytics to track PWA installs
3. **Iterate**: Based on user feedback, improve caching strategies
4. **Enhance**: Consider adding push notifications or background sync
5. **Document**: Keep this testing guide updated with new features

---

## Support

For issues or questions about PWA features:
1. Check console for errors
2. Review PWA.md for detailed documentation
3. Check Next PWA documentation: https://github.com/shadowwalker/next-pwa
4. Review browser console and Application tab in DevTools

---

**Last Updated**: November 2024  
**Version**: 1.0
