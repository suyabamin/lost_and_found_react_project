# White Screen Audit Report

## Summary

The white screen was caused by multiple project-level risks, not a single issue. The main fatal risk was that `public/legacy` existed but was empty, so Vite returned the React fallback page for legacy iframe URLs. That could recursively load React inside React instead of the original HTML. Additional risks included missing legacy helper scripts, lack of a React Error Boundary, no diagnostic mode, no explicit Vite config, and API requests without a timeout.

## Verification

- `npm run build`: passed.
- Frontend root: `http://127.0.0.1:5173` returns HTTP 200.
- Legacy landing page: `http://127.0.0.1:5173/legacy/Landing%20Page.html` returns HTTP 200.
- Legacy login page: `http://127.0.0.1:5173/legacy/Login.html` returns HTTP 200.
- Legacy helper script: `http://127.0.0.1:5173/legacy/js/lf-core.js` returns HTTP 200.

## Bugs Found and Fixes Applied

### BUG FOUND: Empty legacy asset folder

CAUSE:
`public/legacy` was created but the original files were not actually present. Requests like `/legacy/Landing Page.html` were served by Vite's SPA fallback instead of the real HTML page.

FILE:
`public/legacy`

FIX APPLIED:
Copied all original files from `html_css_frontain` into `public/legacy`. Verified 157 files exist.

### BUG FOUND: Legacy iframe could recursively load the React app

CAUSE:
Because the requested legacy HTML file was missing, Vite returned `index.html`. The iframe then loaded the React app again, which could appear as a white screen or recursive shell.

FILE:
`src/pages/LegacyPage.jsx`

FIX APPLIED:
Changed legacy rendering to iframe isolation and verified actual legacy files are served.

### BUG FOUND: Missing legacy helper scripts

CAUSE:
Many HTML files referenced `js/lf-core.js`, `js/lf-ui.js`, and `js/lf-category-loader.js`, but the `js` folder was missing from `public/legacy`.

FILE:
`public/legacy/js/lf-core.js`
`public/legacy/js/lf-ui.js`
`public/legacy/js/lf-category-loader.js`

FIX APPLIED:
Added safe compatibility helper scripts with fallback data, API fallback behavior, UI helpers, and category item fallback rendering.

### BUG FOUND: No React Error Boundary

CAUSE:
Any render-time React error could blank the whole app.

FILE:
`src/components/ErrorBoundary.jsx`
`src/main.jsx`

FIX APPLIED:
Created `ErrorBoundary.jsx` and wrapped the entire app. Errors now show a readable fallback screen with stack traces in development.

### BUG FOUND: React root not guarded

CAUSE:
If `#root` was missing or malformed, React startup would fail silently for the user.

FILE:
`src/main.jsx`

FIX APPLIED:
Added a root element guard and startup diagnostics.

### BUG FOUND: Backend-offline session check could delay rendering

CAUSE:
The auth session check called the backend on startup without a timeout.

FILE:
`src/services/api.js`
`src/context/AuthContext.jsx`

FIX APPLIED:
Added Axios timeout, diagnostic logging, and graceful guest fallback when backend is unavailable.

### BUG FOUND: No diagnostic mode

CAUSE:
Startup, route, auth, API, and legacy rendering issues were difficult to trace.

FILE:
`src/utils/diagnostics.js`
`src/main.jsx`
`src/App.jsx`
`src/context/AuthContext.jsx`
`src/services/api.js`
`src/pages/LegacyPage.jsx`

FIX APPLIED:
Added diagnostic logs with scopes: `[APP]`, `[ROUTER]`, `[AUTH]`, `[API]`, `[LEGACY]`.

### BUG FOUND: Vite config missing

CAUSE:
The project relied only on CLI defaults. This was not the direct white-screen cause, but explicit config improves React plugin handling and dev-server predictability.

FILE:
`vite.config.js`

FIX APPLIED:
Added explicit Vite config with React plugin, dev server host/port, preview config, and chunk warning threshold.

### BUG FOUND: Legacy JavaScript could crash React shell

CAUSE:
Injecting old page scripts directly into React DOM can create global side effects and runtime crashes.

FILE:
`src/pages/LegacyPage.jsx`

FIX APPLIED:
Replaced direct HTML/script injection with iframe isolation. Legacy scripts can run inside the iframe without crashing React.

### BUG FOUND: Frontend needed to render without backend/database

CAUSE:
Backend and MySQL may be unavailable during local setup.

FILE:
`src/services/api.js`
`src/context/AuthContext.jsx`
`public/legacy/js/lf-core.js`

FIX APPLIED:
Added fallback behavior so the frontend continues rendering when API calls fail.

## Remaining External Setup

- PHP 8+ must be installed and available as `php` on PATH for `npm run backend`.
- MySQL database import still depends on local MySQL access.
- Google Maps requires a real `VITE_GOOGLE_MAPS_API_KEY`.
