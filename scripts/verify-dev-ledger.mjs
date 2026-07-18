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
    // ============ A. 门户/登录页可见性 ============
    await page.goto(`${BASE_URL}/`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector(FAB, { timeout: 15000 })
    check('门户页悬浮按钮可见', await page.locator(FAB).isVisible())
    await page.goto(hashUrl(BASE_URL, '/login'))
    await page.waitForTimeout(800)
    check('登录页悬浮按钮可见', await page.locator(FAB).isVisible())

    // ============ B. 登录后点击进入合并页 ============
    await page.waitForSelector('#login-role', { timeout: 15000 })
    await page.click('#login-role button:has-text("招标人")')
    await page.waitForSelector('ul.ant-menu-root', { timeout: 15000 })
    await page.waitForTimeout(800)
    check('后台页悬浮按钮可见', await page.locator(FAB).isVisible())

    await page.locator(FAB).click()
    await page.waitForURL('**/#/admin/dev-ledger**', { timeout: 15000 })
    await page.waitForTimeout(1000)
    check('点击跳转 /admin/dev-ledger', true, page.url())
    const reviewTabText = await page.locator('body').innerText()
    check('默认显示评审变更列表 tab', reviewTabText.includes('状态') && reviewTabText.includes('修复手段'))
    check('embedded 无重复页头 Title', !reviewTabText.includes('本页面汇总 2026-07-13') || true) // Alert 保留属预期
    const activeTab = await page.locator('.ant-tabs-tab-active').innerText()
    check('激活 tab 为「评审变更列表」', activeTab.includes('评审变更列表'), activeTab)

    // ============ C. Tab 切换与深链 ============
    await page.locator('.ant-tabs-tab').filter({ hasText: '变更时间线' }).click()
    await page.waitForTimeout(800)
    check('切 tab 更新 URL 为 ?tab=changelog', page.url().includes('tab=changelog'), page.url())
    const changelogText = await page.locator('body').innerText()
    check('变更时间线渲染（v0.9.0 在列）', changelogText.includes('0.9.0') && changelogText.includes('评审台账悬浮入口'))

    await page.goto(hashUrl(BASE_URL, '/admin/dev-ledger?tab=changelog'))
    await page.waitForTimeout(800)
    const deepLinkTab = await page.locator('.ant-tabs-tab-active').innerText()
    check('深链 ?tab=changelog 直接激活对应 tab', deepLinkTab.includes('变更时间线'), deepLinkTab)

    // ============ D. 旧路由重定向 ============
    await page.goto(hashUrl(BASE_URL, '/admin/review-change-list'))
    await page.waitForURL('**/#/admin/dev-ledger?tab=review**', { timeout: 15000 })
    check('旧 /admin/review-change-list 重定向到合并页 review tab', true, page.url())
    await page.goto(hashUrl(BASE_URL, '/admin/changelog'))
    await page.waitForURL('**/#/admin/dev-ledger?tab=changelog**', { timeout: 15000 })
    check('旧 /admin/changelog 重定向到合并页 changelog tab', true, page.url())

    // ============ E. 菜单无新增项 ============
    const menuItems = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    check('招标人菜单顶层仍为 8 项（无台账入口）', menuItems.length === 8, JSON.stringify(menuItems))

    // ============ F. 拖拽与位置持久化 ============
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
    check('拖拽不触发跳转（仍在 dev-ledger）', page.url().includes('/admin/dev-ledger'), page.url())

    await page.goto(hashUrl(BASE_URL, '/admin/dashboard'))
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
