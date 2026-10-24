## 2024-05-24 - Search Input Re-renders
**Learning:** Root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke in search inputs, causing an O(N) performance bottleneck when rendering lists of models.
**Action:** Always wrap list item components like ModelCard in React.memo to prevent these unnecessary re-renders.
