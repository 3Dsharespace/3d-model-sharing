## 2024-08-19 - React.memo for ModelCard Component
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke.
**Action:** Wrap list item components like `ModelCard` in `React.memo` to prevent O(N) re-rendering performance bottlenecks when parent components update frequently (e.g. from search inputs).
