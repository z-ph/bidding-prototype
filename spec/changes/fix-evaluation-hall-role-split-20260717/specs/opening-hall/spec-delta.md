# Spec Delta: 开标准备人员配置

## ADDED Requirements

### Requirement: 开标准备指定主持人与监督人
WHEN 代理机构进入开标大厅且开标未开始,
系统 SHALL 提供指定主持人与监督人的配置（可从人员中选择或手动输入）,
AND 配置 SHALL 持久化,
AND 签到表与唱标环节 SHALL 使用所配置的人员名单。

#### Scenario: 指定并生效
GIVEN 代理在开标前指定主持人为「王五」、监督人为「赵监督」
WHEN 进入签到环节
THEN 签到表显示王五（主持人）、赵监督（监督人）等待签到
AND 刷新页面后配置保留。
