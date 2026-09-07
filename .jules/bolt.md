## 2024-05-20 - React.memo for Search Input Re-renders
**Learning:** Search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke, causing O(N) re-renders for list items like `ModelCard`.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks.
