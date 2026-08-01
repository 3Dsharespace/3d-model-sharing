## 2024-05-14 - Prevent O(N) re-renders during search
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components trigger full page re-renders on every keystroke.
**Action:** Always wrap list item components in React.memo to prevent O(N) re-rendering performance bottlenecks.
