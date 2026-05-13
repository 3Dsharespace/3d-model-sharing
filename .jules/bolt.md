## 2024-05-18 - Derived State Anti-pattern in React Components
**Learning:** Found instances where derived state (e.g., filtered models, computed stats) was being manually synchronized using `useState` + `useEffect`. This leads to unnecessary double re-renders and degrades performance, particularly on search or filter updates. Also found unoptimized string manipulation (`toLowerCase()`) inside `.filter` loops.
**Action:** Replace `useEffect` + `useState` synchronization with `useMemo` for derived states to ensure they compute synchronously during render only when dependencies change. Hoist invariant computations (like `query.toLowerCase()`) out of loops to prevent redundant processing.

## 2024-05-18 - Rules of Hooks Violation during Optimization
**Learning:** React rules of hooks explicitly state that hooks must be called at the top level of a component. Placing `React.useMemo()` calls inline within JSX elements, especially in a component with conditional early returns (e.g. `if (loading) return ...`), will cause application crashes with "Rendered more hooks than during the previous render" exceptions.
**Action:** When memoizing derived state or calculations, always define the hooks at the top level of the component body, before any conditional logic or return statements.
