## 2024-05-23 - Prevent O(N) re-renders in list views
**Learning:** In list views like `Home.jsx` and `Explore.jsx`, search inputs at the root level can trigger full page re-renders on every keystroke, which is a performance bottleneck for O(N) lists.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent unnecessary re-rendering.
