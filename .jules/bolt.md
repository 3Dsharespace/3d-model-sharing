## 2024-05-24 - ModelCard missing memoization
**Learning:** The frontend uses an architectural pattern where search inputs in root components trigger full page re-renders on every keystroke. List item components like `ModelCard` must be wrapped in `React.memo` to prevent O(N) re-rendering performance bottlenecks.
**Action:** Always check if frequently rendered list items in the codebase are missing `React.memo` optimizations.
