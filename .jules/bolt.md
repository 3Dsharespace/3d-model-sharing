## 2024-07-26 - React.memo for Search Input Re-renders
**Learning:** Search inputs in root components like `Home.jsx` and `Explore.jsx` trigger full page re-renders on every keystroke. This causes an O(N) re-rendering performance bottleneck for list items like `ModelCard`.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when they are rendered inside components with frequent state changes (like search inputs).
