
## 2024-05-18 - Search Inputs and Re-renders in Lists
**Learning:** This codebase's architecture has search inputs in root components (like Home.jsx and Explore.jsx) that trigger full page re-renders on every keystroke. This causes severe O(N) re-rendering performance bottlenecks for list items like `ModelCard` if they are not memoized.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent unnecessary re-renders when the parent's search state changes.
