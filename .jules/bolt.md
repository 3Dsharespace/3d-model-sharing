## 2024-05-18 - React.memo() on List Items for Search Performance
**Learning:** In architectures where search inputs are placed in root components (like `Home.jsx` and `Explore.jsx`), typing triggers full page re-renders on every keystroke. This causes an O(N) performance bottleneck when rendering lists of models.
**Action:** Always wrap list item components like `ModelCard` in `React.memo` to prevent unnecessary re-renders of the entire list when only the root component state (search query) changes.
