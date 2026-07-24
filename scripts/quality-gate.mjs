#!/usr/bin/env node
// Subagent quality gate — 机械验证（能被脚本描述的都放这里）
// 用法：node scripts/quality-gate.mjs
// 退出码：0=通过，非0=发现问题

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()
const ROUTES = join(ROOT, 'src/routes')
const VIEWS = join(ROOT, 'src/views')
const STORES = join(ROOT, 'src/data')
const PERMISSIONS = join(ROOT, 'src/config/permissions.js')

let errors = 0
let warnings = 0

// ====== Layer 1: Build ======
console.log('\n📦 Layer 1: Build check')
console.log('  (run "npx vite build" in CI)')

// ====== Layer 2: Structure ======
console.log('\n🔧 Layer 2: Structural checks')

// 2.1 每个 .lazy.jsx 必须有配对的 .jsx 路由定义
for (const f of readdirSync(ROUTES)) {
  if (!f.endsWith('.lazy.jsx')) continue
  const jsxF = join(ROUTES, f.replace('.lazy.jsx', '.jsx'))
  if (!existsSync(jsxF)) {
    console.error(`  ❌ Orphan lazy route: ${f}`)
    errors++
  }
}

// 2.2 每个路由 staticData.title 应在 permissions 的 BREADCRUMB_NAMES 中有对应
const permContent = readFileSync(PERMISSIONS, 'utf-8')
for (const f of readdirSync(ROUTES)) {
  if (f.endsWith('.lazy.jsx')) continue
  const content = readFileSync(join(ROUTES, f), 'utf-8')
  const titleM = content.match(/staticData:\s*\{\s*title:\s*'([^']+)'/)
  if (!titleM) continue
  // 检查面包屑映射是否有这个 title
  if (!permContent.includes(`'${titleM[1]}'`)) {
    // 很多公共路由（login/register/portal 等）不在 permissions 的 BREADCRUMB_NAMES 里，正常
    // 只对 admin 路由报告 warning
    if (f.startsWith('admin.')) {
      console.warn(`  ⚠️  Breadcrumb name "${titleM[1]}" may be missing in BREADCRUMB_NAMES`)
      warnings++
    }
  }
}

// 2.3 .lazy.jsx 引用的 view 文件必须存在
for (const f of readdirSync(ROUTES)) {
  if (!f.endsWith('.lazy.jsx')) continue
  const content = readFileSync(join(ROUTES, f), 'utf-8')
  const importM = content.match(/import\s+\w+\s+from\s+'\.\.\/views\/([^']+)'/)
  if (!importM) continue
  const viewFile = importM[1].endsWith('.jsx') ? importM[1] : importM[1] + '.jsx'
  if (!existsSync(join(VIEWS, viewFile))) {
    console.error(`  ❌ ${f}: imported view "${viewFile}" not found`)
    errors++
  }
}

// ====== Layer 3: Data flow ======
console.log('\n🔗 Layer 3: Data flow checks')

// 3.1 提取 store 导出名
function getStoreExports(file) {
  if (!existsSync(file)) return []
  const c = readFileSync(file, 'utf-8')
  const names = []
  // export function/const/let/var name
  for (const m of c.matchAll(/export\s+(?:function|const|let|var)\s+(\w+)/g)) {
    names.push(m[1])
  }
  // export const name = { method1, method2, ... }
  for (const m of c.matchAll(/export\s+const\s+(\w+)\s*=\s*\{/g)) {
    names.push(m[1])
  }
  return names
}

const storeExports = {}
for (const f of readdirSync(STORES)) {
  if (!f.endsWith('.js')) continue
  storeExports[f] = getStoreExports(join(STORES, f))
}

// 3.2 验证页面 import 的 store 导出名是否存在
for (const f of readdirSync(VIEWS)) {
  if (!f.endsWith('.jsx')) continue
  const content = readFileSync(join(VIEWS, f), 'utf-8')
  // import { x, y } from '../data/file'
  for (const m of content.matchAll(/import\s+\{([^}]+)\}\s+from\s+'\.\.[\\/]data[\\/]([^']+)'/g)) {
    const imports = m[1].split(',').map(s => {
      // 处理 "foo as bar" → "foo"
      const parts = s.trim().split(/\s+as\s+/)
      return parts[0].trim()
    }).filter(Boolean)
    const src = m[2].split('/').pop()
    const srcFile = Object.keys(storeExports).find(k => k === src || k === src + '.js')
    if (!srcFile) continue // skip unknown sources (relative paths)
    for (const imp of imports) {
      // Handle destructured: announcementStore → fine, but skip { a, b } = X patterns
      if (imp.includes('{') || imp.includes('}')) continue
      if (!storeExports[srcFile].includes(imp)) {
        console.error(`  ❌ ${f}: imports "${imp}" from ${src} — not found in store exports`)
        errors++
      }
    }
  }
}

// 3.3 组件内写死的常量
const HARDCODED_PATTERNS = [
  [/const\s+PROJECT_NAMES\s*=\s*\{/, 'hardcoded PROJECT_NAMES (consider projectStore instead)'],
  [/const\s+SUPPLIER_NAMES\s*=\s*\{/, 'hardcoded SUPPLIER_NAMES (consider supplierStore instead)'],
]
for (const f of readdirSync(VIEWS)) {
  if (!f.endsWith('.jsx')) continue
  const content = readFileSync(join(VIEWS, f), 'utf-8')
  // SupplierLedger 自己管理映射是合理的
  if (f === 'SupplierLedger.jsx') continue
  for (const [re, msg] of HARDCODED_PATTERNS) {
    if (re.test(content)) {
      console.warn(`  ⚠️  ${f}: ${msg}`)
      warnings++
    }
  }
}

// ====== Report ======
console.log(`\n${'='.repeat(50)}`)
console.log(`Results: ${errors} errors, ${warnings} warnings`)
if (errors === 0) {
  console.log('✅ All mechanical checks passed')
  process.exit(0)
} else {
  console.log('❌ Mechanical checks failed')
  process.exit(1)
}
