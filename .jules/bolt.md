## 2024-05-24 - Search Input Re-renders
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering performance bottlenecks.
