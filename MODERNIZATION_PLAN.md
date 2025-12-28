# Nanotext Modernization Plan

## Overview

This document outlines the plan to modernize Nanotext by removing deprecated APIs and implementing a clean, predictable architecture using modern web standards.

---

## Core Architecture Decisions

### 1. Remove Deprecated APIs
- ❌ **Remove:** `document.execCommand()` (deprecated)
- ❌ **Remove:** `document.queryCommandState()` (deprecated)
- ❌ **Remove:** `document.queryCommandValue()` (deprecated)
- ✅ **Use:** Modern Selection API + Range API + Direct DOM manipulation

### 2. Flat Content Structure
The content div (`contentEditable`) will only contain these direct children:

**Block Elements:**
- `<p>` - Paragraph (default, can contain text, spans, images)
- `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>` - Headings
- `<blockquote>` - Quotes
- `<pre>` or `<code>` - Code blocks (use standard)
- `<hr>` - Horizontal rule
- `<ul>`, `<ol>` - Lists (containing `<li>` children)

**Inline Elements (within blocks):**
- `<span style="...">` - Inline formatting
- `<a href="...">` - Links
- `<sub>`, `<sup>` - Subscript/Superscript
- `<img>` - Images (always inline within `<p>` or `<li>`)

**NO NESTING:**
- No `<div>` in `<div>`
- No nested block elements (except `<li>` inside `<ul>`/`<ol>`)
- No nested `<span>` elements

### 3. Inline Formatting Strategy

**Use inline styles on `<span>` elements:**
```html
<!-- Bold -->
<span style="font-weight: bold">text</span>

<!-- Italic -->
<span style="font-style: italic">text</span>

<!-- Underline -->
<span style="text-decoration: underline">text</span>

<!-- Strikethrough -->
<span style="text-decoration: line-through">text</span>

<!-- Multiple styles merged into one span -->
<span style="font-weight: bold; font-style: italic">text</span>
```

**Special inline elements (exceptions to span rule):**
- `<a href="...">text</a>` - Links
- `<sub>text</sub>` - Subscript
- `<sup>text</sup>` - Superscript

**Block-level styles:**
```html
<!-- Text alignment on block elements -->
<p style="text-align: center">centered text</p>
<h1 style="text-align: right">right-aligned heading</h1>
```

### 4. Two-State Button System (Google Docs Style)

**Button States:**
- **OFF** - Style not applied to ALL text in selection (any text is unstyled)
- **ON** - Style applied to ALL text in selection (100% coverage)

**Toggle Logic:**
```
OFF → (click) → ON (apply to entire selection)
ON → (click) → OFF (remove from entire selection)
```

**State Detection:**
- If ANY character in selection lacks the style → OFF
- Only if ALL characters have the style → ON
- Simple boolean check, no mixed state needed

**Visual States:**
- OFF: Normal button appearance
- ON: Highlighted (`.nanotext-button-selected`)

---

## UX Decisions

### Selection & State Detection (Google Docs Behavior)

**Context-Aware State (No Global Pending Styles):**

Button state is determined by cursor position or selection:

1. **No Selection (Cursor Only):**
   - Cursor in normal text → Button OFF
   - Cursor in styled text → Button ON
   - State reflects the style at cursor position

2. **With Selection:**
   - **ALL** selected text has style → Button ON
   - **ANY** selected text lacks style → Button OFF

3. **Typing Behavior:**
   - Browser naturally continues style at cursor position
   - No need to track "pending styles" manually
   - Typing in bold text creates bold text
   - Typing in normal text creates normal text

**Toggle Behavior:**
- Button OFF → Apply style to **entire** selection
- Button ON → Remove style from **entire** selection

**Key Insight:** No global state tracking needed! Just inspect DOM at cursor/selection position.

### Image Insertion

**Always inline within paragraph:**
```javascript
// Empty paragraph - insert image inside
<p><br></p> + insertImage(url) 
→ <p><img src="url" /></p>

// Non-empty paragraph - insert inline at cursor
<p>Hello World</p> + insertImage(url) at cursor
→ <p>Hello<img src="url" />World</p>
```

**Always inside `<p>` tag** - images are inline elements, never block-level.

### List Creation

**Convert selected paragraphs to list items:**
```javascript
// Single paragraph
<p>Item</p> + click UL
→ <ul><li>Item</li></ul>

// Multiple paragraphs selected
<p>Item 1</p>
<p>Item 2</p>
<p>Item 3</p> + click UL
→ <ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

**List items can contain inline formatting:**
```html
<ul>
  <li>Buy <span style="font-weight: bold">milk</span></li>
</ul>
```

**Don't intercept Enter key:**
- Rely on browser's default behavior for creating new list items
- Use `normalizeContent()` to clean up any issues

### Span Management

**No merging on partial selections:**
- Keep implementation simple
- Multiple adjacent spans with same styles are OK
- `normalizeContent()` can optionally merge them later

---

## Implementation Plan

### Phase 1: Helper Functions - Selection & Range

**Selection Helpers:**
```typescript
function getEditorSelection(): { selection: Selection; range: Range } | null
function getAllTextNodesInSelection(selection: Selection): Node[]
function getBlockElement(node: Node): HTMLElement | null
```

**Style Detection:**
```typescript
function nodeHasStyle(node: Node, style: string, value: string): boolean
function getStyleState(selection: Selection, style: string, value: string): boolean
function getInlineStyles(node: Node): Record<string, string>
function getBlockType(selection: Selection): string | null
function isInList(selection: Selection): boolean
```

**Style Manipulation:**
```typescript
function applyStyleToSelection(selection: Selection, style: string, value: string): void
function removeStyleFromSelection(selection: Selection, style: string): void
function toggleInlineStyle(style: string, value: string): void
function clearAllStyles(selection: Selection): void // Remove all inline styles and empty spans
function cleanupEmptySpans(element: HTMLElement): void // Remove spans with no text content
```

**Block Manipulation:**
```typescript
function changeBlockType(tagName: string): void
function insertList(type: 'ul' | 'ol'): void
function insertImage(url: string): void
```

**DOM Normalization:**
```typescript
function normalizeContent(contentDiv: HTMLElement): void
// - Flatten nested divs/blocks
// - Merge adjacent spans with identical styles
// - Remove empty spans (NO text content)
// - Remove spans with no style attributes
// - Wrap orphaned text nodes in <p>
// - Ensure only allowed block elements exist
```

### Phase 2: Update Action Definitions

**Inline Format Actions:**
```typescript
{
  name: "bold",
  result: () => toggleInlineStyle('font-weight', 'bold'),
  state: () => getStyleState(getSelection(), 'font-weight', 'bold') // returns boolean
}

{
  name: "italic",
  result: () => toggleInlineStyle('font-style', 'italic'),
  state: () => getStyleState(getSelection(), 'font-style', 'italic')
}

{
  name: "underline",
  result: () => toggleInlineStyle('text-decoration', 'underline'),
  state: () => getStyleState(getSelection(), 'text-decoration', 'underline')
}

{
  name: "strikeThrough",
  result: () => toggleInlineStyle('text-decoration', 'line-through'),
  state: () => getStyleState(getSelection(), 'text-decoration', 'line-through')
}
```

**Block Format Actions:**
```typescript
{
  name: "heading1",
  result: () => changeBlockType('h1'),
  state: () => getBlockType(getSelection()) === 'h1' // returns boolean
}

{
  name: "paragraph",
  result: () => changeBlockType('p'),
  state: () => getBlockType(getSelection()) === 'p'
}

{
  name: "quote",
  result: () => changeBlockType('blockquote'),
  state: () => getBlockType(getSelection()) === 'blockquote'
}
```

**List Actions:**
```typescript
{
  name: "olist",
  result: () => insertList('ol'),
  state: () => isInList(getSelection()) && getBlockType(getSelection()) === 'ol'
}

{
  name: "ulist",
  result: () => insertList('ul'),
  state: () => isInList(getSelection()) && getBlockType(getSelection()) === 'ul'
}
```

**Special Actions:**
```typescript
{
  name: "subscript",
  result: () => wrapSelection('sub'),
  state: () => isSelectionWrappedIn('sub')
}

{
  name: "superscript",
  result: () => wrapSelection('sup'),
  state: () => isSelectionWrappedIn('sup')
}

{
  name: "link",
  result: () => {
    const url = window.prompt("Enter the link URL");
    if (url) createLink(url);
  },
  state: () => isSelectionWrappedIn('a')
}

{
  name: "image",
  result: () => {
    const url = window.prompt("Insert image url");
    if (url) insertImage(url);
  }
}
```

**Alignment Actions:**
```typescript
{
  name: "justifyLeft",
  result: () => toggleBlockStyle('text-align', 'left'),
  state: () => getBlockStyle(getSelection(), 'text-align') === 'left'
}
```

**Clear Formatting Action:**
```typescript
{
  name: "removeFormat",
  icon: '<svg>...</svg>', // eraser or clear format icon
  title: "Clear Formatting",
  result: () => {
    const sel = getEditorSelection();
    if (sel) clearAllStyles(sel.selection);
  }
  // No state function - always available
}
```

### Phase 3: Update Button Rendering

**Two-state button logic:**
```typescript
if (action.state) {
  const handler = () => {
    if (action.state) {
      const isActive = action.state(); // returns boolean
      button.classList.toggle(classes.selected, isActive);
    }
  };
  
  addEventListener(content, "keyup", handler);
  addEventListener(content, "mouseup", handler);
  addEventListener(button, "click", handler);
}
```

### Phase 4: CSS Updates

**No changes needed:**
- Already have `.nanotext-button-selected` for ON state
- Default styling for OFF state
- No indeterminate state required

### Phase 5: Input Event Handler

**Hook normalization:**
```typescript
content.oninput = (event: Event) => {
  const target = event.target as HTMLElement;
  
  // Normalize DOM structure
  normalizeContent(target);
  
  // Trigger onChange callback
  onChange(target.innerHTML);
};
```

### Phase 6: Remove Deprecated Code

**Delete these functions:**
```typescript
// Remove
function exec(command: string, value: string | null = null): boolean
function queryCommandState(command: string): boolean
function queryCommandValue(command: string): string
```

**Update exports:**
```typescript
// Remove from exports
export { 
  // FORMAT_BLOCK, // REMOVE
  // queryCommandState, // REMOVE
  // exec, // REMOVE
  insertImage, 
  init 
}
```

---

## Testing Strategy

### Unit Tests

**State detection:**
- Test `getStyleState()` with no style, full style, mixed style
- Test `getBlockType()` with different block elements
- Test `isInList()` inside and outside lists

**Style manipulation:**
- Test `toggleInlineStyle()` with all three states
- Test style merging in single span
- Test style removal without deleting span

**Normalization:**
- Test flattening nested divs
- Test merging adjacent spans
- Test wrapping orphaned text
- Test removing invalid elements

### Integration Tests

**User workflows:**
- Type text → select → bold → italic → unbold
- Create list → type items → format items
- Insert image in empty/non-empty paragraph
- Change block types with formatted content
- Mixed selection toggles

---

## Migration Notes

### Breaking Changes

1. **HTML output format changed:**
   - Old: `<b>text</b>`, `<i>text</i>`, `<u>text</u>`
   - New: `<span style="...">text</span>`

2. **State function return type changed:**
   - Old: `boolean`
   - New: `'on' | 'off' | 'indeterminate'`

3. **Removed exports:**
   - `FORMAT_BLOCK`
   - `queryCommandState`
   - `exec`

4. **CSS classes added:**
   - `.nanotext-button-indeterminate`

### Backward Compatibility

**Content migration:**
- Existing content with `<b>`, `<i>`, `<u>` tags will be normalized on first edit
- `normalizeContent()` will convert semantic tags to styled spans

---

## Open Questions (ANSWERED)

- ✅ **Subscript/Superscript:** Use `<sub>` and `<sup>` tags
- ✅ **Strikethrough:** Use inline style `text-decoration: line-through`
- ✅ **Code blocks:** Use `<pre>` or `<code>` tags (whatever is standard)
- ✅ **Links:** Keep `<a href="...">` tags (special case)
- ✅ **Horizontal rule:** Keep `<hr>` as block element

---

## API Changes

### Current API (String-based)
```typescript
const editor = init({
  element: document.getElementById("editor"),
  actions: ['bold', 'italic', 'underline', 'heading1', 'heading2']
});
```

### New API (Object-based)
```typescript
const editor = init({
  element: document.getElementById("editor"),
  actions: [
    { name: 'bold' },
    { name: 'italic' },
    { name: 'underline' },
    { name: 'heading1' },
    { name: 'heading2' }
  ]
});
```

**Rationale:**
- More explicit and consistent
- Easier to customize individual actions
- Better TypeScript support
- Can override title, icon, result, or state per action

**Custom actions still supported:**
```typescript
actions: [
  { name: 'bold' }, // Use default
  { 
    name: 'italic', 
    title: 'Make Italic', // Override title
    icon: '<svg>...</svg>' // Override icon
  },
  {
    name: 'custom',
    icon: '...',
    title: 'Custom Action',
    result: () => { /* custom logic */ },
    state: () => false
  }
]
```

---

## Timeline

1. **Phase 1-2:** Core helper functions (2-3 days)
2. **Phase 3-4:** Button system & CSS (1 day)
3. **Phase 5:** Integration & normalization (1 day)
4. **Phase 6:** Cleanup & testing (1 day)
5. **Documentation:** Update AGENTS.md and README (1 day)

**Total estimated time:** ~1 week

---

## Success Criteria

- ✅ No deprecation warnings in console
- ✅ All actions work without execCommand
- ✅ Flat DOM structure maintained
- ✅ Three-state buttons work correctly
- ✅ All existing tests pass (with updates)
- ✅ Example page works identically to before
- ✅ Clean, maintainable codebase

---

*Document created: 2025-12-28*
*Status: Planning Complete - Ready for Implementation*
