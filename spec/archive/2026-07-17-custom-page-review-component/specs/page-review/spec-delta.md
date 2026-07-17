# Spec Delta: 自封装页面评审组件

## ADDED Requirements

### Requirement: 自封装评审组件
系统 SHALL 提供基于 react-page-review 无头 SDK 的自封装评审组件,
AND 组件样式 SHALL 与系统 Ant Design 设计体系一致,
AND 组件 SHALL 通过 active / onActiveChange 受控接口打开与关闭。

#### Scenario: 默认隐藏
GIVEN 页面加载完成
WHEN active 为 false
THEN 页面不渲染任何评审相关 DOM 节点。

#### Scenario: 元素评审
GIVEN 评审模式已打开且处于“选择元素”模式
WHEN 用户点击页面元素
THEN 弹出 Ant Design 表单
AND 用户填写并提交后生成含元素定位信息与截图的评审记录。

#### Scenario: 框选评审
GIVEN 评审模式已打开且处于“框定视图”模式
WHEN 用户拖拽绘制矩形选区
THEN 弹出 Ant Design 表单
AND 提交后生成含选区截图的评审记录。

#### Scenario: 评审列表与导出
GIVEN 当前页存在评审记录
WHEN 用户打开评审列表
THEN 显示当前页评审记录且可删除或标记已解决
AND 用户可导出 JSON、Markdown 或 ZIP 报告。

#### Scenario: 退出评审
GIVEN 评审模式已打开
WHEN 用户点击“退出评审”或按 ESC
THEN onActiveChange(false) 被调用且评审 UI 消失。
