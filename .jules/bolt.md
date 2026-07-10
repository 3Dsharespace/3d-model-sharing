## 2024-06-25 - Prevent O(N) Re-renders on Keystrokes
**Learning:** Root components (like `Home.jsx` and `Explore.jsx`) often have search inputs that trigger a full page re-render on every keystroke. List item components (like `ModelCard`) rendered inside them will all re-render, creating an O(N) performance bottleneck.
**Action:** Always wrap list item components (e.g., `ModelCard`) in `React.memo` to prevent O(N) re-rendering when the parent component's state changes frequently (like during typing).
