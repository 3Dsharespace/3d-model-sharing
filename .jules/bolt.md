## 2024-09-15 - Prevent Unnecessary Re-Renders in Lists during Search
**Learning:** In root components that trigger full page re-renders on keystrokes (like during search), list item components (e.g., ModelCard) can cause O(N) re-rendering bottlenecks if not memoized.
**Action:** Always wrap frequently rendered list items in React.memo() if their parent component has high-frequency state updates like input changes.
