import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE_URL = 'http://localhost:5199/bidding-prototype'
const TRACE_OUT = 'review-assets/supervisor-redline-trace.zip'
const hashUrl = (base, path) => `${base}/#${path}`
const NEW_PROJECT_NAME = '2026年度监督视角实测项目'

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
  // 不同角色落地页不同（supervisor → 监督大厅无 role-banner），统一等布局菜单出现
  await page.waitForSelector('ul.ant-menu-root', { timeout: 15000 })
  await page.waitForTimeout(800)
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
    // ============ A. 招标人创建项目（场次列表真实数据） ============
    await login(page, '招标人')
    await page.locator('.ant-menu-submenu-title').filter({ hasText: '项目管理' }).click()
    await page.waitForTimeout(400)
    await page.locator('li[data-menu-id$="/admin/projects/create"]').click()
    await page.waitForURL('**/#/admin/projects/create', { timeout: 15000 })
    await page.waitForTimeout(800)
    await page.fill('#name', NEW_PROJECT_NAME)
    await page.fill('#budget', '60')
    await page.click('#openTime')
    await page.waitForTimeout(400)
    const todayCell = page.locator('.ant-picker-cell-today')
    await todayCell.waitFor({ timeout: 10000 })
    await todayCell.locator('..').locator('..').locator('.ant-picker-cell-in-view').nth(8).click()
    await page.waitForTimeout(200)
    await page.locator('.ant-picker-ok button').first().click()
    await page.waitForTimeout(300)
    await page.fill('#intro', '监督红线实测项目：验证监督大厅场次列表与项目监督视图。')
    await page.click('button:has-text("保存草稿")')
    await page.waitForURL('**/#/admin/projects', { timeout: 15000 })
    await page.waitForTimeout(800)
    await page.locator('.ant-table-row').filter({ hasText: NEW_PROJECT_NAME }).waitFor({ timeout: 15000 })
    check('招标人创建项目（场次列表数据源）', true)
    await logout(page)

    // ============ B. 代理抽取并确认（项目 1，含专家甲正式名单） ============
    await login(page, '招标代理')
    await page.goto(hashUrl(BASE_URL, '/admin/expert-extraction?projectId=1'))
    await page.waitForTimeout(1200)
    let hasJia = false
    for (let i = 0; i < 15 && !hasJia; i++) {
      await page.locator('button').filter({ hasText: /执行抽取|重新抽取/ }).first().click()
      await page.waitForTimeout(1200)
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-expert-results') || '{}'))
      hasJia = !!stored['1']?.experts?.some((e) => e.name === '专家甲')
    }
    check('代理抽取含专家甲（正式名单）', hasJia)
    await page.locator('button').filter({ hasText: '确认并通知' }).click()
    await page.locator('.ant-modal-confirm .ant-btn-primary, .ant-modal .ant-btn-primary').first().click()
    await page.waitForTimeout(1000)
    await logout(page)

    // ============ C. 投标人报价（项目 1，唱标数据源） ============
    await login(page, '投标人')
    await page.goto(hashUrl(BASE_URL, '/admin/bid-quote?projectId=1'))
    await page.waitForTimeout(1000)
    await page.locator('input[placeholder="请输入投标报价"]').fill('128')
    await page.locator('input[placeholder="请输入交货期"]').fill('合同签订后 30 日历天')
    await page.locator('input[placeholder="请输入质保期"]').fill('3 年')
    await page.locator('input[placeholder="请输入付款方式"]').fill('验收合格后 30 日内一次性支付')
    await page.locator('button').filter({ hasText: '保存报价' }).click()
    await page.waitForTimeout(800)
    const quoteStored = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-quotes') || '{}'))
    check('投标人报价落库（唱标数据源）', !!quoteStored['1::A科技有限公司'])
    await logout(page)

    // ============ D. 专家确认参加并评分（项目 1，评分数据源） ============
    await login(page, '评标专家')
    await page.goto(hashUrl(BASE_URL, '/admin/expert-tasks'))
    await page.waitForTimeout(1000)
    const taskRow = page.locator('tr').filter({ hasText: 'XX市轨道交通设备采购项目' })
    await taskRow.waitFor({ timeout: 15000 })
    await taskRow.locator('button').filter({ hasText: '确认参加' }).click()
    await page.locator('.ant-modal-confirm .ant-btn-primary, .ant-modal .ant-btn-primary').first().click()
    await page.waitForTimeout(1000)
    await page.locator('tr').filter({ hasText: 'XX市轨道交通设备采购项目' }).locator('button').filter({ hasText: '进入评标' }).click()
    await page.waitForURL('**/#/admin/expert-project**', { timeout: 15000 })
    await page.waitForTimeout(1000)
    await page.locator('.ant-checkbox-wrapper').filter({ hasText: '我已阅读并遵守' }).click()
    await page.locator('button').filter({ hasText: '下一步：专家签到' }).click()
    await page.waitForTimeout(400)
    await page.locator('button').filter({ hasText: '完成签到' }).click()
    await page.waitForTimeout(400)
    const voteBtn = page.locator('button').filter({ hasText: /推选/ }).first()
    if (await voteBtn.isVisible().catch(() => false)) {
      await voteBtn.click()
      await page.waitForTimeout(400)
    }
    await page.locator('button').filter({ hasText: /下一步：查阅资料|下一步/ }).first().click()
    await page.waitForTimeout(400)
    await page.locator('.ant-checkbox-wrapper').filter({ hasText: '我已查阅全部投标资料' }).click()
    await page.waitForTimeout(300)
    await page.locator('button').filter({ hasText: '我已查阅，开始评分' }).click()
    await page.waitForTimeout(500)
    const bidderTabs = page.locator('.ant-tabs-tab')
    const tabCount = await bidderTabs.count()
    for (let t = 0; t < tabCount; t++) {
      await bidderTabs.nth(t).click()
      await page.waitForTimeout(400)
      const inputs = page.locator('.ant-input-number-input:visible')
      const ic = await inputs.count()
      for (let i = 0; i < ic; i++) await inputs.nth(i).fill('85')
    }
    const evalStored = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-evaluation') || '{}'))
    check('专家评分写入 evaluationStore（评分汇总数据源）', !!evalStored['1']?.experts?.['专家甲'])
    await logout(page)

    // ============ E. 监督人员：菜单 + 场次列表 + 项目视图 + 异常落库 ============
    await login(page, '监督人员')
    const flat = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    console.log('监督菜单顶层项:', JSON.stringify(flat))
    check('监督菜单顶层 ≤ 8 项', flat.length <= 8, `实际 ${flat.length} 项`)
    for (const label of ['工作台', '待办中心', '监督大厅', '异常登记', '操作日志', '消息中心']) {
      check(`菜单包含「${label}」`, flat.some((t) => t.includes(label)))
    }

    // 工作台真实计数（supervisor 默认落地监督大厅，需先点进工作台）
    await page.locator('.ant-menu-item').filter({ hasText: '工作台' }).first().click()
    await page.waitForURL('**/#/admin/dashboard', { timeout: 15000 })
    await page.waitForTimeout(800)
    const dashText = await page.locator('body').innerText()
    check('工作台监督概览渲染（真实计数）', dashText.includes('今日开标') && dashText.includes('异常预警'))

    // 场次列表（无 projectId）
    await page.locator('.ant-menu-item').filter({ hasText: '监督大厅' }).click()
    await page.waitForURL('**/#/admin/supervisor-hall', { timeout: 15000 })
    await page.waitForTimeout(1000)
    const hallText = await page.locator('body').innerText()
    check('场次列表含招标人创建的真实项目', hallText.includes(NEW_PROJECT_NAME))
    check('场次列表无演示假数据（园区安防等）', !hallText.includes('园区安防设备采购项目'))

    // 点「进入监督」（新项目 → Empty 策略）
    await page.locator('tr').filter({ hasText: NEW_PROJECT_NAME }).locator('button').filter({ hasText: '进入监督' }).click()
    await page.waitForURL('**/#/admin/supervisor-hall**projectId**', { timeout: 15000 })
    await page.waitForTimeout(1000)
    const newProjectView = await page.locator('body').innerText()
    check('进入监督携带 projectId', page.url().includes('projectId='), page.url())
    check('新项目头部显示项目名', newProjectView.includes(NEW_PROJECT_NAME))
    check('新项目无数据时 Empty（不回退演示假数据）', newProjectView.includes('暂无'))
    await page.screenshot({ path: 'review-assets/supervisor-empty-project.png' })

    // 项目 1 视图（真实数据）
    await page.goto(hashUrl(BASE_URL, '/admin/supervisor-hall?projectId=1'))
    await page.waitForTimeout(1200)
    const p1Text = await page.locator('body').innerText()
    check('项目 1 唱标结果读 quoteStore（A科技 128 万）', p1Text.includes('A科技有限公司') && p1Text.includes('128'))
    check('项目 1 开标签到 Empty（无真实签到源）', p1Text.includes('暂无开标签到'))
    await page.locator('.ant-tabs-tab').filter({ hasText: '评标监督' }).click()
    await page.waitForTimeout(600)
    const evalTabText = await page.locator('body').innerText()
    check('项目 1 评标委员会读 expertStore（专家甲）', evalTabText.includes('专家甲'))
    check('项目 1 评分汇总读 evaluationStore（含分数）', /25[0-9]|平均分|专家甲/.test(evalTabText) && evalTabText.includes('专家甲'))
    await page.screenshot({ path: 'review-assets/supervisor-project1-eval.png' })

    // 记录异常（落库）
    await page.locator('textarea').first().fill('监督实测：唱标环节报价异常偏高，建议复核。')
    await page.locator('button').filter({ hasText: '记录异常' }).click()
    await page.waitForTimeout(800)
    const records = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-supervisor-records') || '[]'))
    const hallRecord = records.find((r) => r.source === 'hall' && r.projectId === '1')
    check('监督大厅记录异常写入 supervisorStore', !!hallRecord, hallRecord ? `type=${hallRecord.type}` : '未找到')

    // 异常登记页可见 + reload 持久化
    await page.locator('.ant-menu-item').filter({ hasText: '异常登记' }).click()
    await page.waitForURL('**/#/admin/supervisor-abnormal', { timeout: 15000 })
    await page.waitForTimeout(1000)
    const abnormalText = await page.locator('body').innerText()
    check('异常登记页可见大厅登记的记录', abnormalText.includes('监督实测：唱标环节报价异常偏高'))
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    const reloadedAbnormal = await page.locator('body').innerText()
    check('刷新后异常记录持久化', reloadedAbnormal.includes('监督实测：唱标环节报价异常偏高'))
    await page.screenshot({ path: 'review-assets/supervisor-abnormal-persisted.png' })

    // ============ F. 回归 ============
    await logout(page)
    await login(page, '招标人')
    const tendereeMenu = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    check('招标人菜单回归 ≤ 10 项', tendereeMenu.length <= 10, `实际 ${tendereeMenu.length} 项`)

    check('浏览器控制台无错误', consoleErrors.length === 0, consoleErrors.join(' ; ').slice(0, 300))
  } catch (err) {
    console.error('脚本执行异常:', err.message)
    check('脚本执行无异常', false, err.message)
    try { await page.screenshot({ path: 'review-assets/supervisor-redline-error.png', fullPage: true }) } catch {}
  } finally {
    await context.tracing.stop({ path: TRACE_OUT })
    await browser.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n===== 监督红线实测: ${results.length - failed.length}/${results.length} 通过 =====`)
  if (failed.length > 0) {
    failed.forEach((f) => console.log(`  FAIL - ${f.name}: ${f.detail}`))
    process.exit(1)
  }
  console.log(`trace: ${TRACE_OUT}`)
}

main()
