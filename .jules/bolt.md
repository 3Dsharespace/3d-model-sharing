## 2026-06-05 - Initialized Bolt Journal
**Learning:** Initializing journal to track performance learnings.
**Action:** Keep adding critical performance learnings here.

## 2026-06-05 - Search input triggers full page re-renders
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes all list items to re-render, leading to an O(N) performance bottleneck.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent unnecessary re-renders.
