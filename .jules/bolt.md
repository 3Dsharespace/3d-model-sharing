## 2024-05-19 - Missing Component Memoization Causing O(N) Re-renders
**Learning:** React components rendered inside large lists or search results (like `ModelCard` in `Home.jsx` and `Explore.jsx`) are missing memoization. When search inputs in the parent components update the state on every keystroke, React re-renders the entire list of `ModelCard` components, leading to O(N) rendering performance bottlenecks.
**Action:** Always wrap list item components like `ModelCard` in `React.memo()` to prevent unnecessary re-renders when their props haven't changed.
