## 2024-05-24 - React List Item Re-renders
**Learning:** Search inputs in root components trigger full page re-renders on every keystroke, causing O(N) re-rendering performance bottlenecks for lists.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary re-renders.
