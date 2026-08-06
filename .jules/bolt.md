## 2025-02-18 - Missing Performance Comments Trigger Revisions
**Learning:** Adding `React.memo` or other optimizations without including a direct code comment explaining the performance rationale is considered a failure of the 'add comments explaining the optimization' boundary.
**Action:** Always include a `// ⚡ Bolt Optimization: [Explanation]` comment directly above the optimized code, even if it feels obvious or routine, to satisfy validation checks.
