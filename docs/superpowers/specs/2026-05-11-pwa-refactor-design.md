# PWA Refactor Design Spec

## Goal

Convert the Reflecta React frontend into an installable Progressive Web App. This allows users to add the app to their home screen on iOS and Android without an Apple Developer certificate or app store submission.

## Scope

**Install-only PWA.** The app shell (HTML, CSS, JS) is cached so the app launches instantly from the home screen and looks native. All data operations (journal entries, goals, analytics, chatbot) still require the backend to be reachable. No offline data creation or sync.

## Hosting Assumption

The app will be deployed behind HTTPS on a public URL. This is required for service worker registration and PWA install prompts on all platforms.

## Architecture Decisions

- **Approach:** Use CRA's built-in PWA support (Workbox precaching via `cra-template-pwa` pattern)
- **Why not custom Workbox:** Install-only scope doesn't need custom caching strategies. CRA's template handles app shell precaching out of the box.
- **Service worker strategy:** Precache all static build assets. No runtime caching of API responses.

## Components

### 1. Web App Manifest

File: `frontend/public/manifest.json`

```json
{
  "name": "Reflecta - Smart Journaling",
  "short_name": "Reflecta",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

The `theme_color` uses blue-600 (`#2563eb`) which matches the app's primary active/accent color from `tailwind.config.js`.

### 2. Service Worker

Two new files, both following the standard CRA PWA pattern:

**`frontend/src/service-worker.js`**
- Uses Workbox's `precacheAndRoute` to cache all build-time static assets
- Includes a `NavigationRoute` that serves the cached `index.html` for all navigation requests (SPA behavior)
- Listens for the `message` event with type `SKIP_WAITING` to allow immediate activation of new service worker versions

**`frontend/src/serviceWorkerRegistration.js`**
- Handles service worker registration lifecycle
- Provides `register()` and `unregister()` exports
- Includes update detection: when a new service worker is available, it can notify the app (for a future "update available" toast if desired)

**Registration in `frontend/src/index.js`:**
```js
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// ... existing code ...
serviceWorkerRegistration.register();
```

### 3. iOS-Specific Meta Tags

Added to `frontend/public/index.html` `<head>`:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Reflecta" />
<link rel="apple-touch-icon" href="%PUBLIC_URL%/icons/icon-192x192.png" />
```

The `apple-mobile-web-app-status-bar-style` of `default` shows a standard (non-transparent) status bar. This is the safest choice - `black-translucent` can cause content to render behind the status bar without proper safe-area handling.

### 4. Icons

Source: `icon.png` in repo root (112x112 RGBA PNG).

Generated sizes:
- `frontend/public/icons/icon-192x192.png` - upscaled from source
- `frontend/public/icons/icon-512x512.png` - upscaled from source
- `frontend/public/favicon.ico` - generated from source

Note: Upscaling from 112px will produce slightly blurry icons. Acceptable for now; can be replaced with higher-res originals later.

### 5. Offline Fallback Page

Not included in initial implementation. Since this is install-only (not offline-capable), the browser's native offline error is acceptable. The service worker will serve cached static assets, so the app shell will load - but API calls will fail gracefully with existing error handling in the React app.

### 6. HTML Updates

In `frontend/public/index.html`:
- Update `<title>` from "Advanced Programming Project" to "Reflecta"
- Update `<meta name="description">` to match app purpose
- Update `<meta name="theme-color">` to match manifest
- Add iOS meta tags (section 3 above)
- Confirm `<link rel="manifest">` href is correct (already present)

## What Changes

| File | Action |
|------|--------|
| `frontend/public/manifest.json` | Create |
| `frontend/public/icons/icon-192x192.png` | Create (generated) |
| `frontend/public/icons/icon-512x512.png` | Create (generated) |
| `frontend/public/favicon.ico` | Create (generated) |
| `frontend/public/index.html` | Modify (title, meta tags, iOS tags) |
| `frontend/src/service-worker.js` | Create |
| `frontend/src/serviceWorkerRegistration.js` | Create |
| `frontend/src/index.js` | Modify (add SW registration) |
| `frontend/package.json` | Modify (add `workbox-*` dev dependencies) |

## Dependencies to Add

```
workbox-core
workbox-expiration
workbox-precaching
workbox-routing
workbox-strategies
```

These are the Workbox packages that CRA's service worker template imports. They are build-time dependencies used by the service worker bundling.

## Testing the PWA

1. Run `npm run build` in `frontend/`
2. Serve the build with a static server: `npx serve -s build`
3. Open Chrome DevTools -> Application -> Manifest: verify manifest loads, icons display
4. Application -> Service Workers: verify SW registered and active
5. Lighthouse -> PWA audit: should pass installability checks
6. On mobile (iOS Safari): tap Share -> Add to Home Screen; app should launch in standalone mode

## Out of Scope

- Offline data access or sync
- Push notifications
- Background sync
- App store submission (that's the whole point - we avoid it)
- Splash screen images for iOS (Apple generates these from the icon automatically on modern iOS)
