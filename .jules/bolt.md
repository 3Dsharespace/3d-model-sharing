## 2023-10-27 - Top-level search inputs cause O(N) list re-renders
**Learning:** The frontend app has an architectural pattern where top-level components (`Home.jsx`, `Explore.jsx`) manage search input state. Because this state updates on every keystroke, it triggers a re-render of the entire component tree, including long lists of `ModelCard` components, causing an O(N) performance bottleneck.
**Action:** Always wrap list item components (like `ModelCard`) in `React.memo` to prevent unnecessary re-renders when parent state updates do not affect their props.
