## 2023-10-27 - List Component Memoization
**Learning:** Found an architectural pattern where root components (Home, Explore) contain search inputs that trigger state updates on every keystroke, causing O(N) re-renders of list item components like ModelCard if they aren't memoized.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks during parent state updates.
