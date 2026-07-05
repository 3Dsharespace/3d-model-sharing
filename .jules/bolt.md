## 2024-05-30 - ModelCard performance bottleneck
**Learning:** React list item components, such as `ModelCard`, trigger a full page re-render on every keystroke when used inside root components with search inputs (like `Home.jsx` and `Explore.jsx`). This causes an O(N) re-rendering bottleneck.
**Action:** Always wrap list item components in `React.memo` to prevent unnecessary re-renders when their props haven't changed.
