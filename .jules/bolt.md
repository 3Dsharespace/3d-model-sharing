## 2024-05-24 - Root Component Search Re-render Bottleneck
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke, causing O(N) re-rendering performance bottlenecks for list items.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary re-renders when root components update.
