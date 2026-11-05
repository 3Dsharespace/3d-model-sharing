## 2024-05-15 - React.memo Optimization for O(N) Re-renders
**Learning:** Found an architectural pattern in this codebase where root components (like Home and Explore) trigger full page re-renders on every keystroke in search inputs. This causes severe O(N) rendering bottlenecks for lists of components (like ModelCard).
**Action:** Always check list item components in this codebase (like cards or rows) and proactively wrap them in React.memo if they don't depend on the parent's rapid state changes (like search inputs). Ensure to explicitly import `memo` from 'react'.
