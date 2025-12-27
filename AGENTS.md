# Agent Guidelines for Nanotext

This document provides coding guidelines and conventions for AI coding agents working on the Nanotext WYSIWYG editor codebase.

## Project Overview

Nanotext is a lightweight, dependency-free WYSIWYG text editor forked from Pell. It uses vanilla JavaScript and CSS with a focus on simplicity and minimal bundle size.

**Key Files:**
- `src/nanotext.js` - Main editor implementation
- `src/nanotext.css` - Editor styling
- `example/index.html` - Demo/test page
- `vite.config.js` - Build configuration

## Build Commands

### Development
```bash
npm run dev       # Start dev server at http://localhost:3000
```

### Production
```bash
npm run build     # Build for production (outputs to dist/)
npm run preview   # Preview production build locally
```

### Installation
```bash
npm install       # Install dependencies
```

**Note:** There are currently no automated tests or linting configured. Manual testing should be done via `npm run dev`.

## Code Style Guidelines

### JavaScript

#### File Structure
- Use ES6 modules with named exports
- Group related functionality together
- Export constants and functions that may be reused

#### Imports/Exports
```javascript
// Export helper functions and constants
export const formatBlock = "formatBlock";
export const exec = (command, value = null) => ...;
export function insertImage(url) { ... }

// Main init function is the primary export
export const init = (settings) => { ... };
```

#### Naming Conventions
- **Variables/Functions:** camelCase (`defaultActions`, `createElement`, `insertImage`)
- **Constants:** camelCase for string constants (`defaultParagraphSeparatorString`)
- **CSS Classes:** kebab-case with `nanotext-` prefix (`nanotext-button`, `nanotext-actionbar`)
- **Internal helpers:** camelCase, not exported unless needed externally

#### Functions
- Use arrow functions for simple helpers
- Use function declarations for exported functions with complex logic
- Single-line arrow functions when possible for brevity

```javascript
// Helper functions - arrow style
const addEventListener = (parent, type, listener) =>
  parent.addEventListener(type, listener);

// Exported functions with logic - function declaration
export function insertImage(url) {
  const imgWrapper = document.createElement("div");
  // ... implementation
}
```

#### DOM Manipulation
- Use helper functions to abstract common DOM operations
- Leverage native DOM APIs (no jQuery or similar)
- Cache DOM references when reused

```javascript
const createElement = (tag) => document.createElement(tag);
const appendChild = (parent, child) => parent.appendChild(child);
```

#### Configuration Objects
- Use configuration objects for flexible APIs
- Provide sensible defaults
- Merge user settings with defaults using spread operator

```javascript
const classes = { ...defaultClasses, ...settings.classes };
```

#### Arrays and Data Structures
- Use arrays of objects for action definitions
- Each action should have: `name`, `icon`, `title`, `result`, optionally `state`

```javascript
const defaultActions = [
  {
    name: "bold",
    icon: '<svg>...</svg>',
    title: "Bold",
    state: () => queryCommandState("bold"),
    result: () => exec("bold"),
  },
  // ...
];
```

#### Event Handling
- Use inline event handlers for simple cases (`oninput`, `onclick`)
- Use `addEventListener` helper for complex handlers
- Handle edge cases (e.g., check `sel.rangeCount` before using selection)

```javascript
button.onclick = () => action.result() && content.focus();
```

#### Error Handling
- Use early returns for guard clauses
- Check preconditions before proceeding
- No try-catch unless dealing with async operations or external APIs

```javascript
if (!sel.rangeCount) return;
```

### CSS

#### Naming
- All classes use `nanotext-` prefix
- Use kebab-case for class names
- Descriptive names based on purpose (`nanotext-actionbar`, `nanotext-button-selected`)

#### Structure
- Group related selectors
- Use modern CSS features (`:has()`, CSS nesting where supported)
- Keep specificity low (single class selectors preferred)

```css
.nanotext-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.nanotext-button-selected {
  background-color: #f0f0f0;
}
```

#### Layout
- Use flexbox for layouts
- Prefer modern CSS properties (`fit-content`, `sticky`)
- Mobile-friendly with `flex-wrap`

### HTML

#### Icons
- Use inline SVG for icons
- Include proper accessibility attributes
- Use Lucide icon set conventions (viewBox="0 0 24 24", stroke-width="2")

#### Semantic Elements
- Use `<button type="button">` for action buttons
- Use contentEditable for editor content
- Use `<output>` for displaying results

## Architecture Patterns

### Initialization Pattern
The editor follows a single initialization pattern:

```javascript
const editor = init({
  element: document.getElementById('editor'),
  content: '<div>Initial content...</div>',
  onChange: (html) => { /* handle changes */ },
  actions: ['bold', 'italic'], // optional
  classes: { /* custom classes */ }, // optional
});
```

### Action System
- Actions are objects with name, icon, title, result, and optional state
- Users can provide action names (strings) or full action objects
- Default actions are merged with user-provided actions

### DOM Structure
- Editor consists of actionbar + content area
- Actionbar contains buttons for each action
- Content area is contentEditable div

## Common Patterns

### Adding New Actions
1. Add to `defaultActions` array with required properties
2. Include icon as inline SVG
3. Implement `result()` function using `exec()` helper
4. Add `state()` if action has toggle state (bold, italic, etc.)

### Working with execCommand
- Use the `exec()` helper wrapper
- First parameter is command name, second is optional value
- Common commands: `bold`, `italic`, `formatBlock`, `insertOrderedList`

### CSS Class Management
- Store class names in `defaultClasses` object
- Allow users to override via settings
- Apply classes using `className` property

## Migration Notes

This project was forked from Pell and is being renamed to Nanotext. When making changes:
- Use `nanotext-` prefix for new CSS classes (not `pell-`)
- Update any remaining `pell` references to `nanotext`
- Maintain backward compatibility where reasonable
- Update package.json metadata when making significant changes

## File Naming
- Source files: `nanotext.js`, `nanotext.css`
- Package main: `./src/nanotext.js`
- Keep example files in `example/` directory
