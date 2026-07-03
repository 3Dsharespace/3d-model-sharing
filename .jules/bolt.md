## 2024-06-25 - React.memo() on List Items
**Learning:** Search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. This causes all child components, including large lists of `ModelCard` components, to re-render unnecessarily, leading to O(N) re-rendering performance bottlenecks.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent these unnecessary re-renders when their props haven't changed.
