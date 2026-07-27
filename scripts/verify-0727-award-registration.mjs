// AwardConfirm 中选结果审批登记冒烟：登记写项目 awardRegistration（不走 approvalStore），刷新后保留
import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE_URL = 'http://localhost:5199/bidding-prototype'
const hashUrl = (base, path) => `${base}/#${path}`
const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
  try {
    await page.goto(hashUrl(BASE_URL, '/login'))
    await page.waitForSelector('#login-role', { timeout: 15000 })
    await page.click('#login-role button:has-text("采购单位")')
    await page.waitForSelector('.role-banner', { timeout: 15000 })
    await page.waitForTimeout(600)

    // 种子项目 9（已确认中选人）：登记卡片应渲染
    await page.goto(hashUrl(BASE_URL, '/admin/award-confirm?projectId=9'))
    await page.waitForTimeout(1200)
    check('中选结果审批结果登记卡片渲染', (await page.locator('.ant-card-head-title:has-text("中选结果审批结果登记")').count()) > 0)

    await page.fill('input[placeholder="请输入外部审批文号"]', '采审〔2026〕15号')
    await page.click('.ant-picker input')
    await page.waitForTimeout(400)
    await page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-cell-in-view').nth(15).click()
    await page.waitForTimeout(300)
    await page.click('button:has-text("登记审批结果")')
    await page.waitForTimeout(1000)
    check('登记后展示审批文号', (await page.locator('.ant-descriptions').allInnerTexts()).join('\n').includes('采审〔2026〕15号'))

    // 刷新（重新登录）后登记结果保留
    await page.reload()
    await page.waitForSelector('#login-role', { timeout: 15000 })
    await page.click('#login-role button:has-text("采购单位")')
    await page.waitForSelector('.role-banner', { timeout: 15000 })
    await page.waitForTimeout(600)
    await page.goto(hashUrl(BASE_URL, '/admin/award-confirm?projectId=9'))
    await page.waitForTimeout(1200)
    check('刷新后登记结果保留（localStorage）', (await page.locator('.ant-descriptions').allInnerTexts()).join('\n').includes('采审〔2026〕15号'))

    // 审批中心不应出现中选结果审批单
    await page.goto(hashUrl(BASE_URL, '/admin/approval-center'))
    await page.waitForTimeout(1200)
    check('审批中心无中选结果类型单据', (await page.locator('td:has-text("中选结果")').count()) === 0)
  } catch (err) {
    check('脚本执行完成', false, String(err).slice(0, 300))
  } finally {
    await browser.close()
  }
  const failed = results.filter((r) => !r.ok)
  console.log(`\n共 ${results.length} 项检查，${failed.length} 项失败`)
  process.exit(failed.length > 0 ? 1 : 0)
}

main()
