# Spec Delta: Portal Content Management & Help Search

## ADDED Requirements

### Requirement: 管理员可维护新闻公告
WHEN 内容管理员进入新闻公告维护页面,
系统 SHALL 展示新闻公告列表（标题、分类、状态、发布时间）,
AND 允许新增、编辑、下线新闻公告,
AND 保存新闻时 SHALL 支持草稿和已发布两种状态,
AND 发布后门户 `/news` 页面 SHALL 可见，下线后不可见。

#### Scenario: 发布新闻公告
GIVEN 管理员已登录并进入新闻公告维护页
WHEN 点击"新增"并填写标题、分类、正文、上传附件
AND 选择"立即发布"并保存
THEN 门户新闻列表出现该条新闻
AND 点击标题可查看详情与附件。

#### Scenario: 下线新闻公告
GIVEN 已有一条已发布新闻
WHEN 管理员点击"下线"
THEN 该新闻在门户 `/news` 列表中消失
AND 状态变为"已下线"。

### Requirement: 帮助中心支持搜索
WHEN 用户进入 `/help` 页面,
系统 SHALL 提供关键词搜索框和分类筛选,
AND 只展示匹配的折叠面板内容。

#### Scenario: 按关键词搜索帮助
GIVEN 用户在帮助中心输入"CA"
WHEN 点击搜索
THEN 只显示包含"CA"关键词的问题与答案。
