## 2024-05-24 - O(N) list re-rendering in root components
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. This causes O(N) re-rendering of all listed components, leading to noticeable UI lag when lists are large.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks.
