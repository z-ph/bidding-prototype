// 0727 口径端到端验证：创建项目单页化 + 删采购需求库 + 立项审核闭环
// 用法：先起 dev server（pnpm run dev --port 5199），再 node scripts/verify-0727-simplify.mjs
import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE_URL = 'http://localhost:5199/bidding-prototype'
const TRACE_OUT = 'review-assets/verify-0727-simplify-trace.zip'
const hashUrl = (base, path) => `${base}/#${path}`
const PROJECT_NAME = '0727单页化立项闭环验证项目'
const PROJECT_NAME_2 = '0727驳回退回验证项目'

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

// 填写一个 antd DatePicker(showTime)：打开面板 → 选当月第 nth 个有效日期 → 点确定
async function pickDate(page, selector, nth) {
  await page.click(selector)
  const dropdown = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last()
  await dropdown.waitFor({ timeout: 10000 })
  await dropdown.locator('.ant-picker-cell-in-view').nth(nth).click()
  await page.waitForTimeout(200)
  await dropdown.locator('.ant-picker-ok button').first().click()
  await page.waitForTimeout(300)
}

// 在创建项目页填写最小必要字段并加一个采购包
async function fillCreateForm(page, name) {
  await page.fill('#name', name)
  await page.fill('#budget', '80')
  await pickDate(page, '#openTime', 10)
  await page.fill('#intro', '端到端验证：单页创建、立项审批闭环。')
  await page.fill('textarea[placeholder*="填写采购需求内容"]', '页内直接填写采购需求说明。')

  await page.click('button:has-text("添加采购包")')
  await page.waitForTimeout(400)
  await page.fill('input[placeholder="例如：第一采购包"]', '第一采购包')
  await page.fill('input[placeholder="万元"]', '60')
  await page.fill('textarea[placeholder="描述本采购包采购内容"]', '验证采购包内容')
  await pickDate(page, 'input[placeholder="响应开始时间"]', 12)
  await pickDate(page, 'input[placeholder="采购截止时间"]', 20)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
  const page = await context.newPage()

  const consoleErrors = []
  page.on('console', (msg) => {
    // destroyOnClose 为存量代码的 antd 6 弃用告警（Login/Register/AdminBanners 等 7 处），与本提案无关，过滤
    if (msg.type() === 'error' && !msg.text().includes('destroyOnClose')) consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(err.message))

  try {
    // ============ A. 采购单位登录：菜单无采购需求库 ============
    await login(page, '采购单位')
    const menuTexts = await page.locator('ul.ant-menu-root').allInnerTexts()
    const menuJoined = menuTexts.join('\n')
    check('采购单位主导航无「采购需求库」', !menuJoined.includes('采购需求库'))

    // ============ B. 旧需求库 URL 重定向到创建项目 ============
    await page.goto(hashUrl(BASE_URL, '/admin/procurement-requirements'))
    await page.waitForURL('**/#/admin/projects/create**', { timeout: 15000 })
    check('旧 URL /admin/procurement-requirements 重定向到创建项目页', true)

    // ============ C. 创建项目页：单页化 + 最小字段 ============
    await page.waitForTimeout(800)
    check('创建项目页无分步条（Steps）', (await page.locator('.ant-steps').count()) === 0)
    check('页面无「关联采购需求」字段', (await page.locator('label:has-text("关联采购需求")').count()) === 0)
    check('页面无「需求来源」字段', (await page.locator('label:has-text("需求来源")').count()) === 0)
    check('页面无「需求编号」字段', (await page.locator('label:has-text("需求编号")').count()) === 0)
    const codeInput = page.locator('input[disabled]').first()
    const codeValue = await codeInput.inputValue()
    check('项目编号自动生成且不可编辑', /^ZB\d{11,}$/.test(codeValue) && (await codeInput.isDisabled()), codeValue)
    check('页面含「采购需求」分组（页内创建需求）', (await page.locator('.ant-card-head-title:has-text("采购需求")').count()) > 0)

    // ============ D. 填写并提交 → 项目 pending + 立项审批单 ============
    await fillCreateForm(page, PROJECT_NAME)
    await page.click('button:has-text("提交审核")')
    await page.waitForURL('**/#/admin/projects', { timeout: 15000 })
    await page.waitForTimeout(1000)
    const row = page.locator('.ant-table-row').filter({ hasText: PROJECT_NAME })
    await row.waitFor({ timeout: 15000 })
    check('提交后项目出现在项目列表', true)
    check('项目状态为「待审核」', (await row.innerText()).includes('待审核'))

    // ============ E. 审批中心：需求部门 → 采购管理部 两级通过 ============
    await page.goto(hashUrl(BASE_URL, '/admin/approval-center'))
    await page.waitForTimeout(1000)
    // 默认身份为采购管理部，链首节点是需求部门：先切换身份
    await page.locator('.ant-select').first().click()
    await page.waitForTimeout(300)
    await page.locator('.ant-select-item:has-text("需求部门")').first().click()
    await page.waitForTimeout(800)
    const todoRow = page.locator('.ant-table-row').filter({ hasText: `${PROJECT_NAME} 立项审批` })
    await todoRow.waitFor({ timeout: 15000 })
    check('审批中心待办出现立项审批单（需求部门节点）', true)
    await todoRow.locator('button:has-text("通过")').click()
    await page.waitForTimeout(400)
    await page.locator('.ant-modal button:has-text("确认通过")').click()
    await page.waitForTimeout(1000)

    // 切回采购管理部节点，第二级通过
    await page.locator('.ant-select').first().click()
    await page.waitForTimeout(300)
    await page.locator('.ant-select-item:has-text("采购管理部")').first().click()
    await page.waitForTimeout(800)
    const todoRow2 = page.locator('.ant-table-row').filter({ hasText: `${PROJECT_NAME} 立项审批` })
    await todoRow2.waitFor({ timeout: 15000 })
    check('审批单流转到采购管理部节点', true)
    await todoRow2.locator('button:has-text("通过")').click()
    await page.waitForTimeout(400)
    await page.locator('.ant-modal button:has-text("确认通过")').click()
    await page.waitForTimeout(1000)

    // ============ F. 项目列表：待发布 → 发布采购 → 采购中 ============
    await page.goto(hashUrl(BASE_URL, '/admin/projects'))
    await page.waitForTimeout(1000)
    const approvedRow = page.locator('.ant-table-row').filter({ hasText: PROJECT_NAME })
    check('立项通过后项目状态为「待发布」', (await approvedRow.innerText()).includes('待发布'))
    await approvedRow.locator('button:has-text("发布采购")').first().click()
    await page.waitForTimeout(400)
    await page.locator('.ant-modal button:has-text("确认发布采购")').click()
    await page.waitForTimeout(1000)
    const tenderingRow = page.locator('.ant-table-row').filter({ hasText: PROJECT_NAME })
    check('发布采购后项目状态为「采购中」', (await tenderingRow.innerText()).includes('采购中'))

    // ============ G. localStorage 持久化：刷新（重新登录）后状态保留 ============
    await page.reload()
    await page.waitForSelector('#login-role', { timeout: 15000 })
    await page.click('#login-role button:has-text("采购单位")')
    await page.waitForSelector('.role-banner', { timeout: 15000 })
    await page.waitForTimeout(600)
    await page.goto(hashUrl(BASE_URL, '/admin/projects'))
    await page.waitForTimeout(1200)
    const persistedRow = page.locator('.ant-table-row').filter({ hasText: PROJECT_NAME })
    check('刷新后项目状态保持「采购中」（localStorage 持久化）', (await persistedRow.innerText()).includes('采购中'))

    // ============ H. 驳回路径：退回草稿并记录意见 ============
    await page.goto(hashUrl(BASE_URL, '/admin/projects/create'))
    await page.waitForTimeout(800)
    await fillCreateForm(page, PROJECT_NAME_2)
    await page.click('button:has-text("提交审核")')
    await page.waitForURL('**/#/admin/projects', { timeout: 15000 })
    await page.waitForTimeout(800)

    await page.goto(hashUrl(BASE_URL, '/admin/approval-center'))
    await page.waitForTimeout(1000)
    await page.locator('.ant-select').first().click()
    await page.waitForTimeout(300)
    await page.locator('.ant-select-item:has-text("需求部门")').first().click()
    await page.waitForTimeout(800)
    const rejectRow = page.locator('.ant-table-row').filter({ hasText: `${PROJECT_NAME_2} 立项审批` })
    await rejectRow.waitFor({ timeout: 15000 })
    await rejectRow.locator('button:has-text("驳回")').click()
    await page.waitForTimeout(400)
    await page.fill('.ant-modal textarea', '预算依据不足，请补充后重新提交。')
    await page.locator('.ant-modal button:has-text("确认驳回")').click()
    await page.waitForTimeout(1000)

    await page.goto(hashUrl(BASE_URL, '/admin/projects'))
    await page.waitForTimeout(1000)
    const rejectedRow = page.locator('.ant-table-row').filter({ hasText: PROJECT_NAME_2 })
    check('驳回后项目退回「草稿」', (await rejectedRow.innerText()).includes('草稿'))

    // ============ I. 代理菜单同样无采购需求库 ============
    await page.locator('button').filter({ hasText: '退出' }).click()
    await page.waitForURL('**/#/login**', { timeout: 15000 })
    await login(page, '采购代理')
    const agentMenu = (await page.locator('ul.ant-menu-root').allInnerTexts()).join('\n')
    check('代理主导航无「采购需求库」', !agentMenu.includes('采购需求库'))

    check('无浏览器 console 错误', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))
  } catch (err) {
    check('脚本执行完成（无异常中断）', false, String(err).slice(0, 300))
  } finally {
    await context.tracing.stop({ path: TRACE_OUT })
    await browser.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n共 ${results.length} 项检查，${failed.length} 项失败`)
  process.exit(failed.length > 0 ? 1 : 0)
}

main()
