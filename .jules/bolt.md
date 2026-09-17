## 2024-07-25 - Prevent O(N) list re-renders on keystrokes
**Learning:** The frontend architecture mounts search inputs at root level (Home.jsx, Explore.jsx), triggering a re-render of the entire view, including large lists of `ModelCard` components, on every keystroke.
**Action:** Always wrap frequently rendered list items, such as `ModelCard`, in `React.memo` or `memo` to prevent O(N) re-rendering performance bottlenecks when parent components update frequently.
