## 2024-05-24 - Search Input Causes Full List Re-renders
**Learning:** In root components like `Home.jsx` and `Explore.jsx`, search inputs trigger full page re-renders on every keystroke, causing O(N) performance bottlenecks when rendering large lists of unmemoized items like `ModelCard`.
**Action:** Always wrap list item components in `React.memo` (or `memo`) to prevent them from re-rendering unless their props actually change.
