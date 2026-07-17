# Spec Delta: 使用库提供的 ReviewTool

## MODIFIED Requirements

### Requirement: 页面评审组件
系统 SHALL 使用 react-page-review 包提供的 ReviewTool 组件实现页面评审,
AND SHALL NOT 在宿主侧维护平行的自封装评审组件,
AND 评审入口与受控接口（active / onActiveChange）保持不变。

#### Scenario: 默认隐藏与开关
GIVEN 页面加载完成
WHEN active 为 false
THEN 页面不渲染评审 UI
AND 点击右下角评审按钮后显示，ESC 或“退出评审”后隐藏。

#### Scenario: 完整交互能力
GIVEN 评审模式已打开
WHEN 用户拖动工具栏标题区域
THEN 工具栏跟随移动
AND 元素选择、框选、多选、提交、列表与导出行为与 ReviewTool 一致。
