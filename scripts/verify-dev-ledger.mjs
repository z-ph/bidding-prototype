import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE_URL = 'http://localhost:5199/bidding-prototype'
const TRACE_OUT = 'review-assets/dev-ledger-trace.zip'
const hashUrl = (base, path) => `${base}/#${path}`
const FAB = 'div[aria-label="评审台账"]'

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
    // ============ A. 门户可见 + 未登录点击（核心回归场景：不得出现无权限） ============
    await page.goto(`${BASE_URL}/`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector(FAB, { timeout: 15000 })
    check('门户页悬浮按钮可见', await page.locator(FAB).isVisible())

    await page.locator(FAB).click()
    await page.waitForURL('**/#/dev-ledger**', { timeout: 15000 })
    await page.waitForTimeout(1000)
    const guestText = await page.locator('body').innerText()
    check('未登录点击悬浮按钮打开 /dev-ledger', page.url().includes('/dev-ledger'), page.url())
    const forbiddenCount = await page.locator('.forbidden-page').count()
    check('未登录访问无 Forbidden 拦截页', forbiddenCount === 0 && !guestText.includes('无权限访问'))
    check('未登录可见评审变更列表内容', guestText.includes('评审变更列表'))
    check('公开页含标题与返回按钮', guestText.includes('评审台账') && guestText.includes('返回'))
    await page.screenshot({ path: 'review-assets/dev-ledger-guest.png' })

    // 未登录深链 changelog tab
    await page.goto(hashUrl(BASE_URL, '/dev-ledger?tab=changelog'))
    await page.waitForTimeout(1000)
    const guestChangelog = await page.locator('.ant-tabs-tab-active').innerText()
    check('未登录深链 ?tab=changelog 直接激活', guestChangelog.includes('变更时间线'), guestChangelog)

    // 公开旧路由重定向（门户「评审变更」按钮目标）
    await page.goto(hashUrl(BASE_URL, '/review-change-list'))
    await page.waitForURL('**/#/dev-ledger?tab=review**', { timeout: 15000 })
    check('公开旧路由 /review-change-list 重定向到合并页', true, page.url())

    // ============ B. 登录后点击与 tab 切换 ============
    await page.goto(hashUrl(BASE_URL, '/login'))
    await page.waitForSelector('#login-role', { timeout: 15000 })
    await page.click('#login-role button:has-text("招标人")')
    await page.waitForSelector('ul.ant-menu-root', { timeout: 15000 })
    await page.waitForTimeout(800)
    check('后台页悬浮按钮可见', await page.locator(FAB).isVisible())

    await page.locator(FAB).click()
    await page.waitForURL('**/#/dev-ledger**', { timeout: 15000 })
    await page.waitForTimeout(1000)
    const activeTab = await page.locator('.ant-tabs-tab-active').innerText()
    check('登录后点击进入合并页，默认评审变更列表', activeTab.includes('评审变更列表'), activeTab)

    await page.locator('.ant-tabs-tab').filter({ hasText: '变更时间线' }).click()
    await page.waitForTimeout(800)
    check('切 tab 更新 URL 为 ?tab=changelog', page.url().includes('tab=changelog'), page.url())
    const changelogText = await page.locator('body').innerText()
    check('变更时间线渲染（v0.9.1 在列）', changelogText.includes('0.9.1'))

    // ============ C. 后台旧路由重定向 ============
    await page.goto(hashUrl(BASE_URL, '/admin/review-change-list'))
    await page.waitForURL('**/#/dev-ledger?tab=review**', { timeout: 15000 })
    check('旧 /admin/review-change-list 重定向到 /dev-ledger?tab=review', true, page.url())
    await page.goto(hashUrl(BASE_URL, '/admin/changelog'))
    await page.waitForURL('**/#/dev-ledger?tab=changelog**', { timeout: 15000 })
    check('旧 /admin/changelog 重定向到 /dev-ledger?tab=changelog', true, page.url())
    await page.goto(hashUrl(BASE_URL, '/admin/dev-ledger'))
    await page.waitForURL('**/#/dev-ledger**', { timeout: 15000 })
    check('旧 /admin/dev-ledger 重定向到 /dev-ledger', true, page.url())

    // ============ D. 菜单无新增项 ============
    await page.goto(hashUrl(BASE_URL, '/admin/dashboard'))
    await page.waitForTimeout(1000)
    const menuItems = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    check('招标人菜单顶层仍为 8 项（无台账入口）', menuItems.length === 8, JSON.stringify(menuItems))

    // ============ E. 拖拽与位置持久化 ============
    const fab = page.locator(FAB)
    const before = await fab.boundingBox()
    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2)
    await page.mouse.down()
    await page.mouse.move(before.x + before.width / 2 - 200, before.y + before.height / 2 - 150, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(400)
    const after = await fab.boundingBox()
    check('拖拽后位置移动', Math.abs(after.x - before.x) > 100 && Math.abs(after.y - before.y) > 80,
      `(${before.x},${before.y}) → (${after.x},${after.y})`)
    check('拖拽不触发跳转', page.url().includes('/admin/dashboard'), page.url())

    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    const persisted = await fab.boundingBox()
    check('刷新后拖拽位置保持', Math.abs(persisted.x - after.x) < 5 && Math.abs(persisted.y - after.y) < 5,
      `期望≈(${after.x},${after.y})，实际 (${persisted.x},${persisted.y})`)
    await page.screenshot({ path: 'review-assets/dev-ledger-fab.png' })

    check('浏览器控制台无错误', consoleErrors.length === 0, consoleErrors.join(' ; ').slice(0, 300))
  } catch (err) {
    console.error('脚本执行异常:', err.message)
    check('脚本执行无异常', false, err.message)
    try { await page.screenshot({ path: 'review-assets/dev-ledger-error.png', fullPage: true }) } catch {}
  } finally {
    await context.tracing.stop({ path: TRACE_OUT })
    await browser.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n===== 台账悬浮入口实测: ${results.length - failed.length}/${results.length} 通过 =====`)
  if (failed.length > 0) {
    failed.forEach((f) => console.log(`  FAIL - ${f.name}: ${f.detail}`))
    process.exit(1)
  }
  console.log(`trace: ${TRACE_OUT}`)
}

main()
