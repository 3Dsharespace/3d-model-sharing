## 2024-05-24 - [List Item Re-rendering Bottleneck]
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke, causing O(N) rendering performance bottlenecks when rendering large lists of items.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when parent state changes.
