## 2024-06-25 - React.memo for ModelCard
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes all list item components (e.g., ModelCard) to re-render.
**Action:** Wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering performance bottlenecks.
