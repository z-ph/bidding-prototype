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
    version: '0.9.2',
    date: '2026-07-18',
    title: '移除门户头部「评审变更」过渡入口',
    changes: [
      { type: 'remove', text: '门户头部「评审变更」按钮移除：开发过渡入口不耦合进业务门面，台账统一走全局悬浮按钮；/review-change-list 公开路由保留（重定向到合并页，兼容旧链接）' }
    ]
  },
  {
    version: '0.9.1',
    date: '2026-07-18',
    title: '评审台账合并页改公开路由（修复未登录 Forbidden）',
    changes: [
      { type: 'fix', text: '合并页从 /admin 布局移至公开路由 /dev-ledger：修复未登录点击悬浮按钮被 Forbidden 拦截（/admin 布局 beforeLoad 对未登录一律拦截）；页面加标题+返回头部，DevLedgerFab 与四个旧路由重定向目标统一改到 /dev-ledger' },
      { type: 'remove', text: 'permissions.js 删除 /admin/dev-ledger 权限项（公开页无需权限）；删除 admin.dev-ledger.lazy、review-change-list.lazy 死文件' }
    ]
  },
  {
    version: '0.9.0',
    date: '2026-07-18',
    title: '评审台账悬浮入口与 Tab 合并页',
    changes: [
      { type: 'feat', text: '新增 DevLedgerFab 全局可拖拽悬浮按钮：右下初始位（避让 react-page-review 按钮），pointer events 拖拽，位移 ≤5px 判定点击，位置 localStorage 持久化，所有页面可见' },
      { type: 'feat', text: '新增 /admin/dev-ledger 评审台账 Tab 合并页：评审变更列表/变更时间线两 Tab，?tab= 深链；两组件接 embedded prop 隐藏重复页头；旧后台路由重定向到合并页对应 tab' },
      { type: 'docs', text: 'AGENTS.md 与权限矩阵更新台账入口说明（悬浮按钮 + 合并页，不进业务主导航）' }
    ]
  },
  {
    version: '0.8.0',
    date: '2026-07-18',
    title: '开发台账移出业务主导航',
    changes: [
      { type: 'remove', text: 'common 菜单组移除「评审变更列表」「变更时间线」两个开发阶段台账入口（招标人 8、代理 7、投标人 5、专家 5、监督 6 项）；路由与权限保留，URL 直达供开发/评审使用' },
      { type: 'fix', text: 'AGENTS.md 修正「变更时间线全角色菜单可见」的错误规则：开发台账不进业务主导航；permissions.js 注释更正；role-permission-matrix.md 新增第七节导航归属说明' }
    ]
  },
  {
    version: '0.7.0',
    date: '2026-07-18',
    title: '交互重构：监督视图项目化与异常落库',
    changes: [
      { type: 'feat', text: '监督大厅项目化：无 projectId 渲染「今日开标/评标场次」列表（projectStore 真实项目，列示项目名称/编号/开标时间/评标截止时间/状态，操作列「进入监督」携带 projectId，空时 Empty）；携带 projectId 进入项目监督视图，头部展示项目名/编号与只读标识，开/评标 Tab 与底部监督专属操作卡片外壳保留' },
      { type: 'fix', text: '监督视图三数据区接真实数据源：唱标结果读 quoteStore（按 projectId 前缀匹配）、评标委员会读 expertStore 抽取结果、评分汇总读 evaluationStore 实时汇总（含各专家提交状态）；签到无真实数据源；四区无真实数据一律 Empty，删除全部硬编码 mock 数组（openingAttendees/openingBids/evaluationExperts/evaluationScores）' },
      { type: 'fix', text: '异常与意见落库：新建 supervisorStore（localStorage key bidding-supervisor-records）；监督大厅「记录异常」「提交监督意见」关联当前 projectId+项目名写入（source hall）并提示可在「异常登记」查看；异常登记页 records 从组件 useState 迁移到同 store（source abnormal），原演示记录 YC20260708001 作种子首次写入，支持 URL projectId 预填项目名，登记后刷新持久可见' },
      { type: 'fix', text: '工作台监督概览三项计数接真实数据：今日开标=projectStore 中 openTime 为当日的项目数，今日评标=evaluationStore 有评标截止时间的项目数，异常预警=supervisorStore 待处理记录数；其他角色工作台分支零改动' },
      { type: 'docs', text: '权限矩阵文档（docs/role-permission-matrix.md）2.5 监督人员一节更新为已实施状态（菜单 4 项不变），并记录 ProjectTrack supervisor 分支权限拦截现状' }
    ]
  },
  {
    version: '0.6.0',
    date: '2026-07-18',
    title: '交互重构：评标专家双任务入口合并',
    changes: [
      { type: 'remove', text: '评标专家顶层菜单移除「评标任务」项，「我的任务」更名「我的评标任务」（/admin/expert-project 路由与权限保留，作为评分详情页从任务列表携带 projectId 进入）；主导航为工作台、待办中心、评审变更列表、变更时间线、我的评标任务、专家信息、消息中心（顶层 7 项）' },
      { type: 'fix', text: 'ExpertProject 无 projectId 空载进入时重定向到 /admin/expert-tasks（真实邀请任务列表），删除页面内硬编码 mock 的 ProjectTaskList 组件与 evaluationProjects 常量；PROJECT_INFO 项目名/编号兜底映射保留（评分详情头部/签到/报告展示依赖），详情页「返回列表」改跳任务列表' },
      { type: 'fix', text: '工作台专家分支「开始评标」（任务表操作列）与「进入评标大厅」（卡片右上角）按钮目标从 /admin/expert-project 对齐为 /admin/expert-tasks' },
      { type: 'fix', text: '4 处 Drawer 弃用 width 改为 size（评分页资料侧栏 640、采购需求 560、审批中心 640、审批流配置 520；antd 6 size 支持数值等宽，消除控制台警告）' },
      { type: 'docs', text: '权限矩阵文档（docs/role-permission-matrix.md）2.4 评标专家一节更新为已实施状态' }
    ]
  },
  {
    version: '0.5.0',
    date: '2026-07-18',
    title: '交互重构：投标人操作全收项目中心',
    changes: [
      { type: 'remove', text: '投标人顶层菜单移除 3 个阶段操作项：在线报价、开标大厅、中标通知（路由与权限保留，统一从项目中心携带 projectId 进入）；主导航精简为工作台、待办中心、评审变更列表、变更时间线、项目中心、企业档案、消息中心（顶层 7 项）' },
      { type: 'fix', text: '在线报价（BidQuote）去除页面内项目选择门槛：删除 chosenProjectId、项目选择器 UI 与 quotableProjects 硬编码 mock seeds；无 URL projectId 时渲染 ProjectEntryGuard 阻断并引导返回项目中心（位于所有 hooks 之后）；报价字段模板驱动、保存报价、跳转上传标书（携带 projectId）行为不变' },
      { type: 'feat', text: 'ProjectEntryGuard 支持角色化返回：新增可选 props backTo（默认 /admin/projects）与 backLabel（默认「返回项目列表」），默认行为对招标方/代理/专家既有 6 个阶段页面不变，投标人场景传「返回项目中心」' },
      { type: 'fix', text: '在线报价保存由纯 message 提示改为真实写入 quoteStore（localStorage key bidding-quotes，按 projectId::供应商 存 quote/items/savedAt），再次进入按当前项目+供应商回显已保存报价与分项价格' },
      { type: 'fix', text: '投标回执 Modal 弃用 maskClosable 改为 mask={{ closable: false }}（antd 6 API 迁移，消除控制台警告）' },
      { type: 'docs', text: '权限矩阵文档（docs/role-permission-matrix.md）2.3 投标人一节更新为已实施状态' }
    ]
  },
  {
    version: '0.4.0',
    date: '2026-07-18',
    title: '交互重构：招标代理驾驶舱角色分发与菜单聚合',
    changes: [
      { type: 'feat', text: '新增 getAgentActions 代理动作集：按项目状态分发代理职责动作（编制招标文件/发布公告/供应商授权/开标大厅/专家抽取/评标大厅/提交定标审批/发中标通知书），邀请询比价项目跳过开评标直达定标审批' },
      { type: 'feat', text: '项目驾驶舱「当前阶段操作」按角色分发：代理渲染代理动作集、招标人渲染招标人动作集，投标人等其他角色不再渲染招标方操作卡片；项目列表「下一步」对代理适配（草稿→招标文件、评标完成→定标审批），操作列编辑按钮限招标人' },
      { type: 'remove', text: '招标代理顶层菜单移除 4 个阶段操作项：招标文件编制、公告发布、专家抽取、中标通知书（路由与权限保留，全部从项目驾驶舱携带 projectId 进入）' },
      { type: 'feat', text: '招标代理菜单聚合为：工作台、待办中心、委托项目（项目列表/项目跟踪）、业务台账（公告列表/供应商授权/费用台账）、审批中心、采购数据分析、消息中心（顶层 9 项）' },
      { type: 'fix', text: '专家抽取补 ProjectEntryGuard：无 projectId 空载进入时阻断并引导返回项目列表，移除默认选中第一个项目的兜底逻辑' },
      { type: 'fix', text: '阶段页面守卫 hooks 顺序修复（专家抽取/开标大厅/评标大厅/定标确认/中标通知书/公告发布 6 页）：ProjectEntryGuard early return 原位于组件 hooks 之前，同路由「无 projectId → 有 projectId」导航时 hooks 数量变化导致 React 崩溃（Rendered more hooks）；guard 统一移至所有 hooks 之后，Playwright 实测 6 页面导航全部通过' },
      { type: 'fix', text: '专家抽取页 useState 不随 URL projectId 重算：同路由无参→有参切换时抽取结果错存到 undefined 键，新增 useEffect 同步 query→state；另将项目创建页「万元」与数据分析页「%」的弃用 addonAfter 改为 suffix（消除 antd 6 控制台警告，保持 Form.Item id 注入不变）' },
      { type: 'docs', text: '权限矩阵文档（docs/role-permission-matrix.md）2.2 招标代理一节更新为已实施状态' }
    ]
  },
  {
    version: '0.3.0',
    date: '2026-07-18',
    title: '招标人交互提案验收收尾',
    changes: [
      { type: 'fix', text: '项目驾驶舱「当前阶段操作」补齐邀请询比价口径：registering/pending_open/evaluating 状态下不再给出开标/评标入口，直达定标（确认采购结果），与项目列表下一步口径一致；项目跟踪「当前状态与下一步」同步生效' },
      { type: 'docs', text: 'refactor-tenderee-interaction-20260717 提案 6 项任务复核验收：菜单精简、驾驶舱、列表操作列、跟踪角色过滤、6 个阶段页 projectId 守卫均通过，tasks.json 回填并出具验证报告' }
    ]
  },
  {
    version: '0.2.0',
    date: '2026-07-18',
    title: '交互重构第一期：管理员工作台合并与菜单分组',
    changes: [
      { type: 'remove', text: '管理员空壳工作台下线：原工作台仅有"前往管理控制台"跳转按钮，不再作为独立页面' },
      { type: 'feat', text: '管理员工作台与管理控制台合并为单一入口，落地路径 /admin/dashboard；旧路由 /admin/admin-dashboard 自动重定向' },
      { type: 'feat', text: '管理员菜单按业务域聚合为 9 项：工作台、待办中心、组织与用户（用户权限/组织机构/子账号管理）、系统配置（系统设置/参数字典/通知管理/模板管理/审批流配置）、内容管理（新闻公告维护）、准入审核、日志审计、采购数据分析、消息中心' },
      { type: 'fix', text: '管理员菜单移除错位的"采购需求"（招标人业务），权限同步回收；审批流配置补挂 admin 权限' },
      { type: 'docs', text: '权限矩阵文档（docs/role-permission-matrix.md）2.6 管理员一节更新为已实施状态' }
    ]
  },
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
