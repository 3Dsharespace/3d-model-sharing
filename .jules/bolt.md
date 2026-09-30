## 2024-10-24 - React List Rendering Bottleneck
**Learning:** Found an architectural pattern where root components (like `Explore.jsx`) trigger full page re-renders on every keystroke in search inputs. Rendering long lists of `ModelCard` components synchronously causes severe main thread blocking if those child components are not memoized.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when parent components update state frequently.
