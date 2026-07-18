# Agent 协作指南

本仓库使用 subagent 串行开发前端原型。任何涉及批量任务、页面评审整改或 OpenSpec 提案实施的工作，必须先读以下三处：

- `docs/需求与评审意见-最终口径.md` — 最终需求与评审意见（时间线 + 新口径优先规则；提取的需求/意见必须带时间戳，新旧矛盾以新者为准）
- `src/views/ReviewChangeList.jsx`（`/admin/review-change-list`）— 评审变更逐条台账
- `.agents/skills/workflow-first-ux-design/SKILL.md` — 工作流优先 UX 设计原则（含正反例）

不再以任何单批评审的逐条验证 checklist 作为复核依据（原 `docs/page-review-20260714-checklist.md` 已废弃删除）。工程协作细则（文件所有权、git 操作禁令、失败处理）见 `docs/agent-implementation-rules.md`。

## 关键原则

1. **build 通过 ≠ 业务正确**：agent 完成后，父 agent 必须按 checklist 逐条复核，不能只看 `npm run build`。
2. **并行必须文件隔离**：共享文件（`Layout.jsx`、`src/routes/admin.jsx`、`src/routes/__root.jsx`、`permissions.js`、自动生成的 `routeTree.gen.ts`）由基础设施 agent 最后统一接线。
3. **有页面 ≠ 完成**：必须以验收标准判断角色、状态、数据衔接是否正确。
4. **归档前先验证**：OpenSpec 归档前必须有验证报告。
5. **工作流优先，禁止平铺功能菜单**：新增功能必须以角色工作流为中心设计入口；菜单按业务域聚合，禁止把功能列表直接堆成左侧菜单；禁止为每个功能 append 一个新菜单项。
6. **共享文件禁止 append-only**：`Layout.jsx`、权限表、路由配置必须按业务域整合，不能每加一个功能就 append 一个新入口/路由/权限项。

## 工作流优先的交互设计原则

本节 6 条原则中，属于 UX/交互设计范畴的 5 条（第 1–5 条）已沉淀为 skill：`.agents/skills/workflow-first-ux-design/SKILL.md`，内含逐条正反例，红线审核与评审整改登记时可直接引用。**维护要求**：原则口径或正反例变更时，必须同步更新该 skill 与本节，保持两边一致；该 skill 只收 UX/交互设计原则，工程协作类规则（如第 6 条共享文件整合审批、版本号/changelog 维护）不进 skill，仅保留在本文档。

### 1. 正向推导：需求 → 工作流 → 页面/菜单

**必须**按以下顺序设计：

1. **需求**：该角色在这个业务里必须完成什么任务？
2. **工作流**：这些任务的先后顺序、分支条件、输入输出是什么？
3. **页面/菜单**：工作流需要哪些页面承载，才设计哪些页面；需要哪些入口，才放哪些菜单项。

**禁止反向推导**：不允许拿着现有页面反推一个工作流来解释它，也不允许为了“已经有这个页面”就在菜单里硬塞一个入口。如果某个页面无法对应到需求工作流中的明确步骤，这个页面就应该被合并、重定向或删除。

agent 在写代码前必须先确认：

- 这个功能来自哪条需求？属于哪个角色的哪个业务阶段？
- 该角色完成这项任务的典型路径是什么？上一步从哪来，下一步到哪去？
- **工作流是否真的需要一个新的页面/菜单项？** 现有页面里有没有可以承载这个功能的？
- 这个功能应该作为独立菜单项，还是收进已有分组/项目详情页/工作台？
- 是否需要更新 `docs/role-permission-matrix.md` 中的目标菜单结构？

如果答不上来，先找父 agent 或协调者对齐，不要直接开页面。

#### 评审/反馈处理的三层推导法

每次收到新的评审意见、测试反馈或需求口径变更时，agent 必须按以下三层顺序推导，**禁止直接跳到“改页面”**：

1. **需求层**：是否为需求变更？如何变更？是否导致旧需求作废？
2. **工作流层**：是否改变工作流？步骤顺序、分支、角色衔接是否变化？
3. **页面/交互层**：工作流变化后，需要新增、删除、合并哪些页面/菜单？

**只有确认是第 3 层问题，才直接改页面。**

### 2. 项目是一切业务的上下文

阶段页面（招标文件、开标大厅、评标大厅、定标、通知书等）必须从项目跟踪/项目列表带着 `projectId` 进入，**禁止空载进入**。无 `projectId` 时应 redirect 到对应角色的项目列表。

### 3. 菜单按工作流聚合，禁止平铺

左侧菜单只保留聚合入口，阶段操作和后台功能按业务域分组。禁止：

- 为每个新功能都在 `Layout.jsx` 新增独立顶层菜单项。
- 把“能访问的页面”和“应该出现在主导航的入口”混为一谈。
- 出现“空壳工作台”或纯跳转按钮页面。
- 同一角色存在名称不同但职责重叠的入口（如“工作台”与“管理控制台”并列）。

当前各角色目标菜单结构以 `docs/role-permission-matrix.md` 为准。任何改动必须同步更新该文档，并说明：新增、删除、合并、重命名。

参考分组（以管理员为例）：工作台/待办中心、组织与用户、系统配置、内容管理、准入审核、日志审计、采购数据分析、消息中心。

### 4. 操作由角色 + 状态驱动

页面上的按钮由当前角色和项目/业务状态共同决定。不同角色、不同状态看到不同操作，避免招标人看到“上传投标文件”这类不属于他的动作。

### 5. 已砍掉/未实现的功能不出现在主导航

一期已砍掉或仅预留接口的功能（费用、报名、异议、合同归档、发票等），不得出现在左侧主导航，避免干扰用户。

### 6. 共享文件变更需整合审批

`src/components/Layout.jsx`、`src/config/permissions.js`、`src/routes/` 下文件属于共享文件。修改前必须：

1. 在 `docs/role-permission-matrix.md` 中写明目标菜单结构变化。
2. 得到父 agent 或协调者确认。
3. 由基础设施 agent 统一合并，禁止多个功能 agent 各自往里面 append。

## 项目结构约定

- `spec/changes/` — 进行中的 OpenSpec 提案
- `spec/archive/` — 已归档提案
- `spec/specs/` — living specifications
- `docs/` — 需求/评审口径文档与协作规则（最终口径见 `docs/需求与评审意见-最终口径.md`）
- `review-inputs/` — 用户放入根目录的评审文件（zip/md 等），agent 提案并实施完成后统一归纳到此目录；该目录已在 `.gitignore` 中，不进入版本库

## 技术栈

- React 19 + TanStack Router（文件路由） + Ant Design 6
- Vite 构建
- JavaScript（不引入 TypeScript）
- Mock 数据优先，外部服务（短信、CA）只做沙箱/预留接口

## 版本信息维护

页面评审导出报告会通过 `src/App.jsx` 的 `reportInfo` 自动注入 `package.json` 的 `name`/`version`，同时 `src/components/VersionWatermark.jsx` 会把 `version` 以水印形式平铺显示在所有页面上，两者都用于把评审反馈/截图对应到具体版本。每次完成一轮实质变更（评审整改、功能交付、对外演示前）都必须递增 `package.json` 的 `version`——不能让版本号停留在旧值，否则导出的评审报告和页面水印都无法区分是哪一版代码。

递增 `version` 时必须同步在 `src/data/changelog.js` 顶部新增对应条目（版本号、日期、变更明细），变更时间线页面（`/admin/changelog`）按该数据自动渲染。

## 评审变更列表与变更时间线维护

这两个页面是**开发阶段的台账产物**（供开发/评审追溯，非业务功能）：**不得加入任何业务角色的主导航**。统一入口为全局悬浮按钮（右下角圆形按钮，可拖拽移动、位置持久化，所有页面可见），点击打开 `/admin/dev-ledger`（Tab 切换评审变更列表/变更时间线，`?tab=review|changelog` 深链）；旧后台路由 `/admin/review-change-list`、`/admin/changelog` 已重定向到合并页。任何评审整改、口径变更、版本交付都要同步登记，不允许只改代码不登记。

### 评审变更列表（`/admin/review-change-list`）

- 数据在 `src/views/ReviewChangeList.jsx` 顶部的 `reviewData` 数组，新批次条目加在数组最前。
- 字段：`id`（来源前缀 + 序号，如 `0717-rm-001`）、`source`、`module`、`page`、`severity`、`issue`、`status`、`fix`、`commit`。
- 登记时机：每轮评审/测试反馈、需求口径变更都要登记；`commit` 先填 `-`，实施并提交后回填批次标签（如 `fix(p1)`、`feat(remove-deprecated)`）。
- 状态维护：`status`（未修复/已修复/无需修复/部分修复/待确认）必须经代码复核后更新，不能只凭实施方自述；被新口径作废的旧需求标 `无需修复` 并引用清单号；`待确认` 必须写清等谁确认什么。
- 历史条目不删除、不改写 `issue` 原文；纠偏只更新 `status`/`fix`/`commit`。

### 变更时间线（`/admin/changelog`）

- 数据在 `src/data/changelog.js`，视图 `src/views/Changelog.jsx`。
- 按「版本信息维护」要求：递增 `package.json` 的 `version` 时必须同步在数组顶部新增条目（版本号、日期、标题、变更明细）。
- 明细类型：`feat` 新增 / `fix` 修复 / `remove` 下线 / `docs` 文档，对应页面标签颜色；口径类下线用 `remove` 并注明清单号。

## 路由约定

本项目使用 TanStack Router 文件路由。官方文档见：

- [File-Based Routing](https://tanstack.com/router/latest/docs/guide/file-based-routing)
- [Code Splitting](https://tanstack.com/router/latest/docs/guide/code-splitting)
- [文件命名约定](https://tanstack.com/router/latest/docs/routing/file-naming-conventions)

### agent 实施时必须遵守的规范

1. **页面组件仍放在 `src/views/`，路由文件只放元数据**
   - `src/routes/<path>.jsx`：导出 `createFileRoute('/<path>')({ staticData: { title: '...' } })`。
   - `src/routes/<path>.lazy.jsx`：用 `createLazyFileRoute('/<path>')({ component: Component })` 引用 `src/views/` 的组件。
   - 禁止把完整页面组件写进 `src/routes/*.jsx`，保持 `src/views/` 为页面实现目录。

2. **新增/修改路由的文件要求**
   - 路径段用 `.` 连接，参数用 `$`，索引用 `.index`。
   - 示例：`admin.projects.detail.$id.jsx` → `/admin/projects/detail/:id`。
   - 每个路由必须提供 `staticData.title`，供 `Layout.jsx` 面包屑使用。

3. **共享路由文件不要随意改**
   - `src/routes/__root.jsx`：根布局。
   - `src/routes/admin.jsx`：`/admin` 布局路由，带 `beforeLoad` 权限校验。
   - 这些文件由基础设施 agent 统一维护；功能 agent 若需改动必须先沟通。

4. **`src/routeTree.gen.ts` 禁止手动修改**
   - 该文件由 `@tanstack/router-plugin/vite` 自动生成。
   - 如果本地缺少或看起来没更新，运行 `pnpm run build` 重新生成。

5. **不再使用 `react-router-dom` 的 API**
   - 导航：`useNavigate`、`Link`（来自 `@tanstack/react-router`）。
   - 参数：`useParams`。
   - 搜索参数：`useSearch({ strict: false })` 替代 `useSearchParams`。
   - 布局出口：`Outlet`。

6. **新增页面 checklist**
   - [ ] `src/views/` 创建组件。
   - [ ] `src/routes/` 创建 `.jsx` + `.lazy.jsx`。
   - [ ] 如需菜单，更新 `src/components/Layout.jsx` 的 `useMenuItems`。
   - [ ] 如需权限，更新 `src/config/permissions.js`。
   - [ ] `pnpm run build` 通过，且 `routeTree.gen.ts` 已自动更新。

## 实施完成后必须执行的 UX/Workflow 复核清单

每个 agent 完成代码后，父 agent 必须按以下清单复核，不能只运行 `pnpm run build`。

### 红线审核（任一项不通过，任务不算完成）

以下 7 条为硬性红线。agent 自报完成前必须先自查；父 agent 复核时若发现任一红线违规，必须打回修复，**不得归档、不得进入下一任务**。

1. **不存在空壳工作台或纯跳转按钮页面**。
2. **同一角色不存在名称不同但职责重叠的两个入口**。
3. **阶段页面必须强制带 `projectId`，无 `projectId` 时重定向到项目列表**。
4. **左侧菜单按业务域聚合，不为每个功能单独开顶层菜单项**。
5. **已砍掉/未实现的功能不出现在主导航**。
6. **共享文件（`Layout.jsx`、权限表、路由）不是 append-only 改动，而是按业务域整合后的结果**。
7. **新增页面/菜单项能从需求工作流正向推导，不存在为了解释现有页面而硬编工作流**。

红线审核不通过时，必须在 `src/views/ReviewChangeList.jsx` 登记问题，状态保持“未修复”，并明确下一步修复动作。

### 1. 正向推导

- [ ] 每个新增页面/菜单项是否都能对应到需求工作流中的明确步骤？
- [ ] 是否存在为了解释现有页面而硬编工作流的情况？
- [ ] 评审反馈是否按「需求 → 工作流 → 页面」三层推导处理，而不是直接改页面？

### 2. 项目上下文

- [ ] 阶段页面（招标文件/开标/评标/定标/通知书等）是否必须从项目跟踪/列表带着 `projectId` 进入？
- [ ] 无 `projectId` 时是否重定向到对应角色项目列表，而不是空载渲染？

### 3. 菜单聚合

- [ ] 打开 `src/components/Layout.jsx`，检查该角色菜单是否按业务域分组，没有功能平铺。
- [ ] 菜单项数量是否控制在合理范围（建议每角色主导航不超过 8–10 个顶层/分组项）。
- [ ] 是否存在仅用于跳转到另一菜单项的“空壳页面”？
- [ ] 同一角色是否存在名称不同但职责重叠的两个入口？

### 4. 状态驱动

- [ ] 页面上的操作按钮是否与当前角色 + 项目状态匹配？不会出现招标人看到“上传投标文件”这类错位？

### 5. 无残留废弃功能

- [ ] 已砍掉/未实现的功能（费用、报名、异议、合同归档、发票等）是否已从主导航移除？

### 6. 共享文件整合

- [ ] `Layout.jsx`、权限表、路由是否按业务域整合，没有 append-only 新增项？
- [ ] 菜单结构变化是否已同步更新 `docs/role-permission-matrix.md`？

### 7. 数据与状态

- [ ] 页面空数据时是否有空状态提示，而不是白屏或报错？
- [ ] 新增数据是否通过 localStorage/mock store 真实写入，而非只改本地组件状态？
- [ ] 前后页面之间的数据是否衔接（如创建项目后能在列表/跟踪页看到）？

### 8. 验证方式（至少选一种）

- [ ] 录制一条该角色的真实端到端 Playwright trace（登录 → 完成一个业务闭环 → 退出）。
- [ ] trace 必须使用 localStorage 模拟真实数据增删查改，不能只是页面跳转。
