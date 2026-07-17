# Spec Delta: 登录页与工作后台返回门户入口

## ADDED Requirements

### Requirement: 登录页与工作后台提供返回门户入口
WHEN 用户处于登录页或任意角色工作后台,
系统 SHALL 提供返回门户首页（/）的入口,
AND 登录页入口 SHALL 位于登录表单下方,
AND 工作后台入口 SHALL 为左侧顶部 Logo/平台名称可点击区域。

#### Scenario: 登录页返回首页
GIVEN 用户打开登录页
WHEN 点击"返回首页"
THEN 跳转至门户首页 /。

#### Scenario: 工作后台返回门户
GIVEN 用户已登录并处于工作后台任意页面
WHEN 点击左侧顶部 Logo/平台名称
THEN 跳转至门户首页 /。
