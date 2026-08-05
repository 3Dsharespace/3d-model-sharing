## 2024-08-05 - Missing React.memo in list components
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes O(N) re-rendering bottlenecks in large lists if components like ModelCard are not memoized.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent these performance bottlenecks.
