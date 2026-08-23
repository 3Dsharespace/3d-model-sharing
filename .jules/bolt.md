## 2024-05-14 - Memoize list items in search views
**Learning:** In React applications where search inputs trigger full page re-renders on every keystroke (like in Home.jsx and Explore.jsx), list items rendered in loops become an O(N) re-rendering bottleneck.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo when they are used in lists whose parent components frequently update due to state changes that don't affect the item's props.
