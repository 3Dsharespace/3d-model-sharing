## 2024-05-24 - Root Component Re-render Pattern
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes all child components to re-render, creating a performance bottleneck when rendering lists.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering performance bottlenecks when their props haven't changed.
