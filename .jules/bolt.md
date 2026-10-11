## 2024-05-24 - React.memo for List Items in Search Views
**Learning:** In this architecture, search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke, causing O(N) re-rendering performance bottlenecks for list components.
**Action:** Always wrap list item components like `ModelCard` in `React.memo` to prevent them from re-rendering unnecessarily when the parent's search state changes.
