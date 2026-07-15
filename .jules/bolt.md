## 2024-05-17 - React.memo Optimization in Search Results
**Learning:** Search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. Without memoization, this causes O(N) re-rendering performance bottlenecks for list components like `ModelCard`.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when they are rendered inside components that update frequently due to local state changes like search input.
