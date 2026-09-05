## 2026-09-05 - Component Re-rendering Bottleneck on Search
**Learning:** The frontend architecture triggers full page re-renders on every keystroke for search inputs in root components (like Home.jsx). This causes severe O(N) re-rendering bottlenecks for list item components like ModelCard.
**Action:** Always wrap frequently rendered list item components in `React.memo` to prevent unnecessary re-renders when parent components update state frequently.
