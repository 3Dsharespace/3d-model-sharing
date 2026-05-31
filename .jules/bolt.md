## 2024-05-31 - React.memo for ModelCard in Search Inputs
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes all children components, such as list items, to re-render unnecessarily.
**Action:** List item components used within these pages (e.g., ModelCard) should be wrapped in React.memo to prevent O(N) re-rendering performance bottlenecks when parent state changes frequently without affecting the list items.
