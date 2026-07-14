# Spec Delta: Project Create and Track Fixes

## ADDED Requirements

### Requirement: 报价字段可配置并继承到报价页
WHEN 招标人在创建项目时配置报价字段模板,
系统 SHALL 保存该模板,
AND 投标人在在线报价页 SHALL 按模板字段填写,
AND 默认保留总报价、交货期、质保期等常用字段。

#### Scenario: 配置报价字段
GIVEN 创建项目时添加"售后服务年限"报价字段
WHEN 投标人进入报价页
THEN 看到"售后服务年限"输入项
AND 提交后该字段值被保存。

### Requirement: 空白标段禁止提交
WHEN 用户在创建项目时添加标段,
系统 SHALL 校验每个标段必须填写名称、编号、预算、内容,
AND 存在空白标段时 SHALL 阻止进入下一步和提交审核。

#### Scenario: 空白标段阻止下一步
GIVEN 用户添加了标段但只填了名称
WHEN 点击"下一步"
THEN 系统提示"请完善标段信息"
AND 不进入下一步。

### Requirement: 项目跟踪按钮按角色过滤
WHEN 用户查看项目跟踪,
系统 SHALL 根据当前角色只展示该角色可执行的操作,
AND 招标人视角 SHALL 不显示投标人动作按钮。

#### Scenario: 招标人看不到上传按钮
GIVEN 招标人登录并查看某项目跟踪
WHEN 到"上传投标文件"节点
THEN 不显示"去上传"按钮
AND 只展示招标人职责内的操作入口。
