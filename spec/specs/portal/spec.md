

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
<!-- 2026-07-17 新口径修订：无报名环节，本条被文末 remove-deprecated-flows 合并块的 MODIFIED 版本取代 -->
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


<!-- Merged from fix-portal-double-header / portal -->

## MODIFIED Requirements

<!-- 以下两条 MODIFIED 需求在本 living spec 中无同名需求（原 ADDED 来源 update-portal-notice-filter 已被本提案取代、未合并），按规则追加并注明 -->

### Requirement: 交易信息筛选入口位置
WHEN 用户访问门户首页 `/bidding-prototype/`,
系统 SHALL 在「交易信息」区块标题行内（标题右侧）显示公告类型筛选页签，
包含选项：全部、招标公告、变更公告、候选人公示、中标公告；
页面 SHALL NOT 在主导航栏与 banner 之间设置独立的筛选通栏。

#### Scenario: 默认显示全部公告
GIVEN 用户进入门户首页
WHEN 页面加载完成
THEN 筛选页签默认选中“全部”
AND 下方列表展示所有类型的交易信息。

#### Scenario: 切换公告类型即时可见
GIVEN 用户位于门户首页交易信息区块
WHEN 用户点击“招标公告”页签
THEN 相邻列表立即仅展示类型为“招标公告”的交易信息。

### Requirement: 门户主导航可用性
WHEN 用户点击门户顶部导航栏的任意菜单项
THEN 系统 SHALL 给出明确响应，不允许存在无任何反馈的死按钮。

#### Scenario: 点击首页
WHEN 用户点击“首页”
THEN 页面平滑滚动到顶部。

#### Scenario: 点击交易信息
WHEN 用户点击“交易信息”
THEN 页面平滑滚动到交易信息区块，且区块标题不被 sticky 导航栏遮挡。

#### Scenario: 点击未建设页面入口
WHEN 用户点击“新闻公告”“帮助中心”或“下载中心”
THEN 页面弹出 message 提示该功能建设中。


<!-- Merged from fix-notice-management-20260714 / portal -->

## ADDED Requirements

### Requirement: 公告列表管理与撤回
WHEN 招标人/代理进入公告列表页,
系统 SHALL 展示已发布、草稿、已撤回等状态的公告,
AND 支持按公告类型、项目、时间筛选,
AND 允许编辑草稿公告、撤回已发布公告。

#### Scenario: 撤回已发布公告
GIVEN 存在一条已发布的招标公告
WHEN 用户在公告列表点击"撤回"并确认
THEN 公告状态变为"已撤回"
AND 门户公告列表不再展示该公告。

### Requirement: 发布公告关联标段
WHEN 用户发布公告,
系统 SHALL 在"关联项目"基础上提供"关联标段"多选,
AND 变更公告、候选人公示、中标公告 SHALL 关联到具体标段。

#### Scenario: 发布中标公告选择标段
GIVEN 项目包含两个标段
WHEN 用户发布中标公告并勾选标段一
THEN 公告详情中展示关联的标段一信息。

### Requirement: 变更公告必填变更原因
WHEN 公告类型为"变更公告",
系统 SHALL 显示必填的"变更原因"字段,
AND 变更原因 SHALL 在公告详情页顶部高亮展示,
AND 公告类型下拉 SHALL 包含招标公告、变更公告、澄清公告、候选人公示、中标公告。

#### Scenario: 发布变更公告未填变更原因
GIVEN 用户发布公告并选择类型"变更公告"
WHEN 未填写变更原因就提交
THEN 系统提示"请填写变更原因"并阻止提交。


<!-- Merged from fix-portal-navigation-20260714 / portal -->

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


<!-- Merged from portal-public-pages / portal -->

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


<!-- Merged from remove-deprecated-flows-20260717 / portal -->

## MODIFIED Requirements

### Requirement: 公告列表进入真正详情页
原能力：公告详情页展示报名条件，已登录且符合条件的供应商可点击「立即报名」。
现修改：无报名环节（清单 10/11、概要二），公告详情页 SHALL NOT 展示「立即报名」入口与报名条件，供应商参与路径为下载招标文件（授权/公开二态门控）后直接投标。

#### Scenario: 公告详情无报名入口
GIVEN 供应商已登录
WHEN 打开某招标公告详情页
THEN 看到公告正文和附件列表
AND 不出现「立即报名」按钮。

#### Scenario: 未登录用户查看公告
GIVEN 未登录用户打开公告详情页
WHEN 页面渲染
THEN 正常展示公告正文
AND 不因报名流程被引导登录。
