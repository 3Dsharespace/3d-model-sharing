
## 2024-05-24 - Search Input Triggers Full Page Re-renders
**Learning:** In the root components `Home.jsx` and `Explore.jsx`, updating the search input state triggers a full page re-render on every keystroke. This causes all list items (e.g. `ModelCard`) to re-render, creating an O(N) performance bottleneck.
**Action:** Always wrap list item components (like `ModelCard`) in `React.memo` to prevent them from re-rendering unnecessarily when the parent component's state changes but the list items' props remain the same.
