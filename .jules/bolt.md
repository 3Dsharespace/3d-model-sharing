## 2024-06-11 - Search Input Architecture Re-renders
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke because the search input state is held at the page level. This is a significant bottleneck when rendering lists of components.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when list items themselves haven't changed.
