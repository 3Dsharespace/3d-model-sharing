## 2024-10-25 - React List Rendering Bottleneck
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke, causing O(N) rendering performance bottlenecks.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary O(N) re-renders when parent state (like search queries) updates independently of item props.
