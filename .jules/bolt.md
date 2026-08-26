## 2024-08-26 - Prevent Re-renders on Search Input
**Learning:** Found an architectural pattern where search inputs in root components like `Home.jsx` and `Explore.jsx` can trigger full page re-renders on every keystroke.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when they are rendered inside lists where the parent state changes frequently.
