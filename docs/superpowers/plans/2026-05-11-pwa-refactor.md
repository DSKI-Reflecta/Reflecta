# PWA Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Reflecta frontend installable as a PWA on iOS and Android without an Apple Developer certificate.

**Architecture:** Add a web app manifest, service worker (CRA Workbox precaching pattern), iOS-specific meta tags, and properly sized icons. Install-only scope - no offline data, just cached app shell for instant launch.

**Tech Stack:** Workbox (precaching), CRA service worker registration pattern, `sips` (macOS) for icon generation.

---

### Task 1: Generate PWA Icons

**Files:**
- Create: `frontend/public/icons/icon-192x192.png`
- Create: `frontend/public/icons/icon-512x512.png`
- Create: `frontend/public/favicon.ico`

- [ ] **Step 1: Create icons directory**

```bash
mkdir -p frontend/public/icons
```

- [ ] **Step 2: Generate 192x192 and 512x512 icons from source**

```bash
sips -z 192 192 icon.png --out frontend/public/icons/icon-192x192.png
sips -z 512 512 icon.png --out frontend/public/icons/icon-512x512.png
```

- [ ] **Step 3: Generate favicon**

```bash
sips -z 32 32 icon.png --out frontend/public/favicon.ico
```

- [ ] **Step 4: Verify files exist and have correct dimensions**

```bash
sips -g pixelWidth -g pixelHeight frontend/public/icons/icon-192x192.png
sips -g pixelWidth -g pixelHeight frontend/public/icons/icon-512x512.png
```

Expected: 192x192 and 512x512 respectively.

- [ ] **Step 5: Commit**

```bash
git add frontend/public/icons/ frontend/public/favicon.ico
git commit -m "feat: add PWA icons in required sizes"
```

---

### Task 2: Create Web App Manifest

**Files:**
- Create: `frontend/public/manifest.json`

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "Reflecta - Smart Journaling",
  "short_name": "Reflecta",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#7c3aed",
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

- [ ] **Step 2: Commit**

```bash
git add frontend/public/manifest.json
git commit -m "feat: add PWA web app manifest"
```

---

### Task 3: Update index.html with PWA Meta Tags

**Files:**
- Modify: `frontend/public/index.html`

- [ ] **Step 1: Update the full `<head>` section**

Replace the entire content of `frontend/public/index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#7c3aed" />
    <meta name="description" content="Reflecta - A private, intelligent journaling system to reflect, track emotional patterns, and stay aligned with your goals." />

    <!-- PWA: iOS support -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Reflecta" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/icons/icon-192x192.png" />

    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Reflecta</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/public/index.html
git commit -m "feat: update index.html with PWA and iOS meta tags"
```

---

### Task 4: Add Workbox Dependencies

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install workbox packages**

```bash
cd frontend && npm install --save workbox-core workbox-expiration workbox-precaching workbox-routing workbox-strategies
```

- [ ] **Step 2: Verify packages are in package.json**

```bash
grep "workbox" frontend/package.json
```

Expected: All five workbox packages listed in dependencies.

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "feat: add workbox dependencies for PWA service worker"
```

---

### Task 5: Create Service Worker Registration Module

**Files:**
- Create: `frontend/src/serviceWorkerRegistration.js`

- [ ] **Step 1: Create the registration file**

This is the standard CRA PWA registration helper:

```javascript
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('This web app is being served cache-first by a service worker.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content is available and will be used when all tabs are closed.');
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Content is cached for offline use.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (response.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/serviceWorkerRegistration.js
git commit -m "feat: add service worker registration module"
```

---

### Task 6: Create Service Worker

**Files:**
- Create: `frontend/src/service-worker.js`

- [ ] **Step 1: Create the service worker file**

```javascript
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/service-worker.js
git commit -m "feat: add Workbox precaching service worker"
```

---

### Task 7: Register Service Worker in index.js

**Files:**
- Modify: `frontend/src/index.js`

- [ ] **Step 1: Update index.js to register the service worker**

Replace content of `frontend/src/index.js` with:

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register();
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/index.js
git commit -m "feat: register PWA service worker on app load"
```

---

### Task 8: Verify PWA Build

**Files:** None (verification only)

- [ ] **Step 1: Build the frontend**

```bash
cd frontend && npm run build
```

Expected: Build succeeds with no errors. The `build/` directory should contain `service-worker.js` and `manifest.json`.

- [ ] **Step 2: Verify build output contains PWA assets**

```bash
ls frontend/build/service-worker.js frontend/build/manifest.json frontend/build/icons/
```

Expected: All files present.

- [ ] **Step 3: Serve and test locally**

```bash
cd frontend && npx serve -s build -l 3000
```

Open http://localhost:3000 in Chrome. Open DevTools -> Application tab:
- Manifest section should show "Reflecta - Smart Journaling" with icons
- Service Workers section should show an active service worker
- Run Lighthouse PWA audit - should pass installability criteria

- [ ] **Step 4: Stop the server and commit any build config fixes if needed**
