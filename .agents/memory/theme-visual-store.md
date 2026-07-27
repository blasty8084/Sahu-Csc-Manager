---
name: Theme visual store
description: Performance boundary for theme changes in the SAHU CSC frontend
---

Theme is treated as visual state, not application data: keep the store outside the React tree, update the root class synchronously, and subscribe only controls or renderers that must branch on the active mode.

**Why:** Theme toggles should not re-render data-heavy pages or alter their geometry, and the no-flash root class must remain authoritative before React paints.

**How to apply:** Prefer semantic CSS variables and dark selectors for page styling. Use the theme hook only for accessible controls, native-renderer configuration, or genuinely mode-dependent markup.