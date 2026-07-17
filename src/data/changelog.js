// 变更时间线数据：每轮实质变更（版本递增）在此登记，最新版本在前。
// 维护要求见 AGENTS.md「版本信息维护」：递增 package.json version 时必须同步在此新增条目，
// 页面 /admin/changelog 会自动按本数据渲染时间线。

export const CHANGE_TYPES = {
  feat: { label: '新增', color: 'blue' },
  fix: { label: '修复', color: 'orange' },
  remove: { label: '下线', color: 'red' },
  docs: { label: '文档', color: 'default' }
}

export const CHANGELOG = [
  {
    version: '0.1.0',
    date: '2026-07-17',
    title: '0717 新口径对齐与版本追溯体系',
    changes: [
      { type: 'remove', text: '报名流整体下线（清单 10/11）：BidRegister 报名页、门户与公告详情报名入口、项目创建报名起止字段删除；阶段「报名中」改称「公告中」' },
      { type: 'remove', text: '合同归档下线（清单 33）：ContractArchive 页面与流程归档节点移除，定标流程在中标通知书发出后结束' },
      { type: 'remove', text: '供应商异议/质疑下线（清单 44/45）：ObjectionManage、BidDownload/NoticeDetail 质疑按钮与 objectionStore 移除' },
      { type: 'remove', text: '在线缴费与发票申请下线（清单 26、概要七）：BidPayment、BidderInvoices 移除；标段标书费/保证金字段删除' },
      { type: 'feat', text: '费用管理改造为「中标人投标费用登记台账」：线下收缴、凭证登记，无在线支付' },
      { type: 'feat', text: '评审报告注入版本信息（react-page-review 0.8.0 reportInfo）：导出的评审报告自动携带应用名称与版本号' },
      { type: 'feat', text: '全站版本号水印（VersionWatermark）：页面平铺当前版本，截图/演示可追溯到具体版本' },
      { type: 'feat', text: '变更时间线页面（本页）：按版本记录功能变更、修复与流程下线' },
      { type: 'fix', text: '项目跟踪招标方时间线节点标题不显示（FLOW_NODES label 与渲染端 title 不匹配）' },
      { type: 'fix', text: '构建基线支持 Cloudflare Pages 根路径部署（CF_PAGES 环境变量切换 base）' },
      { type: 'docs', text: '29 个已完成提案归档并合并 living specs；remove-deprecated-flows-20260717 经甲方确认「四类全下」后实施并归档' }
    ]
  }
]
