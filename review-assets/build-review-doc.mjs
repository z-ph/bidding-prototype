import { writeFile } from 'node:fs/promises'

const groups = [
  ['公共入口', [
    ['PUB-001', '平台门户', '/', null],
    ['PUB-002', '登录页', '/login', null],
    ['PUB-003', '注册页', '/register', null],
  ]],
  ['招标人', [
    ['TEN-001', '招标人控制面板', '/admin/dashboard', 'tenderee'],
    ['TEN-002', '项目列表', '/admin/projects', 'tenderee'],
    ['TEN-003', '创建项目', '/admin/projects/create', 'tenderee'],
    ['TEN-004', '项目跟踪', '/admin/projects/track', 'tenderee'],
    ['TEN-005', '招标文件编制', '/admin/tender-doc', 'tenderee'],
    ['TEN-006', '发布公告', '/admin/notice-publish', 'tenderee'],
    ['TEN-007', '费用管理', '/admin/fee-manage', 'tenderee'],
    ['TEN-008', '异议管理', '/admin/objection-manage', 'tenderee'],
    ['TEN-009', '确认中标人', '/admin/award-confirm', 'tenderee'],
    ['TEN-010', '中标通知书', '/admin/award-notice', 'tenderee'],
    ['TEN-011', '合同归档', '/admin/contract-archive', 'tenderee'],
    ['TEN-012', '开标大厅', '/admin/opening-hall', 'tenderee'],
    ['TEN-013', '评标大厅', '/admin/evaluation-hall', 'tenderee'],
  ]],
  ['招标代理', [
    ['AGT-001', '招标代理控制面板', '/admin/dashboard', 'agent'],
  ]],
  ['投标人 / 供应商', [
    ['BID-001', '投标人控制面板', '/admin/dashboard', 'bidder'],
    ['BID-002', '项目中心', '/admin/bidder-projects', 'bidder'],
    ['BID-003', '项目报名', '/admin/bid-register', 'bidder'],
    ['BID-004', '缴纳费用', '/admin/bid-payment', 'bidder'],
    ['BID-005', '下载招标文件', '/admin/bid-download', 'bidder'],
    ['BID-006', '在线报价', '/admin/bid-quote', 'bidder'],
    ['BID-007', '上传投标文件', '/admin/bid-upload', 'bidder'],
    ['BID-008', '发票申请', '/admin/bidder-invoices', 'bidder'],
  ]],
  ['评标专家', [
    ['EXP-001', '评标专家控制面板', '/admin/dashboard', 'expert'],
    ['EXP-002', '评标任务', '/admin/expert-project', 'expert'],
    ['EXP-003', '查阅资料', '/admin/bid-download', 'expert'],
  ]],
  ['监督人员', [
    ['SUP-001', '监督人员控制面板', '/admin/dashboard', 'supervisor'],
    ['SUP-002', '监督大厅', '/admin/supervisor-hall', 'supervisor'],
    ['SUP-003', '监督操作日志', '/admin/supervisor-logs', 'supervisor'],
  ]],
  ['平台管理员', [
    ['ADM-001', '平台管理控制台', '/admin/admin-dashboard', 'admin'],
    ['ADM-002', '用户权限', '/admin/admin-users', 'admin'],
    ['ADM-003', '参数字典', '/admin/admin-dictionary', 'admin'],
    ['ADM-004', '供应商准入审核', '/admin/admin-supplier-audit', 'admin'],
    ['ADM-005', '日志审计', '/admin/admin-logs', 'admin'],
  ]],
]

const reviewTable = `<table><colgroup><col width="120"/><col width="180"/><col width="180"/><col width="80"/><col width="90"/><col width="80"/></colgroup><thead><tr><th background-color="light-gray"><b>问题位置 / 元素</b></th><th background-color="light-gray"><b>问题描述</b></th><th background-color="light-gray"><b>修改建议</b></th><th background-color="light-gray"><b>优先级</b></th><th background-color="light-gray"><b>负责人</b></th><th background-color="light-gray"><b>状态</b></th></tr></thead><tbody><tr><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td><td><p>待处理</p></td></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td><td><p></p></td><td><p>待处理</p></td></tr></tbody></table>`

const body = [
  '<title>招投标采购平台原型页面评审截图清单 V1 2026-07-11</title>',
  '<p><b>招投标采购平台原型页面评审截图清单 V1（2026-07-11）</b></p>',
  '<p>本文档用于招投标采购平台原型页面评审。截图基于当前 main 分支，页面编号仅用于本清单与路由对照。</p>',
  '<p>截图视口：桌面端 1440x1000；后台页面保留完整侧栏、顶部角色信息与主要内容区。</p>',
  '<p>页面总数：36。覆盖公共入口、招标人、招标代理、投标人 / 供应商、评标专家、监督人员、平台管理员七个分组。同事可在各页面下方表格补充问题、修改建议、优先级、负责人和状态。</p>',
]

for (const [group, pages] of groups) {
  body.push(`<p><b>${group}</b></p>`)
  for (const [id, title, route, role] of pages) {
    const routeText = role ? `${route}?role=${role}` : route
    body.push(`<p><b>${id} ${title}</b></p>`)
    body.push(`<p>路由：${routeText}</p>`)
    body.push(reviewTable)
    body.push('<p></p>')
  }
}

await writeFile('review-assets/page-review.xml', body.join('\n'))

const manifest = groups.flatMap(([, pages]) => pages).map(([id, title, route, role]) => {
  const routeText = role ? `${route}?role=${role}` : route
  return [id, title, routeText, `review-assets/screenshots-2026-07-11/${id}-${title}.png`].join('\t')
})

await writeFile('review-assets/page-review-manifest.tsv', `${manifest.join('\n')}\n`)
