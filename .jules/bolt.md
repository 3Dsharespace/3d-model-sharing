## 2024-11-07 - React Component Optimization
**Learning:** Found potential for O(n) re-rendering bottleneck when large lists of components are rendered (e.g. ModelCard) where a parent component updates frequently (e.g. on search input change).
**Action:** Implement `React.memo` on list item components like `ModelCard` to prevent unnecessary re-renders.
