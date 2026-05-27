## 2024-05-24 - Search Input Re-renders List Items
**Learning:** In root components like `Home.jsx` and `Explore.jsx`, search input state changes trigger full page re-renders on every keystroke. This causes all rendered list items (like `ModelCard` instances) to re-render, creating an O(N) performance bottleneck that blocks the main thread and makes the input feel sluggish.
**Action:** Always wrap list item components in `React.memo` when they are rendered in a list within a component that frequently updates its state (e.g., from an input field) to prevent unnecessary cascading re-renders.
