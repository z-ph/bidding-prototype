# Spec Delta: 补建管理侧缺失页面

## ADDED Requirements

### Requirement: 待办事项独立页面
WHEN 用户进入待办事项页,
系统 SHALL 按当前角色聚合展示待办（类型、来源、时间）,
AND 点击待办 SHALL 跳转到对应处理页面。

#### Scenario: 角色待办
GIVEN 招标人登录
WHEN 打开待办事项
THEN 展示其职责相关待办（如报名审核、异议答复、报告确认）并可跳转处理。

### Requirement: 通知管理
WHEN 管理员/招标方进入通知管理,
系统 SHALL 展示通知列表（标题、类型、接收角色、时间、状态）,
AND 支持发送通知，发送结果 SHALL 持久化并在消息中心可见。

#### Scenario: 发送通知
GIVEN 管理员填写通知标题与内容并选择接收角色
WHEN 点击发送
THEN 通知出现在列表中且对应角色消息中心可见。

### Requirement: 模板管理
WHEN 管理员进入模板管理,
系统 SHALL 展示公告与招标文件模板列表（名称、类型、更新时间、状态）,
AND 支持启停用与内容编辑并持久化。

#### Scenario: 编辑模板
GIVEN 管理员打开一个公告模板
WHEN 修改内容并保存
THEN 列表更新修改时间，刷新后内容保留。

### Requirement: 系统设置
WHEN 管理员进入系统设置,
系统 SHALL 提供演示参数配置（CA 沙箱、短信模拟、演示数据重置）并持久化,
AND 数据重置 SHALL 二次确认。

#### Scenario: 重置演示数据
GIVEN 管理员点击数据重置
WHEN 二次确认后执行
THEN 本地演示数据恢复初始状态。
