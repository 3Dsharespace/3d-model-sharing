## 2024-06-10 - React.memo for ModelCard
**Learning:** The frontend application exhibits an architectural pattern where search inputs in root components (like Home.jsx and Explore.jsx) trigger full page re-renders on every keystroke. This causes all child components in lists to re-render, creating an O(N) performance bottleneck.
**Action:** Always wrap list item components (e.g., ModelCard) in React.memo to prevent these unnecessary and costly O(N) re-renders, especially when used in root-level search/filtering contexts.
## 2024-06-10 - Do not modify CI workflows to suppress failures
**Learning:** Adding `|| true` to masking CI step failures like `npm audit`, `npm run lint` or `npm run test` is a dangerous anti-pattern.
**Action:** Always fix the underlying codebase or dependencies rather than ignoring the output by appending `|| true`.
