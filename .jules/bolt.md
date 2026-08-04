## 2024-08-04 - Prevent O(N) re-renders in ModelCard
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components trigger full page re-renders on every keystroke. Un-memoized list items cause O(N) re-rendering performance bottlenecks.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary re-renders.
