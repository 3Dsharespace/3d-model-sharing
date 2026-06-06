## 2024-06-07 - O(N) Re-renders on Keystrokes in Root Components
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. This causes all list items in the asset grid to re-render, creating an O(N) performance bottleneck.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when search inputs or other frequent state updates happen in parent root components.
