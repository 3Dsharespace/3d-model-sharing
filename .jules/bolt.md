## 2024-06-25 - React.memo for ModelCard
**Learning:** Found a performance bottleneck where root components like `Home.jsx` and `Explore.jsx` cause a full page re-render on every keystroke in search inputs. For a list of `ModelCard` components, this results in O(N) re-renders, causing noticeable lag on large lists.
**Action:** Wrapped `ModelCard` in `React.memo` to prevent unnecessary re-renders when its props (specifically the `model` object and `compact` boolean) do not change. Ensure `memo` is explicitly imported from `react`.
