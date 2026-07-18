# Agent 实施规则

本仓库使用多个 worker agent 并行开发。为避免 2026-07-14 批次出现的“build 通过但业务没对”“共享文件冲突”“agent 自报告不可信”等问题，制定以下规则。

## 1. 并行 agent 必须按文件所有权拆分

- **不允许**两个 agent 同时修改同一个 `.jsx/.js` 文件。
- 若多个任务必须修改同一文件（如 `Layout.jsx`、`router/index.jsx`、`permissions.js`），这些修改统一交给一个**基础设施 agent**在最后执行。
- 每个 agent 的 prompt 必须明确列出：允许修改的文件、禁止修改的文件、需要创建的测试/验证步骤。

## 2. Agent 自报告不可作为验收依据

- agent 完成时通常会写“build passed”。这只能说明没有语法错误，**不能**说明业务正确。
- 父 agent（协调者）必须在 agent 完成后，按 `docs/需求与评审意见-最终口径.md` 的当前口径与 `src/views/ReviewChangeList.jsx` 台账逐条复核。
- 处理评审反馈/需求变更时，必须按 `AGENTS.md` 中的「评审/反馈处理的三层推导法」进行：先确认需求变更，再推导工作流变化，最后才决定页面/交互调整。**禁止拿到反馈就直接改页面。**
- 复核方式优先级：
  1. 运行 dev server + Playwright 截图/录 DOM（首选）
  2. 读取关键文件并检查逻辑分支
  3. 运行现有测试用例
- 只有复核通过，才能进入下一 agent 或归档。

## 3. 有页面 ≠ 功能完成

- 不能因“这个页面存在”就认为任务完成。
- 必须以验收标准判断：
  - 正确的角色能看到/操作什么？
  - 错误的状态是否被阻断？
  - 数据前后半段是否衔接？
- 对 xlsx 中标记为“简化完成”的任务，默认视为**未完整实现**，需要补全。

## 4. 归档前必须完成可复现验证

- OpenSpec 归档（`spec/changes/{id}` → `spec/archive/`）必须在以下之后进行：
  - 所有 tasks.json 步骤 completed
  - `npm run build` 通过
  - 父 agent 给出验证报告（通过 checklist）
- 不能仅凭用户一句“做完就归档”直接归档。

## 5. 新增页面必须同步接线，且必须服从工作流设计

- agent 创建新 view 组件后，必须明确记录需要：
  - 在 `src/router/index.jsx` 注册路由
  - 在 `src/config/permissions.js` 配置权限
  - 在 `src/components/Layout.jsx` 添加/调整菜单
- **禁止把每个新功能都平铺成独立顶层菜单项**。在调整 `Layout.jsx` 前，必须先确认：
  - 这个功能属于哪个角色的哪个业务阶段？
  - 是应该独立成项，还是收进已有分组/项目详情页/工作台？
  - 是否需要更新 `docs/role-permission-matrix.md` 中的目标菜单结构？
- 若该 agent 不负责接线，必须在报告中写明“需 Agent A 补充”，并作为 infrastructure agent 的输入。

## 6. 共享状态/数据必须显式约定

- 多个 agent 可能依赖同一份 mock 数据结构（如 `portalStore.js`、`qualifications.js`）。
- 新增/修改这类文件时，必须在报告中说明 schema、存储 key、消费位置，避免其他 agent 重复或冲突。

## 7. 禁止的 git 操作

- agent **不得**执行 `git commit`、`git push`、`git merge`、`git rebase`。
- 所有 git 操作由协调者（父 agent 或用户）统一决策。

## 8. 失败处理

- 若 agent 报告 build 失败或逻辑无法闭环，不要直接跳过或让下一个 agent 代偿。
- 应让该 agent 修复，或重新派发更聚焦的子任务。

## 9. 文档同步

- 若新增/修改了项目结构、约定或数据模型，必须同步更新 `AGENTS.md` 或本文件。
- 不要把约定只留在一次性的 agent prompt 里。

## 10. 完成后必须执行 UX/Workflow 复核与红线审核

agent 自报完成不可信。父 agent 必须执行 `AGENTS.md` 中的「实施完成后必须执行的 UX/Workflow 复核清单」。

### 红线审核（强制）

以下红线任一项不通过，**任务不算完成，必须打回修复**：

1. 不存在空壳工作台或纯跳转按钮页面。
2. 同一角色不存在名称不同但职责重叠的两个入口。
3. 阶段页面必须强制带 `projectId`，无 `projectId` 时重定向到项目列表。
4. 左侧菜单按业务域聚合，不为每个功能单独开顶层菜单项。
5. 已砍掉/未实现的功能不出现在主导航。
6. 共享文件（`Layout.jsx`、权限表、路由）不是 append-only 改动。
7. 新增页面/菜单项能从需求工作流正向推导。

红线不通过时，必须在 `src/views/ReviewChangeList.jsx` 登记问题，状态保持“未修复”。

### 一般复核

- 菜单按业务域分组，没有功能平铺。
- 阶段页面必须从项目上下文带着 `projectId` 进入。
- 操作按钮与当前角色 + 项目状态匹配。
- 至少录制一条真实端到端 Playwright trace，使用 localStorage 模拟数据增删查改。

未通过本复核，不得视为任务完成，也不得归档 OpenSpec。
