## 2024-05-24 - ModelCard memoization
**Learning:** Found an architectural pattern where root components (like Home, Explore) trigger full page re-renders on keystrokes in search inputs. Wrapping list item components like ModelCard in React.memo is critical to prevent O(N) re-rendering bottlenecks.
**Action:** Always wrap list item components in React.memo to mitigate this issue.
