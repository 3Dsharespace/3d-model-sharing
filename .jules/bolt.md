## 2024-11-10 - O(N) Re-rendering Bottleneck in Lists
**Learning:** In applications where root components contain both search inputs and large lists of items (e.g., Home, Explore), keystrokes in the search input can trigger full page re-renders, causing O(N) rendering performance bottlenecks.
**Action:** Always wrap frequently rendered list item components in `React.memo()` to prevent unnecessary re-renders when parent state changes that don't affect the item's props. Ensure `memo` is explicitly imported.
