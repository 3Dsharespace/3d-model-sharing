## 2024-05-11 - [React Derived State Anti-pattern]
**Learning:** Using `useEffect` to synchronize derived state (`filteredModels` based on `models` and filters) causes a double-render cycle, negatively impacting performance when filtering/sorting large lists.
**Action:** Replace `useEffect` and `useState` for derived data with `useMemo`. This computes the filtered/sorted data synchronously during the render phase and caches the result, effectively reducing the number of component re-renders by 50% on filter changes while maintaining correctness.
