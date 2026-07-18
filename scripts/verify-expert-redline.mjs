import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE_URL = 'http://localhost:5199/bidding-prototype'
const TRACE_OUT = 'review-assets/expert-redline-trace.zip'
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

async function dumpButtons(page, label) {
  const buttons = await page.locator('button:visible').allInnerTexts()
  console.log(`--- ${label} 可见按钮:`, JSON.stringify(buttons.slice(0, 30)))
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
    // ============ A. 代理前置：抽取（循环至含专家甲）并确认名单 ============
    await login(page, '招标代理')
    await page.goto(hashUrl(BASE_URL, '/admin/expert-extraction?projectId=1'))
    await page.waitForTimeout(1200)

    let hasJia = false
    for (let i = 0; i < 15 && !hasJia; i++) {
      await page.locator('button').filter({ hasText: /执行抽取|重新抽取/ }).first().click()
      await page.waitForTimeout(1200)
      // 必须命中正式名单（页面文本含「专家甲」可能只是备选名单，getTasksForExpert 只查正式 experts）
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-expert-results') || '{}'))
      hasJia = !!stored['1']?.experts?.some((e) => e.name === '专家甲')
      console.log(`抽取第 ${i + 1} 次，正式名单含专家甲: ${hasJia}`)
    }
    check('抽取结果含专家甲（代理真实抽取）', hasJia)

    await page.locator('button').filter({ hasText: '确认并通知' }).click()
    await page.locator('.ant-modal-confirm .ant-btn-primary, .ant-modal .ant-btn-primary').first().click()
    await page.waitForTimeout(1000)
    const extractStored = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-expert-results') || '{}'))
    check('名单已确认（confirmed=true）', extractStored['1']?.confirmed === true)

    await logout(page)

    // ============ B. 专家：菜单 + 任务确认 + 评标闭环 ============
    await login(page, '评标专家')
    const flat = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    console.log('专家菜单顶层项:', JSON.stringify(flat))
    check('专家菜单顶层 ≤ 8 项', flat.length <= 8, `实际 ${flat.length} 项`)
    for (const label of ['工作台', '待办中心', '我的评标任务', '专家信息', '消息中心']) {
      check(`菜单包含「${label}」`, flat.some((t) => t.includes(label)))
    }
    check('菜单无独立「评标任务」入口', !flat.some((t) => t.trim() === '评标任务'))

    // 任务列表：待确认 → 确认参加
    await page.locator('.ant-menu-item').filter({ hasText: '我的评标任务' }).click()
    await page.waitForURL('**/#/admin/expert-tasks', { timeout: 15000 })
    await page.waitForTimeout(1000)
    const taskRow = page.locator('tr').filter({ hasText: 'XX市轨道交通设备采购项目' })
    await taskRow.waitFor({ timeout: 15000 })
    check('任务列表显示待确认邀请', (await taskRow.innerText()).includes('待确认'))

    await taskRow.locator('button').filter({ hasText: '确认参加' }).click()
    await page.locator('.ant-modal-confirm .ant-btn-primary, .ant-modal .ant-btn-primary').first().click()
    await page.waitForTimeout(1000)
    check('确认后显示「已确认参加」', (await page.locator('tr').filter({ hasText: 'XX市轨道交通设备采购项目' }).innerText()).includes('已确认参加'))
    const afterConfirm = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-expert-results') || '{}'))
    const jia = afterConfirm['1']?.experts?.find((e) => e.name === '专家甲')
    check('确认状态写回 localStorage（专家甲 confirmed）', jia?.confirmStatus === 'confirmed')

    // 进入评标（携带 projectId）
    await page.locator('tr').filter({ hasText: 'XX市轨道交通设备采购项目' }).locator('button').filter({ hasText: '进入评标' }).click()
    await page.waitForURL('**/#/admin/expert-project**', { timeout: 15000 })
    check('任务列表进入评标携带 projectId', page.url().includes('projectId='), page.url())
    await page.waitForTimeout(1000)

    // 步骤0：回避声明
    await page.locator('.ant-checkbox-wrapper').filter({ hasText: '我已阅读并遵守' }).click()
    await page.locator('button').filter({ hasText: '下一步：专家签到' }).click()
    await page.waitForTimeout(500)
    // 步骤1：签到
    await page.locator('button').filter({ hasText: '完成签到' }).click()
    await page.waitForTimeout(500)
    // 步骤2：推选组长（防御：先点含「推选」的按钮，再下一步）
    const voteBtn = page.locator('button').filter({ hasText: /推选/ }).first()
    if (await voteBtn.isVisible().catch(() => false)) {
      await voteBtn.click()
      await page.waitForTimeout(500)
    }
    await page.locator('button').filter({ hasText: /下一步：查阅资料|下一步/ }).first().click()
    await page.waitForTimeout(500)
    // 步骤3：查阅资料 → 勾选已查阅 → 开始评分
    await page.locator('.ant-checkbox-wrapper').filter({ hasText: '我已查阅全部投标资料' }).click()
    await page.waitForTimeout(300)
    await page.locator('button').filter({ hasText: '我已查阅，开始评分' }).click()
    await page.waitForTimeout(500)
    // 步骤4：在线评分（逐投标人 Tab 填全部分数与意见）
    const bidderTabs = page.locator('.ant-tabs-tab')
    const tabCount = await bidderTabs.count()
    console.log(`投标人 tab 数: ${tabCount}`)
    let totalInputs = 0
    for (let t = 0; t < tabCount; t++) {
      await bidderTabs.nth(t).click()
      await page.waitForTimeout(400)
      const inputs = page.locator('.ant-input-number-input:visible')
      const ic = await inputs.count()
      for (let i = 0; i < ic; i++) {
        await inputs.nth(i).fill('85')
      }
      totalInputs += ic
      const areas = page.locator('textarea:visible')
      const ac = await areas.count()
      for (let i = 0; i < ac; i++) {
        const v = await areas.nth(i).inputValue()
        if (!v) await areas.nth(i).fill('满足招标文件要求。')
      }
    }
    check('评分与意见已填写（全部投标人）', totalInputs > 0 && tabCount > 0, `${totalInputs} 个分数框 / ${tabCount} 个投标人`)
    const evalAfterFill = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-evaluation') || '{}'))
    check('评分实时写入 evaluationStore', !!evalAfterFill['1']?.experts?.['专家甲'])

    await page.locator('button').filter({ hasText: '提交评分并签名' }).click()
    await page.waitForTimeout(600)
    // 步骤5：电子签名（点击签名区）
    await page.locator('.sign-placeholder').click()
    await page.waitForTimeout(600)
    check('电子签名完成', (await page.locator('body').innerText()).includes('电子签名已完成'))

    // 提交评分
    await page.locator('#expert-submit-btn').click()
    await page.locator('.ant-modal-confirm .ant-btn-primary, .ant-modal .ant-btn-primary').first().click()
    await page.waitForTimeout(1000)
    const evalStored = await page.evaluate(() => JSON.parse(localStorage.getItem('bidding-evaluation') || '{}'))
    check('评分已提交（submitted=true）', evalStored['1']?.experts?.['专家甲']?.submitted === true)
    await page.screenshot({ path: 'review-assets/expert-evaluation-submitted.png' })

    // 刷新持久化
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1200)
    const reloadedText = await page.locator('body').innerText()
    check('刷新后提交/签名状态持久化', reloadedText.includes('电子签名已完成') || reloadedText.includes('已提交') || reloadedText.includes('已锁定'))

    // ============ C. 统一入口：无 projectId 重定向 ============
    await page.goto(hashUrl(BASE_URL, '/admin/expert-project'))
    await page.waitForURL('**/#/admin/expert-tasks', { timeout: 15000 })
    check('/admin/expert-project 无参重定向到 /admin/expert-tasks', true, page.url())

    // 工作台入口
    await page.locator('.ant-menu-item').filter({ hasText: '工作台' }).first().click()
    await page.waitForURL('**/#/admin/dashboard', { timeout: 15000 })
    await page.waitForTimeout(800)
    await page.locator('button').filter({ hasText: '进入评标大厅' }).click()
    await page.waitForURL('**/#/admin/expert-tasks', { timeout: 15000 })
    check('工作台「进入评标大厅」直达我的评标任务', true, page.url())

    // ============ D. 回归 ============
    await logout(page)
    await login(page, '招标人')
    const tendereeMenu = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    check('招标人菜单回归 ≤ 10 项', tendereeMenu.length <= 10, `实际 ${tendereeMenu.length} 项`)
    await logout(page)
    await login(page, '招标代理')
    const agentMenu = (await page.locator('ul.ant-menu-root > li').allInnerTexts()).map((t) => t.trim())
    check('代理菜单回归 ≤ 10 项', agentMenu.length <= 10, `实际 ${agentMenu.length} 项`)
    check('代理菜单回归含「业务台账」', agentMenu.some((t) => t.includes('业务台账')))

    check('浏览器控制台无错误', consoleErrors.length === 0, consoleErrors.join(' ; ').slice(0, 300))
  } catch (err) {
    console.error('脚本执行异常:', err.message)
    check('脚本执行无异常', false, err.message)
    try {
      await dumpButtons(page, '出错时')
      await page.screenshot({ path: 'review-assets/expert-redline-error.png', fullPage: true })
    } catch {}
  } finally {
    await context.tracing.stop({ path: TRACE_OUT })
    await browser.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n===== 专家红线实测: ${results.length - failed.length}/${results.length} 通过 =====`)
  if (failed.length > 0) {
    failed.forEach((f) => console.log(`  FAIL - ${f.name}: ${f.detail}`))
    process.exit(1)
  }
  console.log(`trace: ${TRACE_OUT}`)
}

main()
