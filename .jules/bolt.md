## 2026-08-09 - [Memoize List Items to Prevent O(N) Re-renders]
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components trigger full page re-renders on every keystroke. List item components like ModelCard will re-render unnecessarily on each keystroke, creating an O(N) performance bottleneck.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent these unnecessary O(N) re-renders during parent keystroke events.
