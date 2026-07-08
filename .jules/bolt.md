## 2024-12-14 - [Architectural Performance Fix: O(N) Re-renders on keystroke]
**Learning:** In the frontend's architectural pattern, search inputs in root components (like `Home.jsx` and `Explore.jsx`) can trigger full page re-renders on every keystroke, leading to an O(N) rendering bottleneck when list items aren't memoized.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when parent components update frequently.
