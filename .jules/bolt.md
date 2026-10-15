## 2026-10-15 - React.memo on List Components
**Learning:** In React applications with search inputs in root components (like `Home.jsx` and `Explore.jsx`), keystrokes trigger full page re-renders. If list item components (like `ModelCard`) are not memoized, this causes O(N) re-rendering performance bottlenecks, scaling linearly with the number of items displayed.
**Action:** Always wrap list item components in `React.memo` when they are rendered in large grids or lists, especially if parent components have state that updates frequently (e.g., search inputs).
