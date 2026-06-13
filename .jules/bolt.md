## 2024-11-20 - [Architectural pattern: Root Search Inputs Triggering O(N) Re-renders]
**Learning:** Search inputs placed in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. When these pages render long lists of components like `ModelCard`, it leads to O(N) re-rendering performance bottlenecks on every keystroke.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent unnecessary re-renders when parent state changes (like search input typing) don't affect the item props.
