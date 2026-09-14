
## 2024-03-24 - Search Input Re-renders
**Learning:** Root components (like Home and Explore) trigger full page re-renders on every keystroke in search inputs, causing an O(N) re-rendering bottleneck when displaying lists of ModelCards.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` and ensure proper memoization of props to prevent unnecessary re-renders during search input changes.
