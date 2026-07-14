# Spec Delta: Portal Single Header & Working Navigation

## MODIFIED Requirements

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
