## 2024-05-18 - [React.memo in List Items]
**Learning:** Found an architectural pattern where root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke in search inputs. Without `React.memo`, this causes O(N) re-renders for every item in long lists like ModelCard, creating a significant performance bottleneck.
**Action:** Always wrap list item components (e.g., ModelCard) in `React.memo` to prevent O(N) re-rendering performance bottlenecks, ensuring they only re-render when their specific props change.
