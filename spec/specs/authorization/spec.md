# authorization Specification

## Requirements

<!-- Merged from add-supplier-authorization-20260717 / authorization -->

### Requirement: 供应商项目授权管理
招标人/代理机构 SHALL 能按项目维护授权供应商名单，包括授权、撤销与授权状态查看（清单 23）。

#### Scenario: 授权供应商
GIVEN 招标人进入供应商授权管理页
WHEN 选择项目并对某供应商执行授权
THEN 该供应商进入该项目授权名单
AND 授权记录持久化。

#### Scenario: 撤销授权
GIVEN 某供应商已在项目授权名单内
WHEN 招标人撤销其授权
THEN 该供应商授权状态变为已撤销
AND 其招标文件下载权限随之失效。

### Requirement: 招标文件下载授权门控
招标文件下载 SHALL NOT 以报名或缴费为前置；系统 SHALL 按「公开/授权」二态控制下载：公开项目供应商可自行下载，非公开项目仅授权名单内供应商可下载（清单 23）。

#### Scenario: 公开项目自行下载
GIVEN 公开招标或公开询比价项目
WHEN 供应商进入招标文件下载页
THEN 无需授权即可下载招标文件。

#### Scenario: 未授权阻断下载
GIVEN 非公开项目且供应商不在授权名单内
WHEN 供应商尝试下载招标文件
THEN 系统阻断下载
AND 提示需经招标人授权后方可下载。

### Requirement: 授权年度周期与过期重授权
供应商授权 SHALL 按年度周期生效（每年授权一次）；授权过期后系统 SHALL 标记「需重新授权」，过期授权视同未授权（概要三）。

#### Scenario: 授权过期
GIVEN 供应商授权已过年度有效期
WHEN 其尝试下载招标文件或招标人查看授权名单
THEN 授权状态显示「需重新授权」
AND 下载被阻断直至重新授权。

### Requirement: 投标邀请书自动生成
系统 SHALL 按模板自动生成投标邀请书，项目信息、标段与时间自动填充；模板维护联系采购管理部（清单 24），原型阶段模板内容为 mock 占位。

#### Scenario: 查看投标邀请书
GIVEN 供应商已被邀请或授权参与项目
WHEN 在项目中心查看投标邀请书
THEN 系统展示按模板自动生成的邀请书
AND 项目名称、标段、时间节点与项目数据一致。
