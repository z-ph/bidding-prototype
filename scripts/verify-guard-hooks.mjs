// 阶段页面 ProjectEntryGuard hooks 顺序修复验证（0718-ux-004）
// 复现路径：同路由「无 projectId（阻断页）→ 有 projectId（正常渲染）」hash 导航，
// 组件实例复用时 hooks 数量必须不变，控制台不得出现 "Rendered more hooks"。
// 用法：dev server 运行于 http://localhost:5199/bidding-prototype 时执行
//   node scripts/verify-guard-hooks.mjs
import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE = 'http://localhost:5199/bidding-prototype'
const PROJECT_ID = 'P202607188538'
const PAGES = [
  { path: '/admin/expert-extraction', expect: '专家随机抽取' },
  { path: '/admin/opening-hall', expect: '开标大厅' },
  { path: '/admin/evaluation-hall', expect: '评标大厅' },
  { path: '/admin/award-confirm', expect: '确认中标人' },
  { path: '/admin/award-notice', expect: '发送中标通知书' },
  { path: '/admin/notice-publish', expect: '发布公告' }
]

const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(String(err)))

// 登录招标代理
await page.goto(`${BASE}/#/login`)
await page.click('#login-role button:has-text("招标代理")')
await page.waitForURL(/#\/admin/, { timeout: 10000 })

let failed = 0
for (const p of PAGES) {
  errors.length = 0
  let guardOk = false
  let contentOk = false

  // 1) 无 projectId → 阻断页
  await page.goto(`${BASE}/#${p.path}`)
  try {
    await page.getByText('需从项目进入').first().waitFor({ timeout: 8000 })
    guardOk = true
  } catch {}

  // 2) hash 仅查询串变化 → 客户端导航复用组件实例 → 应正常渲染
  await page.goto(`${BASE}/#${p.path}?projectId=${PROJECT_ID}`)
  try {
    await page.getByText(p.expect).first().waitFor({ timeout: 8000 })
    contentOk = true
  } catch {}

  const hooksError = errors.some((e) => e.includes('Rendered more hooks'))
  const pass = guardOk && contentOk && !hooksError
  if (!pass) failed += 1
  console.log(
    `${pass ? 'PASS' : 'FAIL'} ${p.path}  guard=${guardOk} content=${contentOk} hooksError=${hooksError}`
  )
  if (!pass && errors.length > 0) {
    console.log(`  console errors: ${errors.slice(0, 3).join(' | ')}`)
  }
}

await browser.close()
if (failed > 0) {
  console.error(`\n${failed} page(s) failed`)
  process.exit(1)
}
console.log('\nAll 6 pages passed')
