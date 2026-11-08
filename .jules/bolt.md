## 2024-03-20 - Unnecessary O(N) Re-renders on Search Input
**Learning:** Root components like Home and Explore trigger full page re-renders on every keystroke of their search inputs. This causes unmemoized list item components like ModelCard to re-render unnecessarily, leading to O(N) performance bottlenecks when displaying large lists.
**Action:** Always wrap list item components in `memo` to prevent re-renders when the parent's state changes without affecting the list item's props.
