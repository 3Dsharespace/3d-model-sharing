## 2024-10-01 - React.memo for ModelCard
**Learning:** List item components like ModelCard in this architecture need React.memo to prevent O(N) re-rendering bottlenecks because search inputs in root components (Home, Explore) trigger full page re-renders on every keystroke.
**Action:** Always wrap frequently rendered list item components in React.memo, especially when they are nested inside pages with frequent state updates like search inputs.
