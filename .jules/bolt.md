## 2026-10-05 - ModelCard React.memo Optimization
**Learning:** Found that the architectural pattern of search inputs inside parent components (like `Home` and `Explore`) trigger full page re-renders on keystrokes.
**Action:** Always wrap heavily-repeated list components like `ModelCard` in `React.memo` to avoid O(N) re-renders due to parent state updates.
