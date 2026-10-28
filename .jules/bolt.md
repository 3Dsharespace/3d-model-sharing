## 2024-10-24 - React.memo on List Items
**Learning:** Search inputs in root components like Home.jsx and Explore.jsx trigger full page re-renders on every keystroke. List item components like ModelCard can cause O(N) re-rendering performance bottlenecks.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary re-renders.
