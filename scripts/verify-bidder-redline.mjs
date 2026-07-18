import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE_URL = 'http://localhost:5199/bidding-prototype'
const TRACE_OUT = 'review-assets/bidder-redline-trace.zip'
const hashUrl = (base, path) => `${base}/#${path}`

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

async function login(page, roleLabel) {
  await page.goto(hashUrl(BASE_URL, '/login'))
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('#login-role', { timeout: 15000 })
  await page.click(`#login-role button:has-text("${roleLabel}")`)
  await page.waitForSelector('.role-banner', { timeout: 15000 })
  await page.waitForTimeout(600)
}

async function logout(page) {
  await page.locator('button').filter({ hasText: '退出' }).click()
  await page.waitForURL('**/#/login**', { timeout: 15000 })
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
    // ============ A. 投标人登录，菜单结构 ============
    await login(page, '投标人')
    const flat = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    console.log('投标人菜单顶层项:', JSON.stringify(flat))
    check('投标人菜单顶层 ≤ 8 项', flat.length <= 8, `实际 ${flat.length} 项`)
    for (const label of ['工作台', '待办中心', '项目中心', '企业档案', '消息中心']) {
      check(`菜单包含「${label}」`, flat.some((t) => t.includes(label)))
    }
    for (const banned of ['在线报价', '开标大厅', '中标通知']) {
      check(`菜单无阶段操作「${banned}」`, !flat.some((t) => t.includes(banned)))
    }
    for (const banned of ['报名', '发票', '异议', '费用', '合同归档']) {
      check(`菜单无已砍功能「${banned}」`, !flat.some((t) => t.includes(banned)))
    }

    // ============ B. BidQuote guard：无 projectId 阻断 + 真实点击返回项目中心 ============
    await page.goto(hashUrl(BASE_URL, '/admin/bid-quote'))
    await page.waitForTimeout(1000)
    const guardText = await page.locator('body').innerText()
    check('报价页无 projectId 阻断', guardText.includes('需从项目进入'))
    check('阻断页无项目选择器（seeds 已清）', !guardText.includes('选择项目') && !guardText.includes('可报价项目'))
    await page.locator('button').filter({ hasText: '返回项目中心' }).click()
    await page.waitForURL('**/#/admin/bidder-projects', { timeout: 15000 })
    check('「返回项目中心」按钮跳转到 /admin/bidder-projects', true, page.url())

    // ============ C. 项目中心 → 报价（真实点击，携带 projectId） ============
    await page.waitForTimeout(1000)
    const projectRow = page.locator('.ant-table-row, tr').filter({ hasText: 'XX市轨道交通设备采购项目' }).first()
    await projectRow.waitFor({ timeout: 15000 })
    await projectRow.locator('button').filter({ hasText: '在线报价' }).click()
    await page.waitForURL('**/#/admin/bid-quote**', { timeout: 15000 })
    check('项目中心报价入口携带 projectId', page.url().includes('projectId='), page.url())
    await page.waitForTimeout(800)
    const quotePageText = await page.locator('body').innerText()
    check('报价页正常渲染（非阻断页）', !quotePageText.includes('需从项目进入') && quotePageText.includes('开标一览表'))

    // ============ D. 报价 CRUD：填写 → 保存 → localStorage → reload 回显 ============
    await page.locator('input[placeholder="请输入投标报价"]').fill('128')
    await page.locator('input[placeholder="请输入交货期"]').fill('合同签订后 30 日历天')
    await page.locator('input[placeholder="请输入质保期"]').fill('3 年')
    await page.locator('input[placeholder="请输入付款方式"]').fill('验收合格后 30 日内一次性支付')
    await page.locator('input[placeholder="单价"]').first().fill('52000')
    await page.screenshot({ path: 'review-assets/bidder-quote-filled.png' })

    await page.locator('button').filter({ hasText: '保存报价' }).click()
    await page.waitForTimeout(800)
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('bidding-quotes')
      return raw ? JSON.parse(raw) : null
    })
    const quoteKey = stored ? Object.keys(stored).find((k) => k.startsWith('1::')) : null
    check('报价写入 localStorage（projectId::供应商）', !!quoteKey, quoteKey || '未找到')
    check('存储内容含报价字段与分项', !!stored?.[quoteKey]?.quote?.totalPrice && !!stored?.[quoteKey]?.items?.length)

    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    const totalPriceValue = await page.locator('input[placeholder="请输入投标报价"]').inputValue()
    const deliveryValue = await page.locator('input[placeholder="请输入交货期"]').inputValue()
    check('刷新后报价回显（非组件本地状态）', totalPriceValue === '128' && deliveryValue.includes('30'))
    await page.screenshot({ path: 'review-assets/bidder-quote-persisted.png' })

    // ============ E. 报价 → 上传投标文件衔接 ============
    await page.locator('button').filter({ hasText: '下一步：上传投标文件' }).click()
    await page.waitForURL('**/#/admin/bid-upload**', { timeout: 15000 })
    check('报价页跳转上传标书并携带 projectId', page.url().includes('projectId='), page.url())

    // ============ F. 招标人回归 ============
    await logout(page)
    await login(page, '招标人')
    const tendereeMenu = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    check('招标人菜单回归 ≤ 10 项', tendereeMenu.length <= 10, `实际 ${tendereeMenu.length} 项`)
    check('招标人菜单回归含「项目管理」「采购需求库」',
      tendereeMenu.some((t) => t.includes('项目管理')) && tendereeMenu.some((t) => t.includes('采购需求库')))

    check('浏览器控制台无错误', consoleErrors.length === 0, consoleErrors.join(' ; ').slice(0, 300))
  } catch (err) {
    console.error('脚本执行异常:', err.message)
    check('脚本执行无异常', false, err.message)
    try { await page.screenshot({ path: 'review-assets/bidder-redline-error.png', fullPage: true }) } catch {}
  } finally {
    await context.tracing.stop({ path: TRACE_OUT })
    await browser.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n===== 投标人红线实测: ${results.length - failed.length}/${results.length} 通过 =====`)
  if (failed.length > 0) {
    failed.forEach((f) => console.log(`  FAIL - ${f.name}: ${f.detail}`))
    process.exit(1)
  }
  console.log(`trace: ${TRACE_OUT}`)
}

main()
