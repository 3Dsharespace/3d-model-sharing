## 2024-08-29 - O(N) Re-rendering Bottleneck in Lists
**Learning:** Search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke, causing O(N) re-rendering performance bottlenecks for list item components like ModelCard.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary re-renders of the entire list when parent state changes.
