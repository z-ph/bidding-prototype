# 业务对象：Contract（中标合同归档）

> 中标合同在线存档。可跳过（Q13）。定标流程的收尾环节。

---

## ① 业务对象

**定义**：中标项目的合同文件在线存档记录，关联 Award。

**字段**：

```
Contract {
  id*, awardId*, packageId*, winnerBidderId*
  fileRef         FileRef      合同文件
  amount          number       合同金额
  signDate        date         签订日期
  archiveStatus*  enum         pending（待归档） | archived（已归档） | skipped（跳过）
  archivedAt
}
```

**与 Award 的边界**：Award 确认中标人；Contract 是中标后的合同存档。Contract 可跳过（archiveStatus=skipped）。

---

## ② 生命周期

```
pending（待归档） → archived（已归档）
              ↘ skipped（跳过，Q13）
```

迁移表：

| 当前状态 | 事件 | 守卫规则 | 新状态 | 触发者 |
|---|---|---|---|---|
| (无) | 中标确认后建合同记录 | Award notified | pending | 系统 |
| pending | 上传合同归档 | fileRef 齐全 | archived | 招标人/代理 |
| pending | 跳过归档 | Q13 | skipped | 招标人/代理 |

> archived 或 skipped 后，Award→archived，Package→archived（流程终态）。

---

## ③ Actor

| 动作 | 招标人/代理 | 中标人 | 监督 |
|---|---|---|---|
| 上传合同归档 | ● | · | · |
| 跳过归档 | ● | · | · |
| 查看合同 | ● | ○(自) | ○ |

---

## ④ Event

- `created` 建合同记录
- `archived` 归档
- `skipped` 跳过

---

## ⑤ Rule

1. **可跳过规则**：合同归档可跳过（需求明确），跳过直接 archived 终态。（Q13）
2. **前置规则**：Contract 须 Award notified 后才创建。
3. **终态规则**：archived/skipped 后 Package→archived，流程结束。
4. **存档规则**：合同文件在线存档，支持后续查阅下载。

---

## ⑥ Question

- **Q13** 合同归档跳过时流程如何终止？（默认：skipped → Package archived，合同字段空+标记未归档）
- 合同是否有模板？（需求提到通知书/邀请书模板，合同模板待确认）
- 合同是否需要双方电子签章？（需求未明确，默认仅存档文件）
- 合同归档后是否可补充/替换？（默认 archived 后只读）
