## 2024-05-24 - React.memo on List Items
**Learning:** In architectures where search inputs in root components trigger full page re-renders on every keystroke, failing to memoize list item components causes O(N) re-rendering performance bottlenecks.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary re-renders when parent state updates do not affect the child props.
