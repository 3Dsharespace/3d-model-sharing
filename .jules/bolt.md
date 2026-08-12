## 2024-08-12 - Root Component Search Re-render Anti-pattern
**Learning:** The frontend application exhibits a codebase-specific architectural anti-pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes severe O(N) re-rendering performance bottlenecks for un-memoized list items.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent O(N) re-rendering performance bottlenecks when they are rendered inside these root components.
