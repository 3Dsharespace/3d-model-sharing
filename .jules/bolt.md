## 2024-05-24 - List Rendering with Search Inputs
**Learning:** Found that search inputs at the root level (like Home and Explore) trigger full-page re-renders on every keystroke. Without memoizing list items, this caused O(N) re-renders for unchanged models in large lists.
**Action:** Always verify if list item components (`ModelCard`) are wrapped in `React.memo` to prevent cascading render performance issues in search heavy pages.
