## 2026-06-14 - [React.memo on list items due to root level search input re-renders]
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. This causes severe O(N) re-rendering performance bottlenecks for un-memoized list items.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent these bottlenecks.
