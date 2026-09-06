## 2024-05-18 - ModelCard Keystroke Re-render Bottleneck
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes severe O(N) re-rendering performance bottlenecks for lists of items like ModelCard.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent these O(N) re-renders and explicitly import memo from React.
