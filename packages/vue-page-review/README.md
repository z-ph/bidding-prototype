# vue-page-review

A Vue 3 page review tool for collecting UI feedback through element selection and viewport boxing.

## Features

- Element review: hover to highlight, click to annotate
- Viewport review: drag to box a region
- Draggable toolbar
- localStorage persistence
- Export to JSON / Markdown
- Element Plus UI components

## Install

```bash
npm install vue-page-review
```

Peer dependencies:

```bash
npm install vue element-plus @element-plus/icons-vue
```

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { ReviewTool } from 'vue-page-review'
import 'vue-page-review/style.css'

const active = ref(false)
</script>

<template>
  <button @click="active = true">Start Review</button>
  <ReviewTool v-model:active="active" page-path="/dashboard" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `Boolean` | `false` | Controls review overlay visibility |
| `pagePath` | `String` | current path | Page identifier for grouping reviews |
| `pageName` | `String` | `pagePath` | Display name of the page |
| `storageKey` | `String` | `'page-reviews'` | localStorage key |

## Composable

```js
import { usePageReview } from 'vue-page-review'

const { reviews, addReview, exportToJSON } = usePageReview({
  storageKey: 'my-reviews'
})
```

## License

MIT
