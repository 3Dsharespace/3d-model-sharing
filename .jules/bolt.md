## 2025-02-28 - Architectural pattern: Search inputs trigger full page re-renders
**Learning:** Search inputs in root components like Home.jsx and Explore.jsx trigger full page re-renders on every keystroke, causing O(N) re-rendering performance bottlenecks for list items.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary re-renders.
