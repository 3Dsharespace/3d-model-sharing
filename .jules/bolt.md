## 2024-08-20 - Search Input Re-render Bottleneck
**Learning:** Search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes an O(N) re-rendering performance bottleneck for list item components like ModelCard if they are not memoized.
**Action:** Always wrap list item components in React.memo() to prevent unnecessary cascading re-renders when parent states (like search queries) change frequently.
