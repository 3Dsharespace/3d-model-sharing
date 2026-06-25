## 2024-05-24 - Search Input Re-renders Root Components
**Learning:** The frontend architecture has a pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) store their state at the top level. This triggers full page re-renders on every keystroke, causing O(N) re-rendering bottlenecks for child list items like `ModelCard`.
**Action:** Always wrap list item components like `ModelCard` in `React.memo` to prevent unnecessary re-rendering across the application.
