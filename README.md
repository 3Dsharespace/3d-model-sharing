# 3D ShareSpace

3D ShareSpace is a live 3D model sharing website for browsing, uploading, downloading, and managing free 3D assets.

Live site:

```text
[https://3dsharespace.com](https://dsharespace-v2.web.app/)
```

## Tech Stack

- React
- Vite
- Tailwind CSS
- Firebase Auth
- Firestore
- Firebase Storage
- Firebase Hosting
- Firebase Cloud Functions for selected API routes

## Active Project Structure

```text
D:\3dwebsite
|-- frontend
|   |-- src
|   |   |-- components
|   |   |-- contexts
|   |   |-- lib
|   |   |-- pages
|   |   `-- App.jsx
|   |-- public
|   |-- scripts
|   |-- dist
|   |-- firebase.json
|   |-- firestore.rules
|   |-- firestore.indexes.json
|   |-- storage.rules
|   |-- package.json
|   `-- vite.config.js
|
|-- functions
|-- tools
|-- firebase.json
|-- .firebaserc
|-- .env.local
|-- package.json
|-- package-lock.json
|-- README.md
`-- DEPLOYMENT.md
```

Old duplicate and unrelated files were moved to:

```text
D:\bak\3dwebsite-cleanup-20260526-092210
```

## Main App

The active frontend app is:

```text
D:\3dwebsite\frontend
```

Important frontend areas:

- `src/pages` - route pages
- `src/components` - shared UI and layout components
- `src/contexts` - auth/theme providers
- `src/lib` - Firebase helpers and shared utilities
- `scripts` - SEO, sitemap, Pinterest CSV/RSS scripts
- `public` - static public assets

## Commands

Run development server from the root:

```bash
cd D:\3dwebsite
npm run dev
```

Build from the root:

```bash
cd D:\3dwebsite
npm run build
```

Preview production build:

```bash
cd D:\3dwebsite\frontend
npm run preview
```

Run tests:

```bash
cd D:\3dwebsite
npm run test
```

## Build Output

The production build is generated at:

```text
D:\3dwebsite\frontend\dist
```

The build also runs:

- SEO page prerendering
- guide page prerendering
- model page prerendering
- image page prerendering
- sitemap generation
- Pinterest RSS feed generation

## Deployment

For normal frontend/UI changes, use hosting-only deploy:

```bash
cd D:\3dwebsite
npm run build
firebase deploy --only hosting
```

Do not run a full Firebase deploy for normal UI changes.

The live Firebase project has many existing Cloud Functions that are not all present in the local `functions` folder. A full deploy can stop because Firebase detects remote functions missing locally and refuses to delete them in non-interactive mode.

Use full deploy only when intentionally working on Firebase rules, indexes, functions, and hosting:

```bash
firebase deploy
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment notes.

## Firebase Files

Root Firebase config:

```text
D:\3dwebsite\firebase.json
```

Frontend Firebase-related files:

```text
D:\3dwebsite\frontend\firestore.rules
D:\3dwebsite\frontend\firestore.indexes.json
D:\3dwebsite\frontend\storage.rules
```

Cloud Functions source:

```text
D:\3dwebsite\functions
```

## Pinterest Tools

Admin CSV export route:

```text
/admin/export-pinterest-csv
```

Verify Pinterest CSV:

```bash
cd D:\3dwebsite\frontend
npm run verify:pinterest-csv
```

Verify Pinterest RSS:

```bash
cd D:\3dwebsite\frontend
npm run verify:pinterest-rss
```

Pinterest RSS feeds:

```text
/rss/pinterest/all.xml
/rss/pinterest/shoes.xml
/rss/pinterest/architecture.xml
/rss/pinterest/interior-design.xml
/rss/pinterest/characters.xml
/rss/pinterest/vehicles.xml
/rss/pinterest/furniture.xml
/rss/pinterest/household.xml
/rss/pinterest/electronics.xml
/rss/pinterest/nature.xml
/rss/pinterest/animals.xml
/rss/pinterest/props.xml
```

## Current UI Direction

The website uses an ultra-dark studio interface with:

- desktop-first layout
- mobile usability support
- left studio rail/header on desktop
- compact mobile top navigation
- asset-focused Explore page
- Activity Inbox for notifications/messages
- dark professional cards, panels, forms, and admin surfaces

## Environment Notes

Local environment file:

```text
D:\3dwebsite\.env.local
```

Frontend environment variables must use the `VITE_` prefix.

Public site URL fallback:

```text
VITE_PUBLIC_SITE_URL=https://3dsharespace.com
```

If missing, Pinterest export code falls back to:

```text
https://3dsharespace.com
```

## Maintenance Notes

- Keep `frontend` as the active website app.
- Keep `functions` unless intentionally changing Firebase Functions.
- Use hosting-only deploys for UI/frontend changes.
- Do not restore old backup folders unless there is a specific reason.
- Avoid changing environment variables without checking where they are used.
- Run `npm run build` before deploying.
