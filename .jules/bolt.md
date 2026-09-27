## 2024-05-24 - React.memo Optimization
**Learning:** Found O(N) re-rendering performance bottlenecks in search inputs triggering full page re-renders in root components like Home.jsx and Explore.jsx.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo.
