## 2026-10-10 - O(N) Re-render bottlenecks on search inputs
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke, causing O(N) re-rendering bottlenecks for large lists of components like ModelCard.
**Action:** Always wrap list item components (e.g., ModelCard) in `React.memo` to prevent these costly O(N) re-renders during parent keystroke updates.
