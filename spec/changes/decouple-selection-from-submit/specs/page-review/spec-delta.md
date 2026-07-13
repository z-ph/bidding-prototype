# Spec Delta: 选择与提交解耦

## MODIFIED Requirements

### Requirement: 自封装评审组件
系统 SHALL 将“选择评审目标”与“提交评审表单”解耦,
AND 选择目标时 SHALL NOT 弹出评审表单,
AND 系统 SHALL 支持通过 Cmd/Ctrl+点击多选元素,
AND 评审提交 SHALL 统一由工具条“提交评审”按钮触发。

#### Scenario: 点击选中不弹表单
GIVEN 评审模式已打开且处于“选择元素”模式
WHEN 用户点击页面元素
THEN 该元素显示持久高亮且工具条计数加一
AND 不弹出评审表单。

#### Scenario: 多选元素
GIVEN 已选中一个元素
WHEN 用户按住 Cmd/Ctrl 点击另一个元素
THEN 两个元素均为选中态
AND 再次 Cmd/Ctrl+点击已选元素将其移出选择。

#### Scenario: 多目标提交
GIVEN 已选中多个元素和/或框选区域
WHEN 用户点击工具条“提交评审”并填写表单提交
THEN 生成一条包含全部目标及逐目标截图的评审记录
AND 选择集合被清空。

#### Scenario: 取消选择
GIVEN 已选中若干目标
WHEN 用户点击“取消选择”
THEN 所有高亮清除且工具条计数归零。
