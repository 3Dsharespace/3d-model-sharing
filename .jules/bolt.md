## 2024-10-25 - React.memo on List Components
**Learning:** Search inputs in root components (like Explore.jsx) trigger full page re-renders on every keystroke. This causes all list item components (e.g., ModelCard) to re-render, leading to an O(N) performance bottleneck.
**Action:** Always wrap list item components in React.memo to prevent unnecessary re-renders when their props haven't changed.
