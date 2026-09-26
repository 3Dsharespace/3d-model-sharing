## 2024-05-27 - Root Re-renders from Search Inputs

**Learning:** The application uses an architectural pattern where root components (like `Home.jsx` and `Explore.jsx`) manage search state (`query`, `searchQuery`) and trigger full page re-renders on every keystroke. Because these pages render large lists of components like `ModelCard`, failing to memoize these list items results in an O(N) rendering bottleneck on every keystroke, causing severe input lag.
**Action:** Always verify if list item components (e.g., `ModelCard`, `ImageCard`) are wrapped in `React.memo` when working in this codebase to prevent them from re-rendering unnecessarily during parent state updates (like typing in a search bar).
