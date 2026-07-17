# Spec Delta: Portal Notice Filter Navigation

## MODIFIED Requirements

### Requirement: 交易信息筛选入口位置
WHEN 用户访问门户首页 `/bidding-prototype/`,
系统 SHALL 在顶部主导航栏下方显示交易信息类型筛选页签，
包含选项：全部、招标公告、变更公告、候选人公示、中标公告。

#### Scenario: 默认显示全部公告
GIVEN 用户进入门户首页
WHEN 页面加载完成
THEN 顶部筛选页签默认选中“全部”
AND 下方列表展示所有类型的交易信息。

#### Scenario: 切换公告类型
GIVEN 用户位于门户首页
WHEN 用户点击顶部“招标公告”页签
THEN 列表仅展示类型为“招标公告”的交易信息。

### Requirement: 筛选页签视觉层级
WHEN 交易信息筛选页签显示在页面顶部,
系统 SHALL 使用大尺寸按钮样式，确保页签清晰可见、易于点击。

#### Scenario: 页签尺寸符合规范
GIVEN 门户首页顶部筛选页签已渲染
WHEN 用户查看该页签区域
THEN 页签按钮尺寸不小于页面其他次要操作按钮，且与页面标题有明显层级区分。

## REMOVED Requirements

### Requirement: 内容区标题行筛选
WHILE 以前实现中筛选控件位于 `div.section-title` 内,
系统 SHALL 不再在内容区标题行展示交易信息类型筛选控件。
