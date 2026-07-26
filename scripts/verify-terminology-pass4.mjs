import { chromium } from '/Users/zph/.nvm/versions/node/v24.16.0/lib/node_modules/playwright/index.mjs'

const BASE_URL = 'http://localhost:4173/bidding-prototype'
const hashUrl = (base, path) => `${base}/#${path}`

const BANNED = ['公开询比', '公开唱价', '公开项目', '意向公开', '商务标', '技术标', '报价标', '价格标', '询比价', '招标', '投标', '串标', '流标', '废标', '开标', '评标', '中标', '唱标']

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

async function login(page, roleLabel) {
  await page.goto(hashUrl(BASE_URL, '/login'))
  await page.waitForLoadState('networkidle')
  try {
    await page.waitForSelector('#login-role', { timeout: 5000 })
  } catch {
    // 已登录态会被重定向（会话在 sessionStorage），清存储并强制刷新后重进登录页
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('#login-role', { timeout: 15000 })
  }
  await page.click(`#login-role button:has-text("${roleLabel}")`)
  await page.waitForSelector('.role-banner', { timeout: 15000 })
  await page.waitForTimeout(600)
}

async function scanBanned(page, pageName) {
  const text = await page.locator('body').innerText()
  const hits = BANNED.filter((w) => text.includes(w))
  check(`${pageName} 无禁用字眼`, hits.length === 0, hits.length ? `命中: ${hits.join('、')}` : '')
  return text
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => consoleErrors.push(err.message))

  try {
    // A. 采购单位：项目 10（原公开询比）详情页采购方式应为「阳光询比」
    await login(page, '采购单位')
    await page.goto(hashUrl(BASE_URL, '/admin/projects/detail/10'))
    await page.waitForTimeout(1200)
    const detailText = await scanBanned(page, '项目10详情页')
    check('项目10采购方式显示「阳光询比」', detailText.includes('阳光询比'))

    // B. 创建项目页采购方式下拉
    await page.goto(hashUrl(BASE_URL, '/admin/projects/create'))
    await page.waitForTimeout(1200)
    await scanBanned(page, '创建项目页')

    // C. 工作台（采购单位）
    await page.goto(hashUrl(BASE_URL, '/admin/dashboard'))
    await page.waitForTimeout(1200)
    await scanBanned(page, '工作台')

    // D. 响应单位：BidUpload 项目 1（阳光采购）必传文件类型应为 商务/技术/报价文件
    await login(page, '响应单位')
    await page.goto(hashUrl(BASE_URL, '/admin/bid-upload?projectId=1'))
    await page.waitForTimeout(1500)
    const uploadText = await scanBanned(page, '文件上传页')
    check('上传页文件类型为「商务文件/技术文件/报价文件」',
      uploadText.includes('商务文件') && uploadText.includes('技术文件') && uploadText.includes('报价文件'))

    // E. 响应单位项目中心（含阳光询比项目 10 标签）
    await page.goto(hashUrl(BASE_URL, '/admin/bidder-projects'))
    await page.waitForTimeout(1200)
    const bpText = await scanBanned(page, '项目中心')
    check('项目中心可见「阳光询比」标签', bpText.includes('阳光询比'))
  } catch (err) {
    console.log('脚本异常:', err.message)
    results.push({ name: '脚本执行', ok: false })
  } finally {
    const failed = results.filter((r) => !r.ok)
    console.log(`\n${results.length - failed.length}/${results.length} 通过`)
    if (consoleErrors.length) console.log('控制台错误:', consoleErrors.slice(0, 5))
    await browser.close()
    process.exit(failed.length ? 1 : 0)
  }
}

main()
