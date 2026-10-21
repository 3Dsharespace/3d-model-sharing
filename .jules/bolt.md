## 2024-10-24 - O(N) Re-rendering Bottleneck on Search
**Learning:** This codebase exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke, causing O(N) rendering bottlenecks for list items.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary re-renders when parent components update state frequently.
