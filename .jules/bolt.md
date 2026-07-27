## 2024-07-28 - Search Input Re-rendering Bottleneck
**Learning:** Root components with search inputs (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. This causes all descendant list items (like `ModelCard` components) to unnecessarily re-render, leading to an O(N) performance bottleneck where N is the number of rendered items.
**Action:** Always wrap list item components like `ModelCard` in `React.memo` to prevent unnecessary re-renders when parent components re-render due to isolated state changes like search input keystrokes.
