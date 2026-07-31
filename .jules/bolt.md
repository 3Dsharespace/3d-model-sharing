## 2024-05-18 - Search Input Re-renders
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes O(N) re-rendering performance bottlenecks for list items.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary re-renders.
