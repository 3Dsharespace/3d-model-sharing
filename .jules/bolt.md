## 2024-07-24 - React Re-renders from Root Search Inputs
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke because the state is managed at the root level.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when parent root components frequently re-render due to search keystrokes.
