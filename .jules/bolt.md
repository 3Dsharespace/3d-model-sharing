## 2024-06-16 - O(N) Re-rendering in Root Components
**Learning:** Found an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. Because list items like `ModelCard` were not memoized, this caused O(N) re-rendering bottlenecks where every model card was re-rendered unnecessarily as the user typed.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent these O(N) re-rendering performance bottlenecks when they are rendered inside components that update frequently.
