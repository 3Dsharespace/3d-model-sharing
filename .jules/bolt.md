## 2024-05-24 - React List Re-rendering Optimization
**Learning:** In React applications with search inputs at the root level (like Home.jsx and Explore.jsx), typing triggers full page re-renders. If list item components (like ModelCard) are not memoized, this causes O(N) re-rendering bottlenecks where N is the number of items in the list.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo() to prevent O(N) re-rendering performance bottlenecks when they rely on props that don't change frequently.
