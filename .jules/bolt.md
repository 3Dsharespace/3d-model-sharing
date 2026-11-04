## 2024-10-24 - React.memo on List Items
**Learning:** Root components with search inputs (like Home.jsx and Explore.jsx) can trigger O(N) full page re-renders on every keystroke if child list components aren't memoized.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering performance bottlenecks when building search or filter UIs.
