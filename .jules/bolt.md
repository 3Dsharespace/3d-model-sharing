## 2024-10-02 - React List Rendering Bottlenecks
**Learning:** The architectural pattern of triggering full page re-renders on search inputs (seen in `Explore.jsx` and `Home.jsx`) can cause severe O(N) re-rendering bottlenecks if the list item components are not memoized.
**Action:** Always wrap heavy list item components, like `ModelCard`, in `React.memo()` to prevent unnecessary re-renders when they are mounted in a feed or search view, especially if their props depend primarily on their individual data context rather than global state changes.
