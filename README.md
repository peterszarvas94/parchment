# Nanotext

The simplest WYSIWYG text editor for web. ~15KB, no dependencies.

Forked from [pell](https://github.com/jaredreich/pell).

## Usage

<details>
<summary><strong>1. CDN (Quick Start)</strong></summary>

Directly from CDN for quick prototypes:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nanotext/dist/nanotext.css">
</head>
<body>
  <div id="editor"></div>
  <script type="module">
    import { init } from "https://cdn.jsdelivr.net/npm/nanotext/dist/nanotext.js";
    
    const editor = init({
      element: document.getElementById("editor"),
      onChange: (html) => console.log(html),
    });
  </script>
</body>
</html>
```

</details>

<details>
<summary><strong>2. Download + Import Map</strong></summary>

Download files first for offline/local usage:

```bash
git clone https://github.com/szarvaspeter/nanotext.git
# or download from: https://github.com/szarvaspeter/nanotext/releases
```

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="./dist/nanotext.css">
  <script type="importmap">
  {
    "imports": {
      "nanotext": "./dist/nanotext.js"
    }
  }
  </script>
</head>
<body>
  <div id="editor"></div>
  <script type="module">
    import { init } from "nanotext";
    
    const editor = init({
      element: document.getElementById("editor"),
      onChange: (html) => console.log(html),
    });
  </script>
</body>
</html>
```

</details>

<details>
<summary><strong>3. NPM Package</strong></summary>

Install:
```bash
npm install nanotext
```

Usage:
```javascript
import { init } from "nanotext";
import "nanotext/dist/nanotext.css";

const editor = init({
  element: document.getElementById("editor"),
  onChange: (html) => console.log(html),
});
```

> Note: NPM package provides built files from `dist/` directory. Source TypeScript files are in `src/` for development.

</details>

See full example in `example/index.html`.

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

