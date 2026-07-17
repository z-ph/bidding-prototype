# Spec Delta: 定标/通知书/归档项目维度与阶段门禁

## MODIFIED Requirements

### Requirement: 定标与归档页面按项目维度展示
原能力：确认中标人、中标通知书、合同归档写死单一项目。
现修改：系统 SHALL 在三个页面提供项目选择，页面内容 SHALL 按所选项目渲染。

#### Scenario: 切换项目
GIVEN 招标人进入中标通知书页
WHEN 切换所选项目
THEN 通知书标题、项目信息、中标人随项目联动更新。

## ADDED Requirements

### Requirement: 定标/通知书/归档按项目阶段门禁
WHEN 项目未到达对应业务阶段（确认中标人需评标完成；中标通知书需已确认中标人；合同归档需通知书已发出）,
系统 SHALL 锁定对应操作并提示当前不可操作的原因,
AND 到达阶段后 SHALL 允许操作并将项目状态推进到下一阶段。

#### Scenario: 未达阶段阻断
GIVEN 项目仍处于「招标中」
WHEN 招标人打开确认中标人页
THEN 页面提示「项目尚未完成评标，暂不可确认中标人」
AND 确认操作禁用。

#### Scenario: 阶段流转
GIVEN 项目已评标完成
WHEN 招标人确认中标人
THEN 项目状态推进为「已确认中标人」
AND 中标通知书页面对该项目解锁。
