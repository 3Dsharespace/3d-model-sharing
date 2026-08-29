# 3D ShareSpace Deployment Guide

This project is the live 3D ShareSpace website at:

```text
https://3dsharespace.com
```

The current app uses:

- React
- Vite
- Tailwind CSS
- Firebase Auth
- Firestore
- Firebase Storage
- Firebase Hosting
- Firebase Cloud Functions for selected API routes

The active project root is:

```text
D:\3dwebsite
```

## Current Folder Structure

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
|   |-- index.js
|   |-- package.json
|   `-- package-lock.json
|
|-- tools
|-- firebase.json
|-- .firebaserc
|-- .env.local
|-- package.json
|-- package-lock.json
|-- vercel.json
|-- README.md
`-- DEPLOYMENT.md
```

Old duplicate and unrelated files were moved to:

```text
D:\bak\3dwebsite-cleanup-20260526-092210
```

## Important Deployment Rule

For normal frontend UI changes, deploy Firebase Hosting only:

```bash
firebase deploy --only hosting
```

Do not run a full `firebase deploy` unless you intentionally want to manage Cloud Functions, Firestore rules, Storage rules, and indexes.

The live Firebase project contains many existing Cloud Functions that are not present in the local `functions` folder. A full deploy can stop because Firebase detects remote functions missing from local source and refuses to delete them in non-interactive mode.

## Build

From the project root:

```bash
cd D:\3dwebsite
npm run build
```

This runs:

```bash
cd frontend && npm run build
```

The frontend build creates:

```text
frontend/dist
```

The build also runs SEO and publishing scripts:

- prerender SEO pages
- prerender guide pages
- prerender model pages
- generate static sitemap
- generate model/image/creator sitemaps
- generate Pinterest RSS feeds

## Deploy Frontend UI Changes

Use this for normal website updates:

```bash
cd D:\3dwebsite
npm run build
firebase deploy --only hosting
```

This deploys `frontend/dist` to Firebase Hosting targets configured in `firebase.json`.

Current hosting targets:

- `3dsharespace-com`
- `dsharespace-v2`

## Firebase Config

Root Firebase config:

```text
D:\3dwebsite\firebase.json
```

Hosting serves:

```text
frontend/dist
```

Firestore rules:

```text
frontend/firestore.rules
```

Firestore indexes:

```text
frontend/firestore.indexes.json
```

Storage rules:

```text
frontend/storage.rules
```

Cloud Functions source:

```text
functions
```

## Full Firebase Deploy

Only use this when you really intend to deploy rules, indexes, functions, and hosting:

```bash
cd D:\3dwebsite
npm run build
firebase deploy
```

Warning: a full deploy may fail if Firebase detects live Cloud Functions that are not in local source. Do not delete remote functions unless you have confirmed they are no longer used.

## Functions Warning

Firebase may show warnings like:

```text
Runtime Node.js 20 was deprecated...
firebase-functions is outdated...
```

These warnings do not block hosting deploys. Plan a separate functions upgrade before changing function runtime or dependencies.

## Pinterest Export And RSS Checks

Pinterest CSV and RSS tools live in the frontend scripts.

Run CSV verification:

```bash
cd D:\3dwebsite\frontend
npm run verify:pinterest-csv
```

Run RSS verification:

```bash
cd D:\3dwebsite\frontend
npm run verify:pinterest-rss
```

Pinterest admin route:

```text
/admin/export-pinterest-csv
```

Pinterest RSS routes:

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

## Local Development

From the root:

```bash
cd D:\3dwebsite
npm run dev
```

Or from the frontend folder:

```bash
cd D:\3dwebsite\frontend
npm run dev
```

Preview a production build:

```bash
cd D:\3dwebsite\frontend
npm run preview
```

## Environment Variables

Do not rename or remove existing environment variables without checking the code first.

Root local environment file:

```text
D:\3dwebsite\.env.local
```

Frontend uses Vite environment variables with the `VITE_` prefix.

Important public URL fallback used by Pinterest exports:

```js
VITE_PUBLIC_SITE_URL=https://3dsharespace.com
```

If this variable is missing, the code falls back to:

```text
https://3dsharespace.com
```

## Post-Deploy Checks

After a hosting deploy, manually check:

- Home page: `https://3dsharespace.com/`
- Explore page: `https://3dsharespace.com/explore`
- Model detail page
- Upload page
- Dashboard
- Notifications / Activity Inbox
- Profile edit
- Admin dashboard
- Pinterest CSV admin page
- Pinterest RSS feed URLs
- Mobile layout on a phone-sized viewport

## Common Commands

Build:

```bash
npm run build
```

Deploy hosting only:

```bash
firebase deploy --only hosting
```

Verify Pinterest CSV:

```bash
cd frontend
npm run verify:pinterest-csv
```

Verify Pinterest RSS:

```bash
cd frontend
npm run verify:pinterest-rss
```

Run tests:

```bash
npm run test
```

## Notes

- Keep `frontend` as the active website application.
- Keep `functions` unless intentionally changing Firebase Functions.
- Do not restore old backup folders unless there is a specific reason.
- Use hosting-only deploys for frontend UI updates.
- Use full Firebase deploys only for planned backend/rules work.
