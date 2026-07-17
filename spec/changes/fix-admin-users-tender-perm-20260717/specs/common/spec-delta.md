# Spec Delta: 退出登录二次确认

## MODIFIED Requirements

### Requirement: 退出登录确认
原能力：点击退出按钮立即退出，无确认。
现修改：点击退出登录 SHALL 弹出二次确认（提示未保存内容可能丢失），确认后才清除会话并返回登录页。

#### Scenario: 确认退出
GIVEN 用户已登录后台
WHEN 点击「退出」并在弹窗中确认
THEN 退出登录并返回登录页
AND 未登录访问后台被拦截。

#### Scenario: 取消退出
GIVEN 用户点击「退出」
WHEN 在确认弹窗中取消
THEN 保持当前会话与页面不变。
