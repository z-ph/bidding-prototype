

<!-- Merged from add-portal-org-missing-features / portal -->

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


<!-- Merged from complete-recruiting-remaining-tasks / portal -->

## ADDED Requirements

### Requirement: 门户首页应包含轮播图
WHEN 访客进入门户首页,
系统 SHALL 在 banner 区域展示轮播图,
AND 支持自动切换与手动切换,
AND 轮播内容 SHALL 包含平台介绍、核心能力等。

#### Scenario: 浏览首页轮播
GIVEN 用户访问 /
WHEN 等待 5 秒
THEN 轮播图自动切换到下一帧
AND 用户也可点击指示器手动切换。

### Requirement: 首页统计从真实数据源读取
WHEN 首页加载,
系统 SHALL 展示累计项目数、注册供应商数、本月开标数,
AND 这些数据 SHALL 来自持久化数据源或后端接口,
AND 刷新页面后数字保持一致。

#### Scenario: 刷新首页统计
GIVEN 用户已看到首页统计
WHEN 刷新页面
THEN 统计数字与刷新前一致。

### Requirement: 公告列表进入真正详情页
WHEN 用户在门户公告列表点击标题或"报名",
系统 SHALL 跳转到 `/notice/:id` 详情页,
AND 详情页 SHALL 展示公告正文、附件、报名条件,
AND 已登录且符合条件的供应商 SHALL 可点击"立即报名"。

#### Scenario: 查看公告详情并报名
GIVEN 供应商已登录
WHEN 打开某招标公告详情页
THEN 看到公告正文和附件列表
AND 点击"立即报名"进入报名流程。

#### Scenario: 未登录用户报名被引导登录
GIVEN 未登录用户打开公告详情页
WHEN 点击"立即报名"
THEN 系统提示"请先登录"
AND 跳转登录页。

### Requirement: 下载中心附件真实可下载
WHEN 用户进入下载中心,
系统 SHALL 展示下载项列表,
AND 点击下载 SHALL 触发真实文件下载,
AND 展示版本说明与更新时间。

#### Scenario: 下载操作手册
GIVEN 用户在 /downloads
WHEN 点击"供应商操作手册"下载按钮
THEN 浏览器开始下载对应 PDF 文件。

### Requirement: 新增联系我们页面
WHEN 用户点击联系我们入口,
系统 SHALL 展示平台联系方式、地址、工作时间,
AND 支持从帮助中心和页脚直达。

#### Scenario: 查看联系方式
GIVEN 用户访问 /contact
THEN 看到电话、邮箱、地址、工作时间。
