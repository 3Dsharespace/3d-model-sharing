## 2024-05-24 - React Re-render Bottleneck in Search Views
**Learning:** In root components with list views and search inputs (like `Home.jsx` and `Explore.jsx`), state updates from every keystroke trigger a full re-render of the page. This causes O(N) re-rendering of all listed child components (like `ModelCard`), leading to a severe performance bottleneck during typing.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent unnecessary re-rendering during parent state changes unless their specific props have changed.
