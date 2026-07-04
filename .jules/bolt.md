## 2024-03-24 - [React.memo for list items in search views]
**Learning:** Root components with search inputs (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke because the search query state is kept at the root level. When a list of items (like ModelCard components) isn't memoized, it leads to O(N) re-rendering performance bottlenecks for the entire list on every character typed.
**Action:** Always wrap list item components like `ModelCard` in `React.memo()` when they are rendered inside components that contain frequent state updates like search inputs.
