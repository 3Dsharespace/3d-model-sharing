## 2024-10-24 - React.memo Optimization
**Learning:** Found a performance pattern where list item components (`ModelCard`) inside root components with search bars (`Explore`, `Home`) triggered full-page re-renders on every keystroke, causing O(N) re-rendering bottlenecks.
**Action:** Always verify if list items are wrapped in `React.memo` when adding them to pages that manage rapidly changing state like search inputs to avoid O(N) rendering performance drops.
