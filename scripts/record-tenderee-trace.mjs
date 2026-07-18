import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'

const OUTPUT = 'review-assets/tenderee-workflow-trace.zip'

function hashUrl(base, path) {
  return `${base}/#${path}`
}

async function dumpDebug(page, label) {
  const ts = Date.now()
  const screenshotPath = `review-assets/debug-${label}-${ts}.png`
  const contentPath = `review-assets/debug-${label}-${ts}.html`
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true })
    const content = await page.content()
    writeFileSync(contentPath, content)
    console.log(`Debug dump: ${screenshotPath}, ${contentPath}`)
  } catch (e) {
    console.error('Debug dump failed:', e.message)
  }
}

async function waitForDrawer(page, title) {
  const drawer = page.locator('.ant-drawer').filter({ hasText: title })
  await drawer.waitFor({ timeout: 10000 })
  return drawer
}

async function fillRequirementForm(page, data) {
  await page.fill('#title', data.title)

  // 需求类型下拉
  await page.locator('#type').locator('..').locator('..').click()
  await page.locator('.ant-select-dropdown .ant-select-item').filter({ hasText: data.type }).click()

  await page.fill('#budget', String(data.budget))
  await page.fill('#content', data.content)

  // 状态下拉
  await page.locator('#status').locator('..').locator('..').click()
  await page.locator('.ant-select-dropdown .ant-select-item').filter({ hasText: data.status }).click()

  await page.fill('#publisher', data.publisher)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  })

  await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
  const page = await context.newPage()

  const consoleLogs = []
  page.on('console', (msg) => {
    const text = msg.text()
    consoleLogs.push(`[${msg.type()}] ${text}`)
    if (msg.type() === 'error') {
      console.error('Page console error:', text)
    }
  })
  page.on('pageerror', (err) => {
    console.error('Page JS error:', err.message)
    consoleLogs.push(`[pageerror] ${err.message}`)
  })

  try {
    const BASE_URL = 'http://localhost:5173/bidding-prototype'

    // ============ 公共：登录 ============
    await page.goto(hashUrl(BASE_URL, '/login'))
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#login-role', { timeout: 15000 })
    await page.click('#login-role button:has-text("招标人")')
    await page.waitForSelector('.role-banner', { timeout: 15000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'review-assets/tenderee-dashboard.png' })

    // ============ 工作流 1：采购需求 CRUD ============
    console.log('=== 工作流 1：采购需求 CRUD ===')

    // 进入采购需求库
    const reqMenu = page.locator('.ant-menu-item, .ant-menu-submenu-title').filter({ hasText: '采购需求库' })
    await reqMenu.click()
    await page.waitForURL('**/#/admin/procurement-requirements', { timeout: 15000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'review-assets/tenderee-requirement-empty.png' })

    // 新建需求
    await page.click('button:has-text("新建需求")')
    await waitForDrawer(page, '新建采购需求')
    await page.waitForTimeout(400)

    const requirementTitle = '2026年度服务器集中采购'
    await fillRequirementForm(page, {
      title: requirementTitle,
      type: '信息化类',
      budget: 120,
      content: '采购虚拟化服务器 10 台、存储阵列 1 套及三年维保服务，要求具备 ISO27001 信息安全资质。',
      status: '草稿',
      publisher: '张三'
    })
    await page.screenshot({ path: 'review-assets/tenderee-requirement-form-filled.png' })

    await page.locator('.ant-drawer-footer .ant-btn-primary').click()
    const createdRow = page.locator('.ant-table-row').filter({ hasText: requirementTitle })
    await createdRow.waitFor({ timeout: 15000 })
    await createdRow.locator('.ant-tag').filter({ hasText: '草稿' }).waitFor({ timeout: 10000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'review-assets/tenderee-requirement-created.png' })
    console.log('需求已创建')

    // 编辑需求
    await createdRow.locator('button').filter({ hasText: '编辑' }).click()
    await waitForDrawer(page, '编辑采购需求')
    await page.waitForTimeout(400)
    await fillRequirementForm(page, {
      title: requirementTitle,
      type: '信息化类',
      budget: 135,
      content: '采购虚拟化服务器 10 台、存储阵列 1 套及三年维保服务，要求具备 ISO27001 信息安全资质。经复核，预算调整为 135 万元。',
      status: '草稿',
      publisher: '张三'
    })
    await page.screenshot({ path: 'review-assets/tenderee-requirement-edited.png' })
    await page.locator('.ant-drawer-footer .ant-btn-primary').click()
    await createdRow.locator('.ant-tag').filter({ hasText: '草稿' }).waitFor({ timeout: 15000 })
    console.log('需求已更新')

    // 删除临时需求
    await page.click('button:has-text("新建需求")')
    await waitForDrawer(page, '新建采购需求')
    await page.waitForTimeout(400)
    const tempTitle = '临时测试需求-待删除'
    await fillRequirementForm(page, {
      title: tempTitle,
      type: '货物类',
      budget: 10,
      content: '此需求仅用于演示删除操作。',
      status: '草稿',
      publisher: '张三'
    })
    await page.locator('.ant-drawer-footer .ant-btn-primary').click()
    const tempRow = page.locator('.ant-table-row').filter({ hasText: tempTitle })
    await tempRow.waitFor({ timeout: 15000 })
    await tempRow.locator('button').filter({ hasText: '删除' }).click()
    await page.locator('.ant-popconfirm-buttons .ant-btn-primary').filter({ hasText: 'OK' }).click()
    await tempRow.waitFor({ state: 'detached', timeout: 10000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'review-assets/tenderee-requirement-deleted.png' })
    console.log('临时需求已删除')

    // ============ 工作流 2：采购需求审批流 ============
    console.log('=== 工作流 2：采购需求审批流 ===')

    // 提交审批
    const mainRow = page.locator('.ant-table-row').filter({ hasText: requirementTitle })
    await mainRow.locator('button').filter({ hasText: '提交审批' }).click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'review-assets/tenderee-requirement-submitted.png' })
    console.log('需求已提交审批')

    // 进入审批中心
    const approvalMenu = page.locator('.ant-menu-item').filter({ hasText: '审批中心' })
    await approvalMenu.click()
    await page.waitForURL('**/#/admin/approval-center', { timeout: 15000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'review-assets/tenderee-approval-center.png' })

    // 切换审批身份为「需求部门」并审批通过
    await page.locator('.ant-select').filter({ hasText: '采购管理部' }).click()
    await page.locator('.ant-select-dropdown .ant-select-item').filter({ hasText: '需求部门' }).click()
    await page.waitForTimeout(600)
    await page.screenshot({ path: 'review-assets/tenderee-approval-dept.png' })

    const firstApproval = page.locator('.ant-table-row').first()
    await firstApproval.locator('button').filter({ hasText: '通过' }).click()
    await page.waitForTimeout(400)
    await page.locator('.ant-modal').filter({ hasText: '审批意见' }).waitFor({ timeout: 10000 })
    await page.fill('.ant-modal textarea', '需求内容已核实，同意进入采购管理部审核。')
    await page.locator('.ant-modal-footer button').filter({ hasText: /确定|确认|OK/ }).first().click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'review-assets/tenderee-approval-dept-done.png' })
    console.log('需求部门审批通过')

    // 切换审批身份为「采购管理部」并审批通过
    await page.locator('.ant-select').filter({ hasText: '需求部门' }).click()
    await page.locator('.ant-select-dropdown .ant-select-item').filter({ hasText: '采购管理部' }).click()
    await page.waitForTimeout(600)

    const secondApproval = page.locator('.ant-table-row').first()
    await secondApproval.locator('button').filter({ hasText: '通过' }).click()
    await page.waitForTimeout(400)
    await page.locator('.ant-modal').filter({ hasText: '审批意见' }).waitFor({ timeout: 10000 })
    await page.fill('.ant-modal textarea', '预算与资质要求符合规定，准予发布。')
    await page.locator('.ant-modal-footer button').filter({ hasText: /确定|确认|OK/ }).first().click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'review-assets/tenderee-approval-mgmt-done.png' })
    console.log('采购管理部审批通过')

    // 返回采购需求库，验证状态为「已发布」
    await reqMenu.click()
    await page.waitForURL('**/#/admin/procurement-requirements', { timeout: 15000 })
    await page.waitForTimeout(800)
    await mainRow.locator('.ant-tag').filter({ hasText: '已发布' }).waitFor({ timeout: 15000 })
    await page.screenshot({ path: 'review-assets/tenderee-requirement-published.png' })
    console.log('需求审批完成，状态已发布')

    // ============ 工作流 3：项目立项（基于已发布需求） ============
    console.log('=== 工作流 3：项目立项 ===')

    // 进入创建项目
    const projectMenu = page.locator('.ant-menu-item, .ant-menu-submenu-title').filter({ hasText: '项目管理' })
    await projectMenu.click()
    await page.waitForTimeout(300)
    await page.locator('li[data-menu-id$="/admin/projects/create"]').filter({ hasText: '创建项目' }).click()
    await page.waitForURL('**/#/admin/projects/create', { timeout: 15000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'review-assets/tenderee-project-create-step0.png' })

    // Step 0：基本信息
    const tomorrow = new Date(Date.now() + 86400000)
    const nextWeek = new Date(Date.now() + 7 * 86400000)
    const formatDateTime = (d) => {
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    await page.fill('#name', '2026年度服务器集中采购项目')
    await page.fill('#budget', '135')

    // 开标时间：打开 AntD DatePicker 面板，选今天后 8 天，点击确定
    await page.click('#openTime')
    await page.waitForTimeout(400)
    // 点击「今天」后 8 天的日期单元格：先找到今天，再往后推 8 个可用单元格
    const todayCell = page.locator('.ant-picker-cell-today')
    await todayCell.waitFor({ timeout: 10000 })
    const targetDay = todayCell.locator('..').locator('..').locator('.ant-picker-cell-in-view').nth(8)
    await targetDay.click()
    await page.waitForTimeout(200)
    await page.locator('.ant-picker-ok button').first().click()
    await page.waitForTimeout(300)

    await page.fill('#intro', '基于已发布的年度服务器采购需求立项，采用自行招标方式，分一个标段实施。')
    await page.screenshot({ path: 'review-assets/tenderee-project-create-basic.png' })

    // 保存草稿（不强制校验标段，形成项目草稿即可）
    await page.click('button:has-text("保存草稿")')
    await page.waitForURL('**/#/admin/projects', { timeout: 15000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'review-assets/tenderee-project-list.png' })
    console.log('项目已保存为草稿')

    // 验证项目列表中出现新项目
    const projectRow = page.locator('.ant-table-row').filter({ hasText: '2026年度服务器集中采购项目' })
    await projectRow.waitFor({ timeout: 15000 })
    console.log('项目已出现在项目列表')

    // 进入项目详情
    await projectRow.locator('button').filter({ hasText: '详情' }).click()
    await page.waitForURL('**/#/admin/projects/detail/**', { timeout: 15000 })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'review-assets/tenderee-project-detail.png', fullPage: true })
    console.log('进入项目详情驾驶舱')

    // ============ 停止 tracing ============
    const outDir = dirname(OUTPUT)
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
    await context.tracing.stop({ path: OUTPUT })

    console.log('Trace saved to:', OUTPUT)
  } catch (err) {
    console.error('录制失败:', err)
    await dumpDebug(page, 'error')
    writeFileSync('review-assets/console-logs.txt', consoleLogs.join('\n'))
    await context.tracing.stop({ path: OUTPUT })
    throw err
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
