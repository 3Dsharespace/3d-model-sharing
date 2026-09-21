## 2024-05-24 - ModelCard re-rendering bottleneck
**Learning:** The frontend application has an architectural pattern where search inputs in root components trigger full page re-renders on every keystroke, causing O(N) re-rendering for lists.
**Action:** Always wrap list item components like ModelCard in React.memo to prevent these performance bottlenecks.
