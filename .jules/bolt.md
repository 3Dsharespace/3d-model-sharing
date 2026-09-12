## 2024-05-15 - Prevent O(N) re-renders on Search Keystrokes
**Learning:** The frontend architecture triggers full-page re-renders in root components like Home and Explore on every search keystroke, causing O(N) re-renders of list items.
**Action:** Wrap list item components like ModelCard in React.memo to prevent unnecessary re-rendering during search input typing.
