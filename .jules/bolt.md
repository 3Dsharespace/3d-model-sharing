## 2024-11-02 - Unnecessary Re-renders on Search Input Changes
**Learning:** The frontend application root components (`Home.jsx`, `Explore.jsx`) trigger full page re-renders on every keystroke in search inputs. This causes expensive list items like `ModelCard` to re-render O(N) times.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering performance bottlenecks when they rely on simple props.
