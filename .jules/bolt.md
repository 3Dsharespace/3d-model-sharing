## 2024-05-01 - O(N) Re-rendering Bottleneck on Search
**Learning:** Root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke in search inputs. List items like ModelCard are re-rendered unnecesarily, creating an O(N) performance bottleneck.
**Action:** Always wrap list item components like ModelCard in React.memo to prevent unnecessary re-rendering of large lists.
