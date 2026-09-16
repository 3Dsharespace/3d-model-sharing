## 2025-02-14 - React.memo for list item components
**Learning:** The application exhibits an architectural pattern where search inputs in root components trigger full page re-renders on every keystroke. Leaving list components unmemoized creates an O(N) performance bottleneck.
**Action:** Always wrap list item components like ModelCard in React.memo to ensure O(1) scaling during parent component re-renders.
