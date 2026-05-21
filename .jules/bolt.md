## 2024-05-22 - Memoizing Shared Components
**Learning:** Optimizing `ModelCard` with `React.memo` is a straightforward way to reduce unnecessary re-renders in list views (like Home and Explore) without adding major architectural complexity.
**Action:** When a component is frequently rendered in lists and its props are mostly primitive or stable, wrapping it in `React.memo` provides a good performance boost by preventing re-renders when parent components update.
