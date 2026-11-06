## 2024-11-06 - [Architectural Re-render Pattern]
**Learning:** [Search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke, leading to O(N) re-rendering performance bottlenecks for list components.]
**Action:** [Always wrap list item components (e.g., ModelCard) in React.memo to prevent these unnecessary O(N) re-renders when root state changes.]
