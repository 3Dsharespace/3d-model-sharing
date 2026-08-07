## 2026-08-07 - Prevent O(N) re-renders in ModelCard
**Learning:** The frontend application has an architectural pattern where search inputs in root components (like `Home.jsx` and `Explore.jsx`) trigger full page re-renders on every keystroke. This causes all rendered list items to re-render, creating an O(N) performance bottleneck.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent unnecessary re-rendering when parent components update state frequently. Ensure `memo` is explicitly imported from `react`.
