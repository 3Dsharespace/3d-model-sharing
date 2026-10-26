## 2024-10-27 - O(N) Re-rendering Bottleneck in Search
**Learning:** Search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes severe performance degradation when rendering lists of items without memoization.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent these O(N) re-rendering bottlenecks.
