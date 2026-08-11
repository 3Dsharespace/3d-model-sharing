## 2024-05-24 - Search Input Triggering Full Page Re-renders
**Learning:** In this architecture, search inputs in root components trigger full page re-renders on every keystroke, causing O(N) performance bottlenecks in list items.
**Action:** Always wrap list item components (like ModelCard) in React.memo when rendered inside these root views.
