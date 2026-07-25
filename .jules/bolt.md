## 2024-07-25 - Missing memoization causes O(N) re-renders during search keystrokes
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. This causes all list item components (e.g., `ModelCard`) to re-render, leading to an O(N) performance bottleneck.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent unnecessary re-renders when parent components update frequently.
