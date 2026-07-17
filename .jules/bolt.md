## 2024-07-17 - React.memo needed for list items to prevent search input O(N) re-renders
**Learning:** The frontend architecture frequently triggers full page re-renders on keystrokes in search inputs in root components like `Home.jsx` and `Explore.jsx`. Without memoization, this causes O(N) re-rendering of large lists (e.g., `ModelCard` components) causing significant input lag.
**Action:** Always wrap frequently rendered list item components (like `ModelCard`) in `React.memo` (and `import { memo } from 'react'`) to prevent these performance bottlenecks.
