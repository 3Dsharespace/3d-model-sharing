## 2024-06-25 - React.memo on List Item Components
**Learning:** The architectural pattern where search inputs in root components trigger full page re-renders on every keystroke causes O(N) performance bottlenecks when list items are not memoized.
**Action:** Wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent unnecessary re-renders during state updates in parent components.
