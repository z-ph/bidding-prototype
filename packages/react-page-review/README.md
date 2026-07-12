# react-page-review

A React page review tool for collecting UI feedback through element selection and viewport boxing.

## Features

- Element review: hover to highlight, click to annotate
- Viewport review: drag to box a region
- Draggable toolbar
- localStorage persistence
- Export to JSON / Markdown
- Zero UI framework dependency

## Install

```bash
npm install react-page-review
```

Peer dependencies:

```bash
npm install react react-dom
```

## Usage

```jsx
import { useState } from 'react'
import { ReviewTool } from 'react-page-review'
import 'react-page-review/style.css'

function App() {
  const [active, setActive] = useState(false)

  return (
    <>
      <button onClick={() => setActive(true)}>Start Review</button>
      <ReviewTool active={active} onActiveChange={setActive} pagePath="/dashboard" />
    </>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `boolean` | `false` | Controls review overlay visibility |
| `pagePath` | `string` | current path | Page identifier for grouping reviews |
| `pageName` | `string` | `pagePath` | Display name of the page |
| `storageKey` | `string` | `'page-reviews'` | localStorage key |
| `onActiveChange` | `(active: boolean) => void` | - | Callback when overlay opens/closes |
| `onAdd` / `onUpdate` / `onDelete` / `onClear` / `onExport` | `function` | - | Event callbacks |

## Hook

```js
import { usePageReview } from 'react-page-review'

const { reviews, addReview, exportToJSON } = usePageReview({
  storageKey: 'my-reviews'
})
```

## License

MIT
