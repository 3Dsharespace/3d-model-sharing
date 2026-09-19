## 2024-05-14 - React.memo Optimization for ModelCard

**Learning:** Search inputs in root components trigger full page re-renders on every keystroke. Large lists of ModelCards become O(N) re-rendering performance bottlenecks without memoization.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent these re-renders and ensure smooth input behavior.
