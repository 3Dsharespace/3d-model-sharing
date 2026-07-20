
## 2024-05-18 - Search Inputs in Root Components
**Learning:** This codebase exhibits an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. This can lead to performance bottlenecks, especially when rendering lists of components like `ModelCard`.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` or `memo` to prevent O(N) re-rendering performance bottlenecks when parent components update frequently.
