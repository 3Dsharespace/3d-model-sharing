## 2024-07-25 - React.memo for List Items in Search Interfaces
**Learning:** In root components (like Home.jsx and Explore.jsx) that trigger full page re-renders on every keystroke in search inputs, child list items suffer O(N) re-rendering bottlenecks if not memoized.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering performance bottlenecks when parent components update frequently.
