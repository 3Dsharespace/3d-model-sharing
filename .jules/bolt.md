## 2024-05-18 - [React Re-renders in Search Components]
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke, leading to O(N) re-rendering performance bottlenecks.
**Action:** Always wrap list item components like ModelCard in React.memo to prevent unnecessary re-renders on keystrokes.
