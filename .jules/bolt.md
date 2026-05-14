## 2026-05-14 - Prevent Derived State Anti-Pattern
**Learning:** Using `useEffect` to update derived state (like `filteredModels`) based on dependencies (like `models`, `searchQuery`) triggers double render cycles unnecessarily.
**Action:** Replace `useState` + `useEffect` for derived state with `useMemo`. This calculates the derived value synchronously during rendering and prevents the extra render cycle.
