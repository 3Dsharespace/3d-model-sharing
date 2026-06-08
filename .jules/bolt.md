## 2024-06-08 - Search Input Re-renders
**Learning:** Found an architectural pattern where root components (like Home and Explore) that hold search input state trigger full page re-renders on every keystroke. Because these pages contain lists of `ModelCard` components, this causes an O(N) re-rendering performance bottleneck.
**Action:** Always wrap list item components (like `ModelCard`) in `React.memo` to prevent these unnecessary re-renders when parent state updates independently of the item props.
