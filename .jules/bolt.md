## 2024-05-27 - Uncontrolled Search Inputs Causing List Re-renders
**Learning:** The codebase uses controlled search inputs in root page components (`Home.jsx`, `Explore.jsx`) without debouncing, meaning every keystroke triggers a full page render including all complex child components (like `ModelCard`s).
**Action:** Always wrap list item components (like `ModelCard`) in `React.memo` to prevent O(N) rendering bottlenecks when parent page state changes for completely unrelated user interactions.
