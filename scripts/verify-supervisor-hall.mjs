// 监督人员交互重构冒烟验证（0718-ux-007）
// 覆盖：监督大厅空列表 Empty / 项目监督视图三数据区真实渲染 / 记录异常落库 /
//       异常登记页同 store 可见 / 工作台监督概览真实计数。
// 用法：dev server 运行于 http://localhost:5199/bidding-prototype 时执行
//   node scripts/verify-supervisor-hall.mjs
import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE = 'http://localhost:5199/bidding-prototype'
const PROJECT_ID = 'PSMOKE0718'

const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(String(err)))

let failed = 0
const check = (name, ok, extra = '') => {
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? `  ${extra}` : ''}`)
}

// 登录监督人员
await page.goto(`${BASE}/#/login`)
await page.click('#login-role button:has-text("监督人员")')
await page.waitForURL(/#\/admin\/supervisor-hall/, { timeout: 10000 })

// 1) 无项目 → 场次列表 Empty
await page.evaluate(() => {
  localStorage.removeItem('bidding-projects')
  localStorage.removeItem('bidding-supervisor-records')
})
await page.reload()
{
  let ok = false
  try {
    await page.getByText('暂无项目，待招标人创建项目后可监督').waitFor({ timeout: 8000 })
    ok = true
  } catch {}
  check('hall-empty-list', ok)
}

// 2) 种子项目 + 报价 + 专家 + 评分 → 项目监督视图三数据区真实渲染
await page.evaluate((pid) => {
  const today = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const openTime = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())} 09:30`
  localStorage.setItem('bidding-projects', JSON.stringify([
    { id: pid, name: '监督冒烟测试项目', code: 'ZB-SMOKE-0718', openTime, status: 'evaluating', packages: [] }
  ]))
  localStorage.setItem('bidding-quotes', JSON.stringify({
    [`${pid}::甲公司`]: { quote: { totalPrice: 100, delivery: '30天', quality: '2年' }, items: [], savedAt: '2026-07-18 10:00' }
  }))
  localStorage.setItem('bidding-expert-results', JSON.stringify({
    [pid]: { projectId: pid, experts: [{ id: 'e1', name: '专家甲', field: '电子信息', org: '深圳大学', confirmStatus: 'confirmed' }], bench: [], confirmed: true }
  }))
  localStorage.setItem('bidding-evaluation', JSON.stringify({
    [pid]: {
      leader: null,
      deadline: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}T17:00:00`,
      experts: { 专家甲: { scores: { 甲公司: { 商务: 28, 技术: 36 } }, submitted: true, submittedAt: '2026-07-18 11:00', signed: false } },
      report: null,
      status: 'evaluating'
    }
  }))
}, PROJECT_ID)
await page.goto(`${BASE}/#/admin/supervisor-hall?projectId=${PROJECT_ID}`)
{
  let nameOk = false
  try {
    await page.getByText('项目：监督冒烟测试项目').waitFor({ timeout: 8000 })
    nameOk = true
  } catch {}
  check('hall-project-header', nameOk)

  // 开标 tab：签到 Empty + 唱标真实行
  let signOk = false
  try {
    await page.getByText('该项目暂无开标签到记录').waitFor({ timeout: 8000 })
    signOk = true
  } catch {}
  check('hall-opening-sign-empty', signOk)
  let bidOk = false
  try {
    await page.getByText('甲公司').first().waitFor({ timeout: 8000 })
    bidOk = true
  } catch {}
  check('hall-opening-bid-real', bidOk)

  // 评标 tab：委员会 + 评分汇总
  await page.click('.ant-tabs-tab:has-text("评标监督")')
  let expertOk = false
  try {
    await page.getByText('深圳大学').waitFor({ timeout: 8000 })
    expertOk = true
  } catch {}
  check('hall-eval-committee-real', expertOk)
  let scoreOk = false
  try {
    await page.getByText('64').first().waitFor({ timeout: 8000 }) // 28+36=64（总分与平均分两格）
    scoreOk = true
  } catch {}
  check('hall-eval-score-real', scoreOk)
}

// 3) 记录异常落库（关联 projectId，source hall）
await page.fill('.supervisor-actions textarea', '冒烟：开标现场发现迟到投标人')
await page.click('.supervisor-actions button:has-text("记录异常")')
{
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-supervisor-records') || '[]'))
  const rec = stored.find((r) => r.desc === '冒烟：开标现场发现迟到投标人')
  check('hall-record-persisted', !!rec && rec.projectId === PROJECT_ID && rec.source === 'hall' && rec.type === '监督记录' && rec.status === '待处理',
    rec ? `projectId=${rec.projectId} source=${rec.source} type=${rec.type}` : 'record not found')
}

// 4) 提交监督意见落库（type 监督意见）
await page.fill('.supervisor-actions textarea', '冒烟：整体流程合规')
await page.click('.supervisor-actions button:has-text("提交监督意见")')
{
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-supervisor-records') || '[]'))
  const rec = stored.find((r) => r.desc === '冒烟：整体流程合规')
  check('hall-opinion-persisted', !!rec && rec.type === '监督意见', rec ? `type=${rec.type}` : 'record not found')
}

// 5) 异常登记页同 store 可见（store 非空时种子不写入）
await page.goto(`${BASE}/#/admin/supervisor-abnormal`)
{
  let hallRecVisible = false
  try {
    await page.getByText('冒烟：开标现场发现迟到投标人').waitFor({ timeout: 8000 })
    hallRecVisible = true
  } catch {}
  check('abnormal-sees-hall-record', hallRecVisible)

  // 登记页新增记录（source abnormal）
  await page.click('button:has-text("登记异常")')
  await page.fill('.ant-modal input', '手动登记项目')
  await page.fill('.ant-modal textarea', '冒烟：手动登记异常')
  await page.click('.ant-modal button:has-text("提 交"), .ant-modal button:has-text("提交")')
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-supervisor-records') || '[]'))
  const manual = after.find((r) => r.desc === '冒烟：手动登记异常')
  check('abnormal-add-persisted', !!manual && manual.source === 'abnormal' && manual.projectId === '',
    manual ? `source=${manual.source}` : 'record not found')
}

// 5b) store 为空时种子演示记录只种一次（当前已在异常登记页，reload 触发重挂载）
await page.evaluate(() => localStorage.removeItem('bidding-supervisor-records'))
await page.reload()
{
  let seedVisible = false
  try {
    await page.getByText('YC20260708001').waitFor({ timeout: 8000 })
    seedVisible = true
  } catch {}
  const once = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-supervisor-records') || '[]'))
  await page.reload()
  await page.waitForTimeout(800)
  const twice = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-supervisor-records') || '[]'))
  check('abnormal-seed-once', seedVisible && once.length === 1 && twice.length === 1,
    `first=${once.length} afterReload=${twice.length}`)
  // 恢复 3 条待处理记录供工作台计数验证
  await page.evaluate((pid) => {
    const mk = (id, desc) => ({ id, projectId: pid, project: '监督冒烟测试项目', type: '监督记录', desc, status: '待处理', time: '2026-07-18 12:00', source: 'hall' })
    localStorage.setItem('bidding-supervisor-records', JSON.stringify([mk('YC1', 'r1'), mk('YC2', 'r2'), mk('YC3', 'r3')]))
  }, PROJECT_ID)
}

// 6) 工作台监督概览真实计数（今日开标=1、今日评标=1、异常预警=3 待处理）
await page.goto(`${BASE}/#/admin/dashboard`)
{
  let rendered = false
  try {
    await page.getByText('监督概览').waitFor({ timeout: 8000 })
    rendered = true
  } catch {}
  const text = (await page.evaluate(() => document.body.innerText)).replace(/\n/g, ' ')
  const openOk = /今日开标\s*1\s*场/.test(text)
  const evalOk = /今日评标\s*1\s*场/.test(text)
  const abnormalOk = /异常预警\s*3\s*条/.test(text)
  check('dashboard-stats-real', rendered && openOk && evalOk && abnormalOk, `rendered=${rendered} open=${openOk} eval=${evalOk} abnormal=${abnormalOk}`)
}

// 7) 无 hooks 崩溃/页面错误
const fatal = errors.filter((e) => e.includes('Rendered more hooks') || e.includes('Minified React error'))
check('no-runtime-errors', fatal.length === 0, fatal.slice(0, 2).join(' | '))

await browser.close()
console.log(failed === 0 ? 'ALL PASS' : `${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
