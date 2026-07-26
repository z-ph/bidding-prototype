// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
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
    version: '0.12.7',
    date: '2026-07-26',
    title: '敏感词残留二轮清洗（公开/招标/投标等字眼全禁）',
    changes: [
      { type: 'fix', text: '采购方式「公开询比」→「阳光询比」（与「阳光采购」同族口径）：ProjectCreate / ProjectList / TenderDoc / ProjectDetail / BidderProjects / SupplierAuthorization / AdminDictionary 标签，及 OpeningHall / ComparisonHall / ProjectTrack / projects.js / quoteStore.js 相关文案共 15 处' },
      { type: 'fix', text: '「公开×」文案清理：公开唱价并公示报价→集中唱价并公示报价、唱价阶段「公开报价/公开响应报价」→「公布报价」、公开项目/非公开项目→开放项目/邀请类项目（BidDownload / BidderProjects / SupplierAuthorization）、采购意向公开→采购意向公示（portalStore）' },
      { type: 'fix', text: '标族复合词清理：BidUpload 必传文件类型 商务标/技术标/报价标→商务文件/技术文件/报价文件，tenderDocStore 评分项与 EvaluationHall 评分类 商务标/技术标/价格标→商务/技术/价格，BidQuote 询比价→询比，BidUpload 提示「当前为招标项目」→「当前为采购项目」，AdminDashboard 疑似串标预警→疑似串通报价预警，permissions 状态色板 已废标→已作废 / 已流标→已终止' },
      { type: 'docs', text: '新增 scripts/p0-rename-pass4.mjs 一轮替换 21 文件 57 处；注释中「公开（路由）」语义改「免登录」5 处；ReviewChangeList / changelog 历史条目保留原文（用户 2026-07-26 确认，沿用 0724-001 口径）；grep 全库复核产品代码零残留' }
    ]
  },
  {
    version: '0.12.6',
    date: '2026-07-26',
    title: '专家不签到 + 名单开评前保密 + 唱价签章确认与导出',
    changes: [
      { type: 'remove', text: '评审流程删除签到环节：ExpertProject 由 6 步改为 5 步（回避声明 → 推选组长 → 查阅资料 → 在线评分 → 电子签名），删除签到步骤页与评标委员会「签到状态」列；EvaluationHall 删除「签到表」导出按钮' },
      { type: 'feat', text: '专家名单开评前保密：SupervisorHall 评审监督 Tab 在项目进入评审中（evaluating）前显示保密占位，不展示评审委员会名单与评分汇总；OpeningHall 签到表本就不含专家（yy0-006 口径），expert-extraction 权限仅采购单位/代理/管理员' },
      { type: 'feat', text: '唱价结束后投标人二次确认：OpeningHall 唱价公示阶段「确认唱价内容」改为签字/盖章确认 Modal（电子签章确认 / 签名确认二选一，签名需输入姓名），确认后展示存证信息（方式/确认人/时间）并记入操作记录' },
      { type: 'feat', text: '唱价一览表真实导出：新增 utils/exportCsv.js（带 BOM，Excel 不乱码），唱价公示与开启结束两阶段均可导出 CSV（序号/响应单位/报价/交货期/质保期），全角色通用' }
    ]
  },
  {
    version: '0.12.5',
    date: '2026-07-26',
    title: '去除「专家签到」字眼',
    changes: [
      { type: 'fix', text: 'OpeningHall 身份核验步骤描述「采购单位/响应单位/专家签到」→「采购单位/响应单位签到」，补齐 yy0-006 残留（签到表本就无专家列）' },
      { type: 'fix', text: 'ExpertProject 评审步骤「专家签到」统一为「签到」（Steps/按钮/标题/tip/流程说明 5 处）；EvaluationHall 导出按钮「专家签到表」→「签到表」' }
    ]
  },
  {
    version: '0.12.4',
    date: '2026-07-26',
    title: 'CA 全线下线：登录/驱动/沙箱设置清除，加解密统一密码加密',
    changes: [
      { type: 'remove', text: '登录页删除 CA 登录 tab（含证书检测、CA 驱动/证书申请入口、引导 tour CA 步骤），保留账号密码 + 手机验证码两种方式' },
      { type: 'remove', text: '门户清除 CA 内容：下载中心 CA 驱动、轮播图「安全合规的CA认证」、新闻「CA数字证书办理指南」、帮助中心两条 CA 常见问题' },
      { type: 'remove', text: '系统设置删除「CA 沙箱模式」开关（含 caSandbox 配置项）' },
      { type: 'fix', text: 'BidUpload 加密方式固定为密码加密：删除 CA 证书加密选项与 CA 状态检测块，签章/加密/重新签章/重新加密动作链保留，正式提交门槛改为全部文件已加密' },
      { type: 'fix', text: 'OpeningHall 文件解密阶段保留，CA 私钥解密改为上传时设置的解密密码；ExpertProject/监督日志/异常种子同步去 CA 表述' }
    ]
  },
  {
    version: '0.12.3',
    date: '2026-07-26',
    title: '引入 TypeScript（渐进迁移）+ typecheck 并入 build 门禁',
    changes: [
      { type: 'feat', text: '引入 TypeScript 7.0.2：新增 tsconfig.json（strict + allowJs/checkJs），pnpm run typecheck（tsc --noEmit）并入 pnpm run build 门禁，未定义变量等错误构建期拦截' },
      { type: 'feat', text: '渐进迁移基线：存量 223 个 .js/.jsx 批量打 // @ts-nocheck 基线（含解冻指引注释），新文件一律 .ts/.tsx 严格模式，改动哪个文件解冻哪个' },
      { type: 'docs', text: 'AGENTS.md 技术栈口径更新：废止「JavaScript（不引入 TypeScript）」，改为 TypeScript 优先 + 解冻规则' }
    ]
  },
  {
    version: '0.12.2',
    date: '2026-07-26',
    title: 'BidQuote 运行时崩溃修复（isInquiryMode/quoteLocked 未定义）',
    changes: [
      { type: 'fix', text: 'BidQuote 恢复 b2d2e49 重构丢失的 isInquiryMode/quoteLocked 定义：isInquiryMode 改用 isInquiryFamily(project) 现行口径（询比族 inquiry/invitation_inquiry），quoteLocked 为询比族且状态 registering（公告中未开启）时锁定；修复前该页一打开即 ReferenceError 白屏' }
    ]
  },
  {
    version: '0.12.1',
    date: '2026-07-25',
    title: '首页轮播管理 + ISO证书用词 + 阳光采购 + 质量门',
    changes: [
      { type: 'feat', text: '首页轮播管理（AdminBanners）：8个预设主题 Radio.Button 一键选择 + ColorPicker 双色自定义 + Upload 图片上传，portalStore 同源驱动 Portal 首页 Carousel' },
      { type: 'fix', text: '资质认证用词：ISO9001/ISO27001认证 → ISO9001/ISO27001认证或相关证书（Register/ProjectCreate/ProjectDetail/projects.js/SupplierProfile 5 处同步）' },
      { type: 'fix', text: 'SupplierLedger 关联项目名优先从 projectStore.getProjectById() 解析，写死常量仅作兜底，消除数据源不一致隐患' },
      { type: 'fix', text: '公开采购 → 阳光采购（甲方要求，p0-rename.mjs 同步更新）' },
      { type: 'docs', text: '新增 subagent-quality-gate skill（AI专属设计验收） + scripts/quality-gate.mjs（机械验证脚本），npm run quality-gate 一键执行' },
      { type: 'fix', text: 'AdminBanners 背景图片从 URL 文本输入改为 Upload 图片上传（picture-card 模式）' }
    ]
  },
  {
    version: '0.12.0',
    date: '2026-07-24',
    title: 'P1/P2 需求实施：验证码防护、供应商台账、全过程监督、IP 预警、内容管理、流程优化',
    changes: [
      { type: 'feat', text: '登录/注册图形验证码：手机验证码发送前先弹 Canvas 数学验证码（a+b=?），防机器刷码；注册页新增短信验证码字段与获取按钮（演示环境验证码仍为 123456）' },
      { type: 'feat', text: '供应商台账（SupplierLedger）：采购单位/代理可查看供应商列表与详情，管理员可审核认证状态并编辑信息；数据源 supplierStore，localStorage 持久化' },
      { type: 'feat', text: '监督大厅全过程覆盖：新增采购准备、响应监督、成交确认三个 Tab，5 Tab 覆盖采购→响应→开启→评审→成交确认全流程；各 Tab 均无假数据（数据不足时 Empty）' },
      { type: 'feat', text: 'IP 记录与风险预警：analyticsStore 新增 sameIpResponse 预警规则，种子 IP 数据模拟两家供应商使用相同 IP，预警自动生成；管理员/监督操作日志补充 IP 演示提示' },
      { type: 'feat', text: '内容管理发布：新增 AdminDownloads（下载中心管理）、AdminHelp（帮助中心管理）两页面，支持 CRUD + 发布/下线；portalStore 扩展 banners/helpDocs 接口；首页轮播图从 store 加载' },
      { type: 'feat', text: '流程/交互优化：BidQuote 默认关闭分项报价（仅总报价+文件上传）；BidUpload 按项目类型区分响应文件组成（询比族去重）；OpeningHall 专家门禁+bider 唱价确认+导出唱价一览表；EvaluationHall 导出报表组（6 项模拟导出）；专家品目分类多选过滤+档案品目字段；供应商注册新增供应商类型选择' }
    ]
  },
  {
    version: '0.11.0',
    date: '2026-07-24',
    title: 'P0 全局用词整改：招标系统→内部采购平台',
    changes: [
      { type: 'fix', text: 'P0 全局用词整改（采购平台DEMO反馈整理.md 第一节）：全站 74 个文件、~430 处文案替换，消除「招标/投标/中标/开标/评标/定标/唱标」等审计敏感词，遵循映射表（招标→采购、投标→响应、中标→中选、开标→开启、评标/评标专家→评审/评审专家、定标→成交确认、唱标→唱价、招标人→采购单位、投标人→响应单位、招标代理→采购代理、招标文件→采购文件、投标文件→响应文件、中标通知书→中选通知书、标段→采购包、标书→采购文件、发标→发布采购等），changelog/ReviewChangeList 历史条目保留原样' },
      { type: 'docs', text: '提案 p0-terminology-rename-20260724：全站用词整改脚本 p0-rename.mjs，经三轮逐步替换 + 构建验证 + Playwright 页面抽查（门户/登录/工作台）无残留禁用词；index.html 标题同步为「采购平台」' }
    ]
  },
  {
    version: '0.10.1',
    date: '2026-07-22',
    title: '开标大厅解密阻断演示绕过',
    changes: [
      { type: 'fix', text: '开标大厅阶段3（文件解密）按钮不再 disabled 硬阻断：未全部解密时点击弹出 Modal.confirm 列出未解密投标人（A/B/C）并提供「强制进入唱标」按钮（标注演示模式），与阶段1签到跳过 enterOpening 同模式，避免演示/测试卡死在解密环节' }
    ]
  },
  {
    version: '0.10.0',
    date: '2026-07-21',
    title: '大厅归属重定义 + 定标步骤修复 + 代理项目/需求管理',
    changes: [
      { type: 'feat', text: '新增比价大厅（/admin/comparison-hall）：询比族项目（公开询比价/邀请询比价）的大厅，报价汇总→报价比较→比价完成三段，数据源 quoteStore（预置项目 6/10 报价种子），招标人/代理可操作、投标人只读本人报价、监督只读；比价完成携带 projectId 进入评标大厅' },
      { type: 'feat', text: '大厅归属新口径（废止清单 20）：开标大厅收窄为招标族（公开招标/邀请招标），询比族进入开标大厅引导至比价大厅、招标族进入比价大厅反向引导；评标大厅移除邀请询比价门禁，对所有项目开放；FLOW_NODES 新增「线上比价」节点，流程映射改招标族/询比族两模板' },
      { type: 'feat', text: '导航入口按族分流：projectFlow 两动作集删除邀请询比价直达定标分支（registering/pending_open 按族跳开标或比价大厅）、ProjectList 下一步、工作台继续项目与快捷入口（新增比价大厅卡片）、待办中心项目待办、投标人项目中心按钮、项目跟踪投标人时间线' },
      { type: 'fix', text: '定标步骤回退第一步修复：抽取共享 utils/awardFlow.js（resolveAwardStage/阶段常量），确认中标人页与中标通知书页统一引用，消除两页面重复实现漂移（项目 6 原为第 3 步→通知书页第 1 步，现两页一致）；顺带修复 AwardNotice 三处复制粘贴残留（警示条件反了、重复条件、disabled 表达式），三态（未确认/已确认未发/已发送）展示正确' },
      { type: 'feat', text: '招标代理接入项目管理与采购需求（部分推翻 zip-014）：代理菜单「委托项目」组新增「创建项目」、新增「采购需求库」入口；permissions 放开 projects/create 与 procurement-requirements* 对 agent 的访问；项目列表创建按钮对代理渲染；创建项目页代理角色默认「委托代理」组织方式。未放开：编辑/发标权限、受托项目数据范围（列为后续）' },
      { type: 'docs', text: '种子数据新增项目 10（办公设备询价采购，公开询比价、待开标）；权限矩阵文档更新代理章节与比价大厅行；三份提案（spec/changes/2026-07-21-*）状态置已完成。Playwright 实测：比价大厅三段与进评标、双向门禁、招标族正常开标、定标两页步骤一致、代理菜单/创建/需求库全部通过' }
    ]
  },
  {
    version: '0.9.3',
    date: '2026-07-21',
    title: '0721 需求三项提案登记（待确认后实施）',
    changes: [
      { type: 'docs', text: '提案 hall-purchase-method-mapping-20260721：大厅与采购方式归属重定义——开标大厅收窄为招标族（公开招标/邀请招标），新增「比价大厅」服务询比族（公开询比价/邀请询比价），评标大厅对所有项目开放；含流程节点两族化、导航入口分流、权限/种子配套。废止清单 20 旧口径。代码未实施，待比价大厅环节构成等 5 项确认' },
      { type: 'docs', text: '提案 fix-award-step-regression-20260721：修复「前往定标第三步、确认中标人后页面回到第一步」——根因为 AwardConfirm/AwardNotice 两页面 resolveAwardStage 重复实现且漂移（通知书页缺邀请询比价分支→evaluating→第 1 步）；方案为抽取共享 awardFlow.js 统一口径并修复 AwardNotice 三处展示条件残留。代码未实施，待确认后实施' },
      { type: 'docs', text: '提案 agent-project-requirement-management-20260721：招标代理接入采购需求管理与项目管理（含创建项目）——代理菜单补「创建项目」「采购需求库」，permissions 三路径放开 agent，ProjectList 创建按钮对代理渲染；页面本身已代理就绪。部分推翻 zip-014 口径。代码未实施，待编辑/发标权限等 4 项确认' },
      { type: 'docs', text: '三份提案落于 spec/changes/（各含 proposal.md + tasks.json）；评审变更列表登记 0721-001~003（状态：待确认）。本次仅提案与台账登记，无业务代码变更，版本号递增以区分评审基线' }
    ]
  },
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
