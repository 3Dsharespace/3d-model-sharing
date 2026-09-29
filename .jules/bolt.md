## 2026-09-29 - Prevent O(N) re-renders in list components
**Learning:** The application exhibits an architectural pattern where root components (like Home and Explore) trigger full page re-renders on every keystroke in search inputs.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering performance bottlenecks.
