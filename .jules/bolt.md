## 2024-10-27 - [React.memo for List Items]
**Learning:** Search inputs in root components trigger full page re-renders on every keystroke, causing O(N) re-rendering performance bottlenecks for list items.
**Action:** Wrap list item components like ModelCard in React.memo to prevent unnecessary re-renders.
