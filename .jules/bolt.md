## 2024-07-22 - Missing Memoization on List Components
**Learning:** The frontend application's root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke in their search inputs. List items like `ModelCard` re-render O(N) times during these state updates because they lack memoization.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when they are rendered inside grids/lists in root components.
