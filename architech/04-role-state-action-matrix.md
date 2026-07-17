# 04 - 角色×状态×动作矩阵（RACI 简化版）

> 这是 P0 越权问题的直接对策。
> 现有权限模型只到「页面级」（`permissions.js` 的 PAGE_PERMISSIONS），无法表达「同一页面、不同状态、不同角色能做不同动作」。
> 本矩阵把权限下沉到 **实体×状态×动作** 粒度，是状态机的权限视图。

---

## 1. 权限模型升级

### 现状（不足）
```
canAccess(path, role)  -- 只回答「能不能进这个页面」
```

### 目标（双层）
```
canAccess(path, role)              -- 第一层：页面可见性（保留）
canAct(entity, state, action, user) -- 第二层：动作合法性（新增）
  user = { role, orgId, userId, isActorOf(entity) }
```

**核心原则**：动作合法性不仅看角色，还看「当前用户是否是该实体的操作主体」。
- 例：解密动作的合法主体是「该 BidFile 的 bidderId === 当前用户 orgId」，与角色无关。
- 例：评分动作的合法主体是「该 ExpertTask 的 expertId === 当前用户」。

---

## 2. 动作合法性判定规则

```
canAct(entity, state, action, user):
  1. 检查 state 是否在 action 的允许状态集（来自 03 状态机）
  2. 检查 user 是否在 action 的允许主体集（本矩阵）
  3. 两者皆满足才放行
```

**允许主体类型**：
- `role:X` —— 按角色（招标人/代理/...）
- `owner` —— 实体的操作主体（BidFile.bidderId / ExpertTask.expertId）
- `host` —— 开标主持人
- `leader` —— 评标组长
- `supervisor` —— 监督人（只读 + 异常登记）
- `admin` —— 平台管理员

---

## 3. 核心矩阵

### 3.1 开标大厅（OpeningSession）★ P0-1 解密权限

| 状态 \ 角色 | 招标人/代理 | 投标人(owner) | 监督人 | 专家 |
|---|---|---|---|---|
| prepared | 确认主持人/监督、管理监督人账号 | - | - | - |
| signing | 查看签到进度 | **签到自己** | 查看签到 | - |
| signing→decrypt | 缺员时二次确认进入开标 | - | 查看缺员 | - |
| decrypt | **查看解密状态** | **解密自己的 BidFile** | 查看解密状态 | - |
| decrypt | 标记解密失败为废标 | - | 登记异常 | - |
| singing | 查看唱标、导出记录 | 查看自己唱标信息 | 查看唱标 | - |
| closed | 导出开标记录 | 查看记录 | 查看记录 | - |

**P0 验收点**：
- 投标人 A 的解密按钮仅当 `BidFile.bidderId === A.orgId` 且 `state === decrypt` 出现。
- 招标人/代理/监督在 `decrypt` 状态**无解密按钮**，只有状态展示。
- 现状缺陷：招标人/代理仍能替投标人解密、投标人写死单一企业。-> 需按本矩阵修正。

### 3.2 投标文件（BidFile）★ P0-2 / P0-3

| 状态 \ 角色 | 投标人(owner) | 招标人/代理 | 监督人 |
|---|---|---|---|
| uploaded | 上传、签章 | - | - |
| signed | 加密（选方式） | - | - |
| encrypted(password) | 保存草稿、重新加密为CA | - | - |
| encrypted(password) | **正式提交（阻断）** | - | - |
| encrypted(ca) | 正式提交、生成回执 | - | - |
| submitted | 撤回（截止前） | 查看提交状态 | 查看提交状态 |
| submitted | - | 查看回执（不查内容） | - |
| decrypted | 查看自己文件 | 查看开标信息 | 查看 |

**P0 验收点**：
- `encrypted(password)` 状态下「正式提交」按钮禁用并提示「需 CA 加密」。
- 仅 `encrypted(ca)` + `submitted` 生成正式回执号；密码加密保存草稿无回执。
- 撤回仅在投标截止前可用。

### 3.3 评标（Evaluation + ExpertTask）★ P1-5

| 状态 \ 角色 | 专家(owner) | 组长(leader) | 招标人/代理 | 监督人 |
|---|---|---|---|---|
| extracting | - | - | 抽取专家、确认委员会 | - |
| notified | 接受/拒绝任务 | - | 查看接受情况 | - |
| accepted | 签到、选组长 | 签到 | - | 查看签到 |
| reviewing | 查阅资料 | 查阅资料 | - | 查看 |
| scoring | **评分（自己的）** | 评分 | - | 查看 |
| scoring | 提交评分 | - | - | - |
| summary | - | **统计结果、设基准价、生成报告** | - | 查看 |
| summary | - | 电子签名 | - | 查看 |
| closed | 查看报告 | 导出报告 | 查看候选人 | 查看全过程 |

**P1 验收点**：
- 专家只能评分分配给自己的 ExpertTask，不能替他人评分。
- `summary` 状态的「统计/生成报告」仅组长可见可操作。
- 专家任务链路：抽取 -> 通知 -> 接受 -> 评标，每步有状态与时间戳。

### 3.4 项目/标段（Package）

| 状态 \ 角色 | 招标人 | 代理 | 投标人 | 监督人 |
|---|---|---|---|---|
| draft | 创建/编辑/发标 | 受托后编辑 | - | - |
| bidding | 发变更公告 | 发变更公告 | 查看公告 | 查看 |
| bid_open | 查看报名 | 查看报名 | 报名/缴费/上传/报价 | - |
| bid_open | 审核报名（若需） | 审核报名 | - | - |
| pre_open | 查看参与情况 | 查看参与情况 | 查看自己提交 | - |
| opening | 主持开标 | 协助开标 | 签到/解密 | 监督 |
| evaluating | 查看进度 | 查看进度 | - | 监督 |
| pre_award | 确认中标人 | 确认中标人 | - | 查看 |
| awarded | 发通知书 | 发通知书 | 查看结果 | 查看 |
| archived | 查看归档 | 查看归档 | 查看归档 | 查看 |

**验收点**：
- 招标代理无「创建项目」按钮（已有，保留）。
- 项目跟踪页「去上传投标文件」按钮仅对投标人出现，招标人视角不出现（`08` 复测项）。

### 3.5 公告（Notice）

| 状态 \ 角色 | 招标人/代理 | 投标人 | 游客 | 管理员 |
|---|---|---|---|---|
| draft | 编辑 | - | - | - |
| published | 查看、发变更/澄清 | 查看、报名 | 查看 | 查看 |
| changed | 查看 | 查看 | 查看 | 查看 |
| withdrawn | 查看 | 不可见 | 不可见 | 查看 |

### 3.6 异议与异常

| 动作 \ 角色 | 投标人 | 招标人/代理 | 监督人 | 管理员 |
|---|---|---|---|---|
| 提异议（开标/候选人公示节点） | 提出 | - | - | - |
| 答复异议 | - | 答复 | - | - |
| 答复评标质疑 | - | 转专家答复 | - | - |
| 登记异常（终止/中止/重新招标） | - | 发起 | **叫停登记** | 审批 |
| 异常生效 | - | 确认 | - | 确认 |

**监督人「叫停」模型**（见 `01` Q5）：监督人登记异常后状态为 `pending`，需招标人/管理员确认才生效，监督人不直接改业务状态。

---

## 4. 矩阵落地为代码

建议在 `src/config/` 新增 `actionPermissions.js`：

```js
// 动作权限：[允许状态, 允许主体类型]
export const ACTION_PERMISSIONS = {
  'bidfile.decrypt': {
    states: ['decrypt'],              // 来自 OpeningSession 状态
    subjects: ['owner'],              // 仅 BidFile.bidderId 匹配者
    ownerField: 'bidderId',
  },
  'bidfile.submit': {
    states: ['encrypted'],
    subjects: ['owner'],
    guard: (bidFile) => bidFile.encryptMethod === 'ca',  // P0-3
  },
  'evaluation.summarize': {
    states: ['scoring'],
    subjects: ['leader'],
  },
  'evaluation.score': {
    states: ['scoring'],
    subjects: ['owner'],              // ExpertTask.expertId 匹配者
    ownerField: 'expertId',
  },
  // ...
}
```

UI 层用法：
```js
const canDecrypt = canAct('bidfile', openingState, 'decrypt', { role, orgId })
// canDecrypt 为 true 才渲染解密按钮
```

**与现有 `permissions.js` 的关系**：`PAGE_PERMISSIONS` 保留（页面级），`ACTION_PERMISSIONS` 新增（动作级），两者叠加。

---

## 5. 验收清单（本矩阵直接产出）

| # | 验收项 | 矩阵位置 | 优先级 |
|---|---|---|---|
| P0-1 | 解密仅 owner 在 decrypt 状态可操作 | §3.1 | P0 |
| P0-2 | 投标文件状态链缺环节阻断 | §3.2 | P0 |
| P0-3 | 密码加密不可正式提交 | §3.2 | P0 |
| - | 专家只能评自己的任务 | §3.3 | P1 |
| - | 组长独占汇总/报告 | §3.3 | P1 |
| - | 代理无创建项目 | §3.4 | 已有 |
| - | 项目跟踪按钮角色过滤 | §3.4 | P1 |
| - | 监督人只读+异常登记 | §3.6 | P1 |
