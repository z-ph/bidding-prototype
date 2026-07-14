# Spec Delta: Evaluation Hall Review Fixes

## ADDED Requirements

### Requirement: 评标任务以项目列表形式呈现
WHEN 专家进入评标任务页,
系统 SHALL 展示待评标的项目列表,
AND 点击项目后进入该项目评标详情,
AND 不再是单项目窗口。

#### Scenario: 专家查看评标任务列表
GIVEN 专家登录
WHEN 进入"评标任务"
THEN 看到多个待评标项目卡片/列表
AND 点击后进入评标详情。

### Requirement: 评标组长有独立流程
WHEN 专家被指定为评标组长,
系统 SHALL 在评标流程中增加组长操作入口,
AND 组长可查看统计评标结果、汇总评分、生成评标报告。

#### Scenario: 组长统计结果
GIVEN 专家甲为组长
WHEN 所有专家完成评分
THEN 组长点击"统计评标结果"
AND 系统生成汇总报告。

### Requirement: 查阅资料入口统一
WHEN 专家进入评标详情,
系统 SHALL 在评标流程步骤中提供"查阅资料"入口,
AND 不再作为左侧主导航项。

#### Scenario: 专家查看招标文件资料
GIVEN 专家进入某项目评标
WHEN 点击步骤中的"查阅资料"
THEN 打开招标文件/投标文件查阅面板。
