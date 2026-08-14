## 2024-05-24 - React List Rendering Bottleneck
**Learning:** The application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. Because list item components (ModelCard) are not memoized, this causes O(N) re-rendering performance bottlenecks when typing.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering performance bottlenecks when parent state updates.
