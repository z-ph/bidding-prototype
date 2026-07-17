# Proposal: 优化门户首页交易信息筛选区

## Change ID

`update-portal-notice-filter`

## Why

门户首页 `/bidding-prototype/` 的“交易信息”筛选控件当前位于内容区标题行（`div.section-title`），与页面标题混在一起，位置不够突出。评审报告（`page-reviews-20260713-0923`）指出：

1. 筛选菜单应放在页面顶部，而不是内容区标题行。
2. 筛选按钮尺寸偏小，不够醒目。

将筛选控件上移至顶部固定导航区域，并增大标签尺寸，可提升信息层级与操作可达性。

## What Changes

1. 在 `portal-header` 下方新增顶部筛选导航栏（`.filter-nav`）。
2. 将 `noticeType` 的 `el-radio-group` 从 `div.section-title` 迁移到 `.filter-nav`。
3. 筛选按钮使用 `size="large"`，增大视觉与点击区域。
4. `div.section-title` 仅保留“交易信息”标题。

## Impact

- **代码**：`src/views/Portal.vue`
- **用户交互**：门户首页顶部出现交易信息类型筛选页签，点击后过滤下方公告列表。
- **无破坏性变更**：筛选逻辑与数据保持不变。

## 状态（2026-07-17 实施完成）

- 总体状态：已取代（superseded by fix-portal-double-header）
- 任务统计：3 任务 — 3 无需修复
- 依据：该设计已被 fix-portal-double-header 回退取代，归档时标注 superseded
