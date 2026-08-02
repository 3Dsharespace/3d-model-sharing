## 2024-08-03 - Re-rendering performance bottleneck on search input
**Learning:** In React applications where search inputs at the root/page level trigger state updates on every keystroke, rendering large lists of complex components without memoization creates significant O(N) rendering bottlenecks.
**Action:** Always wrap list item components (like `ModelCard`) in `React.memo` when they are rendered inside components that update state frequently (e.g. search inputs), to prevent expensive unnecessary re-renders.
