## 2026-10-09 - Memoization of List Items to Prevent Re-renders
**Learning:** Found an architectural pattern where root components (Home.jsx, Explore.jsx) handle search input state. When the input changes on every keystroke, it triggers full page re-renders, cascading down to all child components, including long lists of `ModelCard` components, causing a O(N) re-rendering performance bottleneck.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent unnecessary re-renders when parent components update unrelated state. Ensure `memo` is explicitly imported.
