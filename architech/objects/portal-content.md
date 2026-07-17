# 业务对象：PortalContent（门户内容）

> 门户内容 = 新闻 / 系统公告 / 政策法规。与交易公告 `Notice` 不同：不关联标段、由平台运营方发布。
> 本卡用最简单的对象验证六面模板。

---

## ① 业务对象

**定义**：平台自运营的公开内容，面向所有用户（含游客）展示，不绑定任何业务标段。

**字段**：

```
PortalContent {
  id*           string
  type*         enum    news | notice | regulation   （新闻/系统公告/政策法规）
  title*        string
  content*      text    （正文，富文本）
  category      string  （二级分类，可选）
  attachments[] FileRef （附件）
  isTop         bool    （是否置顶）
  publishAt     datetime（发布时间/定时发布时间）
  offlineAt     datetime（下线时间，可空=长期）
  status*       enum    draft | pending | published | offline | deleted
  creatorId*    string  （管理员）
  createdAt, updatedAt
}
```

**与 Notice 的边界**：Notice 关联 packageId、由招标人/代理在交易系统发；PortalContent 不关联标段、由管理员在信息管理后台发。两者不混。

---

## ② 生命周期

状态链：

```
草稿 draft → 待发布 pending → 已发布 published → 已下线 offline
                                          ↘ 已删除 deleted（须先下线）
```

迁移表（当前状态 -[事件]-> 新状态）：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 创建 | 仅管理员 | draft | 管理员 |
| draft | 编辑 | 仅管理员/创建者 | draft | 管理员 |
| draft | 提交发布 | 必填字段齐全；publishAt 合法 | pending | 管理员 |
| pending | 发布(立即) | publishAt <= now；仅管理员 | published | 管理员 |
| pending | 发布(定时) | publishAt > now | published（到点触发） | 系统 |
| published | 下线 | 仅管理员 | offline | 管理员 |
| published | 编辑 | 已发布不可改正文（须先下线） | published（拒绝） | - |
| offline | 重新发布 | 仅管理员 | published | 管理员 |
| offline | 删除 | 仅已下线可删；仅管理员 | deleted | 管理员 |
| published | 删除 | 不可直接删（规则） | （拒绝） | - |

---

## ③ Actor（谁做什么）

| 动作 | 管理员 | 登录用户 | 游客 |
|---|---|---|---|
| 创建 | ● | · | · |
| 编辑 | ● | · | · |
| 发布/下线/删除 | ● | · | · |
| 查看 | ○ | ○ | ○ |
| 接收通知（系统公告） | ○ | ● | · |

> 新闻/法规一般不推送；系统公告可推送给登录用户（消息中心）。

---

## ④ Event（事件清单）

- `created` 创建
- `edited` 编辑
- `submitted` 提交发布
- `published` 发布（立即/定时到点）
- `taken_offline` 下线
- `republished` 重新发布
- `deleted` 删除

> 事件 ≠ 状态：`published`（事件）触发 draft/pending -> published（状态）。

---

## ⑤ Rule（业务规则）

1. **权限规则**：只有平台管理员可创建/编辑/发布/下线/删除。
2. **时间规则**：`publishAt < offlineAt`（若 offlineAt 非空）；定时发布时间须在未来。
3. **删除规则**：已发布（published）不可直接删除，须先下线再删。
4. **编辑规则**：已发布不可改正文，须先下线。
5. **可见性规则**：仅 published 状态对游客/登录用户可见；draft/pending/offline 仅管理员可见。
6. **置顶规则**：isTop=true 的内容在列表置顶，同 isTop 按_publishAt 倒序。

---

## ⑥ Question（待确认）

- 是否需要审核环节（管理员自审即可，还是双人审核）？
- 是否支持定时发布？（本卡已预留 publishAt，待确认是否实现定时器）
- 是否支持置顶？（本卡已预留 isTop，待确认）
- 是否支持多语言？
- 正文是否富文本？支持哪些格式/是否限制图片？
- 政策法规是否需要分类溯源（文号/发布机构）？
- 系统公告是否推送到消息中心？推送范围（全角色/指定角色）？
