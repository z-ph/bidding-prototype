import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE_URL = 'http://localhost:5199/bidding-prototype'
const TRACE_OUT = 'review-assets/admin-redline-trace.zip'
const hashUrl = (base, path) => `${base}/#${path}`

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
  const page = await context.newPage()

  const consoleErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => consoleErrors.push(err.message))

  try {
    // ============ 登录（真实点击角色按钮） ============
    await page.goto(hashUrl(BASE_URL, '/login'))
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#login-role', { timeout: 15000 })
    await page.click('#login-role button:has-text("管理员")')
    await page.waitForSelector('.role-banner', { timeout: 15000 })
    await page.waitForTimeout(600)

    // ============ 验证 1：工作台渲染真实控制台内容，无空壳跳转 ============
    const bodyText = await page.locator('body').innerText()
    check('工作台无「前往管理控制台」空壳按钮', !bodyText.includes('前往管理控制台'))
    check('工作台渲染运营指标（注册供应商）', bodyText.includes('注册供应商'))
    check('工作台渲染运营指标（异常预警）', bodyText.includes('异常预警'))
    check('落地 URL 为 /admin/dashboard', page.url().includes('#/admin/dashboard'), page.url())
    await page.screenshot({ path: 'review-assets/admin-dashboard-merged.png' })

    // ============ 验证 2：菜单业务域分组 ============
    const topItems = await page.locator('ul.ant-menu-root > li').allInnerTexts()
    const flat = topItems.map((t) => t.trim())
    console.log('菜单顶层项:', JSON.stringify(flat))
    check('菜单顶层项 ≤ 10', flat.length <= 10, `实际 ${flat.length} 项`)
    for (const label of ['工作台', '待办中心', '组织与用户', '系统配置', '内容管理', '准入审核', '日志审计', '采购数据分析', '消息中心']) {
      check(`菜单包含「${label}」`, flat.some((t) => t.includes(label)))
    }
    check('菜单无「管理控制台」', !flat.some((t) => t.includes('管理控制台')))
    check('菜单无「采购需求」', !flat.some((t) => t.includes('采购需求')))

    // ============ 验证 3：旧路由 redirect ============
    await page.goto(hashUrl(BASE_URL, '/admin/admin-dashboard'))
    await page.waitForURL('**/#/admin/dashboard', { timeout: 15000 })
    check('/admin/admin-dashboard 重定向到 /admin/dashboard', page.url().includes('#/admin/dashboard'), page.url())
    const afterRedirect = await page.locator('body').innerText()
    check('重定向后渲染控制台内容', afterRedirect.includes('注册供应商'))

    // ============ 验证 4：准入审核 CRUD 闭环（localStorage 真实写入 + reload 持久化） ============
    await page.locator('.ant-menu-item').filter({ hasText: '准入审核' }).click()
    await page.waitForURL('**/#/admin/admin-supplier-audit', { timeout: 15000 })
    await page.waitForTimeout(800)

    const row = page.locator('tr').filter({ hasText: 'D科技有限公司' })
    await row.waitFor({ timeout: 15000 })
    const beforeStatus = await row.innerText()
    check('待审核供应商初始状态为「待审核」', beforeStatus.includes('待审核'))

    await row.locator('button').filter({ hasText: '通过' }).click()
    await page.locator('.ant-modal-confirm .ant-btn-primary').click()
    await page.waitForTimeout(800)
    const afterStatus = await page.locator('tr').filter({ hasText: 'D科技有限公司' }).innerText()
    check('审核通过后状态为「已通过」', afterStatus.includes('已通过'))

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-admission-status') || 'null'))
    check('状态已写入 localStorage', !!stored, stored ? 'bidding-admission-status 存在' : 'key 不存在')

    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    const reloadedRow = page.locator('tr').filter({ hasText: 'D科技有限公司' })
    await reloadedRow.waitFor({ timeout: 15000 })
    const reloadedStatus = await reloadedRow.innerText()
    check('刷新后审核结果持久化（非组件本地状态）', reloadedStatus.includes('已通过'))
    await page.screenshot({ path: 'review-assets/admin-audit-persisted.png' })

    // ============ 验证 5：已砍功能不出现在菜单 ============
    const menuText = flat.join('|')
    for (const banned of ['费用', '报名', '异议', '合同归档', '发票']) {
      check(`菜单无已砍功能「${banned}」`, !menuText.includes(banned))
    }

    if (consoleErrors.length > 0) {
      check('浏览器控制台无错误', false, consoleErrors.join(' ; ').slice(0, 300))
    } else {
      check('浏览器控制台无错误', true)
    }
  } catch (err) {
    console.error('脚本执行异常:', err.message)
    check('脚本执行无异常', false, err.message)
    try { await page.screenshot({ path: 'review-assets/admin-redline-error.png', fullPage: true }) } catch {}
  } finally {
    await context.tracing.stop({ path: TRACE_OUT })
    await browser.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n===== 红线实测结果: ${results.length - failed.length}/${results.length} 通过 =====`)
  if (failed.length > 0) {
    console.log('未通过项:')
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`))
    process.exit(1)
  }
  console.log(`trace: ${TRACE_OUT}`)
}

main()
