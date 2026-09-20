## 2024-05-26 - Search Input Re-render Anti-pattern
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Explore.jsx) trigger full page re-renders on every keystroke, causing O(N) re-rendering bottlenecks for list item components.
**Action:** Always wrap list item components like ModelCard in React.memo to prevent these unnecessary re-renders.
