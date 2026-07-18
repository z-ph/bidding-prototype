import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE_URL = 'http://localhost:5199/bidding-prototype'
const TRACE_OUT = 'review-assets/agent-redline-trace.zip'
const hashUrl = (base, path) => `${base}/#${path}`
const PROJECT_NAME = '2026年度办公设备集中采购项目'

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
    // ============ A. 招标人真实创建项目（工作流上游） ============
    await login(page, '招标人')
    await page.locator('.ant-menu-submenu-title').filter({ hasText: '项目管理' }).click()
    await page.waitForTimeout(400)
    await page.locator('li[data-menu-id$="/admin/projects/create"]').click()
    await page.waitForURL('**/#/admin/projects/create', { timeout: 15000 })
    await page.waitForTimeout(800)

    await page.fill('#name', PROJECT_NAME)
    await page.fill('#budget', '80')
    await page.click('#openTime')
    await page.waitForTimeout(400)
    const todayCell = page.locator('.ant-picker-cell-today')
    await todayCell.waitFor({ timeout: 10000 })
    await todayCell.locator('..').locator('..').locator('.ant-picker-cell-in-view').nth(8).click()
    await page.waitForTimeout(200)
    await page.locator('.ant-picker-ok button').first().click()
    await page.waitForTimeout(300)
    await page.fill('#intro', '代理红线实测项目：验证跨角色接力工作流，委托代理编制招标文件。')

    await page.click('button:has-text("保存草稿")')
    await page.waitForURL('**/#/admin/projects', { timeout: 15000 })
    await page.waitForTimeout(800)
    const projectRow = page.locator('.ant-table-row').filter({ hasText: PROJECT_NAME })
    await projectRow.waitFor({ timeout: 15000 })
    check('招标人创建项目成功（写入 projectStore）', true)

    await logout(page)

    // ============ B. 招标代理登录，菜单结构 ============
    await login(page, '招标代理')
    const flat = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    console.log('代理菜单顶层项:', JSON.stringify(flat))
    check('代理菜单顶层 ≤ 10 项', flat.length <= 10, `实际 ${flat.length} 项`)
    for (const label of ['工作台', '待办中心', '委托项目', '业务台账', '审批中心', '采购数据分析', '消息中心']) {
      check(`菜单包含「${label}」`, flat.some((t) => t.includes(label)))
    }
    for (const banned of ['招标文件编制', '公告发布', '专家抽取', '中标通知书']) {
      check(`菜单无阶段操作「${banned}」`, !flat.some((t) => t.includes(banned)))
    }
    for (const banned of ['报名', '异议', '合同归档', '发票']) {
      check(`菜单无已砍功能「${banned}」`, !flat.some((t) => t.includes(banned)))
    }
    await page.locator('.ant-menu-submenu-title').filter({ hasText: '业务台账' }).click()
    await page.waitForTimeout(500)
    const submenuText = await page.locator('ul.ant-menu-root').innerText()
    for (const label of ['公告列表', '供应商授权', '费用台账']) {
      check(`业务台账分组含「${label}」`, submenuText.includes(label))
    }

    // ============ C. 代理看到招标人创建的项目 → 驾驶舱 ============
    await page.locator('.ant-menu-submenu-title').filter({ hasText: '委托项目' }).click()
    await page.waitForTimeout(400)
    await page.locator('li[data-menu-id$="/admin/projects"]').filter({ hasText: '项目列表' }).click()
    await page.waitForURL('**/#/admin/projects', { timeout: 15000 })
    await page.waitForTimeout(1000)
    const agentProjectRow = page.locator('.ant-table-row').filter({ hasText: PROJECT_NAME })
    await agentProjectRow.waitFor({ timeout: 15000 })
    check('代理项目列表可见招标人创建的项目（跨角色数据衔接）', true)

    await agentProjectRow.locator('button').filter({ hasText: '详情' }).click()
    await page.waitForURL('**/#/admin/projects/detail/**', { timeout: 15000 })
    await page.waitForTimeout(1000)
    const createdProjectId = page.url().split('/detail/')[1]?.split('?')[0]
    console.log('创建的项目 id:', createdProjectId)
    const detailText = await page.locator('body').innerText()
    check('驾驶舱渲染「当前阶段操作」卡片', detailText.includes('当前阶段操作'))
    check('draft 项目代理动作为「编制招标文件」', detailText.includes('编制招标文件'))
    check('代理视角无招标人动作（发标/确认）', !detailText.includes('直接发标') && !detailText.includes('确认采购结果'))
    await page.screenshot({ path: 'review-assets/agent-cockpit.png' })

    // 驾驶舱动作卡片真实跳转（带 projectId）
    await page.locator('.action-grid button, .ant-card button').filter({ hasText: '招标文件' }).first().click()
    await page.waitForURL('**/#/admin/tender-doc**', { timeout: 15000 })
    check('驾驶舱动作跳转招标文件并携带 projectId', page.url().includes('projectId='), page.url())
    const tenderDocText = await page.locator('body').innerText()
    check('招标文件页正常渲染（非阻断页）', !tenderDocText.includes('需从项目进入'))
    await page.screenshot({ path: 'review-assets/agent-tender-doc-from-cockpit.png' })

    // ============ D. 专家抽取 guard + CRUD 闭环 ============
    await page.goto(hashUrl(BASE_URL, '/admin/expert-extraction'))
    await page.waitForTimeout(1000)
    const guardText = await page.locator('body').innerText()
    check('专家抽取无 projectId 阻断', guardText.includes('需从项目进入'))
    check('阻断页提供返回项目列表按钮', guardText.includes('返回项目列表'))

    await page.goto(hashUrl(BASE_URL, `/admin/expert-extraction?projectId=${createdProjectId}`))
    await page.waitForTimeout(1200)
    const extractionText = await page.locator('body').innerText()
    if (!extractionText.includes('专家随机抽取') && !extractionText.includes('执行抽取') && !extractionText.includes('重新抽取')) {
      console.log('抽取页内容片段（诊断用）:', extractionText.replace(/\s+/g, ' ').slice(0, 400))
    }
    check('带 projectId 正常渲染抽取页', extractionText.includes('专家随机抽取') || extractionText.includes('执行抽取') || extractionText.includes('重新抽取'))

    await page.locator('button').filter({ hasText: /执行抽取|重新抽取/ }).first().click()
    await page.waitForTimeout(1500)
    const afterExtract = await page.locator('body').innerText()
    check('抽取后显示正式名单', afterExtract.includes('正式名单'))
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('bidding-expert-results')
      return raw ? JSON.parse(raw) : null
    })
    check('抽取结果写入 localStorage（按创建的项目 id）', !!stored && !!stored[createdProjectId], stored ? `keys: ${Object.keys(stored).join(',')}` : 'null')
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    const reloadedText = await page.locator('body').innerText()
    check('刷新后抽取结果持久化', reloadedText.includes('正式名单'))
    await page.screenshot({ path: 'review-assets/agent-extraction-persisted.png' })

    // ============ E. 招标人回归 ============
    await logout(page)
    await login(page, '招标人')
    const tendereeMenu = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    console.log('招标人菜单顶层项:', JSON.stringify(tendereeMenu))
    check('招标人菜单顶层 ≤ 10 项', tendereeMenu.length <= 10, `实际 ${tendereeMenu.length} 项`)
    for (const label of ['工作台', '项目管理', '采购需求库', '审批中心', '消息中心', '系统设置']) {
      check(`招标人菜单回归含「${label}」`, tendereeMenu.some((t) => t.includes(label)))
    }

    await page.locator('.ant-menu-submenu-title').filter({ hasText: '项目管理' }).click()
    await page.waitForTimeout(400)
    await page.locator('li[data-menu-id$="/admin/projects"]').filter({ hasText: '项目列表' }).click()
    await page.waitForURL('**/#/admin/projects', { timeout: 15000 })
    await page.waitForTimeout(1000)
    await page.locator('.ant-table-row').filter({ hasText: PROJECT_NAME }).locator('button').filter({ hasText: '详情' }).click()
    await page.waitForURL('**/#/admin/projects/detail/**', { timeout: 15000 })
    await page.waitForTimeout(1000)
    const tendereeDetail = await page.locator('body').innerText()
    check('招标人驾驶舱回归：渲染招标人动作（编辑项目/发标）',
      tendereeDetail.includes('当前阶段操作') && (tendereeDetail.includes('编辑项目') || tendereeDetail.includes('发标')))
    await page.screenshot({ path: 'review-assets/tenderee-cockpit-regression.png' })

    check('浏览器控制台无错误', consoleErrors.length === 0, consoleErrors.join(' ; ').slice(0, 300))
  } catch (err) {
    console.error('脚本执行异常:', err.message)
    check('脚本执行无异常', false, err.message)
    try { await page.screenshot({ path: 'review-assets/agent-redline-error.png', fullPage: true }) } catch {}
  } finally {
    await context.tracing.stop({ path: TRACE_OUT })
    await browser.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n===== 代理红线实测: ${results.length - failed.length}/${results.length} 通过 =====`)
  if (failed.length > 0) {
    failed.forEach((f) => console.log(`  FAIL - ${f.name}: ${f.detail}`))
    process.exit(1)
  }
  console.log(`trace: ${TRACE_OUT}`)
}

main()
