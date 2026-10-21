## 2023-10-22 - Prevent O(N) Re-renders with React.memo in List Items
**Learning:** Search inputs in root components (like Home and Explore) can trigger full page re-renders on every keystroke, causing O(N) re-renders for list components without memoization.
**Action:** Always wrap list item components (like ModelCard) in React.memo to avoid these performance bottlenecks.
