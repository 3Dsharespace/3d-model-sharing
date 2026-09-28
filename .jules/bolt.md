## 2024-05-26 - Keystroke Re-renders in Search Components
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes severe O(N) re-rendering performance bottlenecks for lists of items.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering when parent components update state on keystrokes.
