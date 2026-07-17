# expert Specification

## Requirements

<!-- Merged from add-expert-extraction / expert -->

### Requirement: 专家按专业领域随机抽取
WHEN 项目进入评标准备阶段,
系统 SHALL 允许授权用户（管理员或招标代理）从专家库中按项目所需专业领域随机抽取指定数量的专家,
AND 抽取过程 SHALL 遵循回避规则。

#### Scenario: 按项目需求抽取专家
GIVEN 管理员进入专家抽取页面
WHEN 选择“XX市轨道交通设备采购项目”
THEN 系统自动读取该项目所需专业领域（如：电子信息、机械设备、工程造价）
AND 管理员设置抽取人数为 5 人
AND 点击“随机抽取”
THEN 系统从专家库中随机抽取 5 名匹配领域的专家并展示结果。

#### Scenario: 回避规则过滤
GIVEN 某投标单位与专家甲存在关联关系
WHEN 该项目包含该投标单位
THEN 专家甲 SHALL 被排除在候选池之外。

### Requirement: 抽取结果可确认与重新抽取
WHEN 抽取结果展示后,
系统 SHALL 允许用户重新抽取或确认结果,
AND 确认后 SHALL 将名单绑定到该项目的评标任务。

#### Scenario: 确认抽取结果
GIVEN 系统已展示 5 名抽取专家
WHEN 管理员点击“确认并通知”
THEN 名单绑定到项目
AND 系统提示“已生成评标委员会名单”。

#### Scenario: 对不满意结果重新抽取
GIVEN 系统已展示抽取结果
WHEN 管理员点击“重新抽取”
THEN 系统重新执行随机抽取
AND 展示新的专家名单。

### Requirement: 抽取结果在评标流程中可见
WHEN 专家抽取结果已确认,
系统 SHALL 在评标任务页（`ExpertProject.vue`）与评标大厅（`EvaluationHall.vue`）中展示该名单。

#### Scenario: 评标专家签到
GIVEN 项目已完成专家抽取
WHEN 专家登录进入评标任务
THEN 专家在签到列表中看到自己的名字与组长/组员身份。

### Requirement: 专家名单来源
WHILE 以前评标任务中专家名单为硬编码,
系统 SHALL 更改为：优先使用已确认的专家抽取结果，若未抽取则保留原有硬编码示例。
