# Proposal: 招标代理接入采购需求管理与项目管理（含创建项目）

## Change ID

`agent-project-requirement-management-20260721`

## Why

**需求**：招标代理也要能够采购需求的管理和项目的管理，包括创建项目。

**现状**（代码证据）——代理被排除在两块业务之外：

- **菜单**：`Layout.jsx:91-114` 代理菜单「委托项目」组只有项目列表/项目跟踪，**无「创建项目」**；且**无「采购需求库」入口**（招标人菜单 `Layout.jsx:53-86` 两者皆有）。
- **路由权限**：`permissions.js` 中 `'/admin/projects/create': ['tenderee']`、`'/admin/procurement-requirements': ['tenderee']`、`'/admin/procurement-requirements/edit': ['tenderee']`——即便菜单放开，代理也会被 `/admin` 布局守卫拦到 Forbidden。
- **页面内门控**：`ProjectList.jsx:424` 「创建项目」按钮仅 `role === 'tenderee'` 渲染；第 209-211 行注释"代理无项目创建/编辑权限（zip-014）"，草稿项目下一步对代理硬编码为「编制文件」。
- **页面本身已代理就绪**（无需改造即可用）：
  - `ProjectCreate.jsx` 无角色门控，组织方式可选 `self`/`agent`，且内置代理机构候选（第 51-53 行）；
  - `ProcurementRequirementList.jsx:63` 已有 `publisherKind = role === 'agent' ? 'agent' : 'self'` 分支，「新建需求」按钮（第 279 行）无角色限制，代理审批链口径（`approvalStore.DEFAULT_CHAINS.agent = ['采购管理部']`）已存在。

**口径沿革**：zip-014（0718 交互重构）曾刻意移除代理的项目创建/编辑权限，本需求推翻其中「创建」部分；「编辑/发标」是否一并放开待确认。

## What Changes

1. **代理菜单补齐**：`Layout.jsx` agentMenus「委托项目」组新增「创建项目」（`/admin/projects/create`）；新增顶层「采购需求库」（`/admin/procurement-requirements`），与招标人同构。分组名是否改为「项目管理」待确认。
2. **路由权限放开**：`permissions.js` 三个路径追加 `'agent'`：`/admin/projects/create`、`/admin/procurement-requirements`、`/admin/procurement-requirements/edit`。
3. **项目列表门控放开**：`ProjectList.jsx`「创建项目」按钮对代理渲染（`['tenderee','agent'].includes(role)`）；空态引导文案对代理同步；zip-014 注释更新为新口径。草稿项目下一步对代理保持「编制文件」还是改为「继续编辑」待确认（默认保持现状，仅放开创建）。
4. **（可选，待确认）代理创建默认值**：`ProjectCreate.jsx` 对代理角色默认 `orgMode: 'agent'` 并预填本代理机构，减少手工选择。
5. **文档台账**：`docs/role-permission-matrix.md` 代理章节更新（菜单项 + 权限矩阵）；`ReviewChangeList.jsx` 登记并注明 zip-014 口径变更。

## Impact

- **修改文件**：`src/components/Layout.jsx`、`src/config/permissions.js`、`src/views/ProjectList.jsx`、（可选）`src/views/ProjectCreate.jsx`、`docs/role-permission-matrix.md`。
- **文档台账**：`src/views/ReviewChangeList.jsx`（0721-003）、`src/data/changelog.js`、`package.json` version。

## Out of Scope

- 代理「编辑」「发标」草稿项目的权限——待确认，默认不放开。
- 代理项目列表的数据范围过滤（仅显示受托项目 `agentId` 匹配）——当前 dataScope 机制无"受托"维度，列为后续扩展项。
- 采购需求页面内部逻辑——已代理就绪，不改。

## 待确认事项（实施前需人类拍板）

1. **编辑/发标权限**：代理对草稿项目是否同时获得「编辑」「发标」操作？（需求原文仅明确"包括创建项目"）
2. **菜单分组命名**：代理「委托项目」组加入创建项目后是否更名「项目管理」？（代理创建的项目默认 orgMode=agent，是否仍称"委托项目"需定夺）
3. **数据范围**：代理项目列表是否仅展示其受托项目？（当前为全量，与招标人同视图）
4. **创建默认值**：代理进入创建项目页是否默认"委托代理"组织方式并预填代理机构？

## 依赖

- `docs/role-permission-matrix.md`：代理权限矩阵现状与目标。
- 0718 交互重构 zip-014 条目（`ReviewChangeList.jsx` 0718-ux-003/004）：被本提案部分推翻的旧口径出处。

## 状态

- 总体状态：**已完成**（2026-07-21 实施并 Playwright 实测；默认口径：仅放开创建权限，编辑/发标不放开，组名保留「委托项目」，数据范围不变，代理创建默认委托代理）
