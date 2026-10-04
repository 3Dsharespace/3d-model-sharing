## 2024-05-24 - React.memo on List Item Components
**Learning:** Found a common performance bottleneck where typing in root-level search inputs triggers full re-renders of large lists of children components, slowing down the UI noticeably for long lists.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering performance bottlenecks when parent state changes.
