# Spec Delta: Common UI Review Fixes

## ADDED Requirements

### Requirement: 敏感操作增加确认弹窗
WHEN 用户执行发标、开标、解密、定标、驳回等敏感操作,
系统 SHALL 弹出二次确认对话框,
AND 用户确认后才执行操作。

#### Scenario: 发标确认
GIVEN 用户点击"发标"
WHEN 确认弹窗出现
AND 用户点击"确认"
THEN 项目状态更新为"招标中"。

### Requirement: 主页/工作台命名与入口统一
WHEN 用户登录后进入后台,
系统 SHALL 统一使用"工作台"作为首个菜单名称,
AND 面包屑与菜单文案保持一致。

#### Scenario: 管理员查看菜单
GIVEN 管理员登录
WHEN 查看左侧菜单第一项
THEN 显示"工作台"而不是"主页"。
