## 2024-05-24 - React.memo for List Items
**Learning:** The frontend app root components (like Explore.jsx) often trigger full page re-renders on search inputs. Not memoizing list items like ModelCard causes O(N) rendering performance bottlenecks.
**Action:** Always wrap list item components like ModelCard in `React.memo` to prevent unnecessary re-renders when parent state (like search text) changes.
