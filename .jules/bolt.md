## 2024-09-01 - Prevent O(N) re-renders in ModelCard
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components trigger full page re-renders on every keystroke, causing O(N) re-rendering performance bottlenecks for list item components.
**Action:** Always wrap list item components like ModelCard in React.memo to prevent unnecessary re-renders.
