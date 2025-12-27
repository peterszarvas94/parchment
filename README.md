# Nanotext

The simplest WYSIWYG text editor for web. ~15KB, no dependencies.

Forked from [pell](https://github.com/jaredreich/pell).

## Install

```bash
npm install nanotext
```

## Usage

```javascript
import { init } from "nanotext";
import "nanotext/dist/nanotext.css";

const editor = init({
  element: document.getElementById("editor"),
  onChange: (html) => console.log(html),
});
```

See full example in `/examples`.

## Options

- `element` - Container element (default: `document.body`)
- `onChange` - Callback when content changes (default: `() => {}`)
- `content` - Initial HTML content
- `actions` - Array of action names (default: all)
- `classes` - Custom CSS class names
- `defaultParagraphSeparator` - `'p'` or `'div'` (default: `'p'`)
- `styleWithCSS` - Use inline styles (default: `false`)
- `handleImageClick` - Custom image handler

## Actions

bold, italic, underline, strikethrough, heading1, heading2, paragraph, quote, olist, ulist, code, line, link, image, justifyLeft, justifyCenter, justifyRight, justifyFull, subscript, superscript, undo, redo

### Custom Actions

You can override default action properties or add custom actions:

```javascript
init({
  actions: [
    'bold',                           // Use default
    { name: 'italic', icon: 'I' },    // Override just icon
    { 
      name: 'custom',                 // Custom action
      icon: '🎨',
      title: 'Custom Action',
      result: () => alert('Custom!')
    }
  ]
});
```

## License

MIT

