## 2024-08-20 - Search Input Re-renders
**Learning:** The frontend application's root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke of their search inputs. This creates an O(N) rendering bottleneck when large lists of items are displayed.
**Action:** Always wrap list item components like ModelCard in React.memo (ensuring it's explicitly imported) to prevent unnecessary re-rendering during search input typing.
