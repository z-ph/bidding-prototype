# Spec Delta: 门户公共页面导航接线

## ADDED Requirements

### Requirement: 门户公共导航跳转真实页面
WHEN 访客点击门户顶部导航的"新闻公告"、"帮助中心"或"下载中心",
系统 SHALL 跳转到对应真实页面（/news、/help、/downloads）,
AND 这些页面 SHALL 无需登录即可访问,
AND 不得使用"建设中"等占位提示,
AND 门户首页快速入口卡片 SHALL 跳转到对应页面。

#### Scenario: 顶部导航进入帮助中心
GIVEN 未登录访客在门户首页
WHEN 点击顶部导航"帮助中心"
THEN 跳转 /help 并展示 FAQ 内容。

#### Scenario: 快速入口进入下载中心
GIVEN 访客在门户首页
WHEN 点击"下载中心"快速入口卡片
THEN 跳转 /downloads 并展示文件下载列表。
