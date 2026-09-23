## 2024-09-24 - React Re-render Bottleneck in List Components
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. Because list item components like ModelCard are not memoized, this causes O(N) re-rendering bottlenecks.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering performance bottlenecks when they are rendered inside lists that frequently re-render due to parent state changes.
