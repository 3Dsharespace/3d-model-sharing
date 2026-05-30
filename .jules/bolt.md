## 2024-05-18 - [ModelCard Re-rendering]
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. List item components used within these pages (e.g., ModelCard) must be wrapped in React.memo to prevent O(N) re-rendering performance bottlenecks.
**Action:** Always verify if list items in search-heavy pages are memoized to avoid expensive re-renders on keystrokes.
