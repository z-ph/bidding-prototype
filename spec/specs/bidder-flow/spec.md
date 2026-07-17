

<!-- Merged from page-review-20260714-fixes / bidder-flow -->

## ADDED Requirements

### Requirement: 投标人项目中心根据状态聚合操作入口
<!-- 2026-07-17 新口径修订：无报名与缴费环节，本条被文末 remove-deprecated-flows 合并块的 MODIFIED 版本取代 -->
WHEN 投标人进入"项目中心",
系统 SHALL 按项目状态动态显示"去缴费"、"下载招标文件"、"上传投标文件"等按钮,
AND 不再在左侧菜单保留独立的"缴纳费用"、"下载文件"、"上传投标文件"顶级入口。

#### Scenario: 报名未缴费项目
GIVEN 项目状态为"报名待缴费"
WHEN 投标人查看该项目
THEN 显示"去缴费"按钮
AND 不显示"上传投标文件"按钮。

### Requirement: 缴纳文件费步骤动态化
<!-- 2026-07-17 新口径废弃：本条随「不缴纳、不实现支付」下线（清单 26、概要七），见文末 remove-deprecated-flows 合并块 -->
WHEN 项目跟踪展示流程步骤,
系统 SHALL 不再固定显示"缴纳文件费"步骤,
AND 未缴费时 SHALL 在对应步骤节点显示"去缴纳"按钮。

#### Scenario: 已缴费项目
GIVEN 项目已缴费
WHEN 查看项目跟踪
THEN 流程节点显示"已缴费"且无"去缴纳"按钮。

### Requirement: 报价与投标文件上传流程合并
WHEN 投标人上传投标文件,
系统 SHALL 在同一流程中填写开标一览表/报价,
AND 询比价项目的报价大厅 SHALL 在开标后启动。

#### Scenario: 上传投标文件时报价
GIVEN 投标人进入上传投标文件页
WHEN 上传文件并填写报价
THEN 报价作为投标文件的一部分保存
AND 开标前不可见。

### Requirement: 资质文件按项目要求上传并检测
<!-- 2026-07-17 新口径修订：报名校验阻断废弃（无报名环节），本条被文末 remove-deprecated-flows 合并块的 MODIFIED 版本取代 -->
WHEN 供应商注册或维护企业档案,
系统 SHALL 按项目资质要求类型上传对应资质文件,
AND 报名 SHALL 校验资质文件是否满足项目要求,
AND 不满足时 SHALL 阻断报名并提示缺失项。

#### Scenario: 报名资质检测不通过
GIVEN 项目要求 ISO9001 认证
WHEN 供应商报名时未上传 ISO9001 证书
THEN 系统提示"缺少 ISO9001 认证"
AND 不允许提交报名。


<!-- Merged from add-bidder-review-flows-20260717 / bidder-flow -->

## ADDED Requirements

<!-- 2026-07-17 新口径废弃：投标报名落库与受邀校验——新口径无报名环节，每次招标无需报名及投标资格审核（需求确认清单 10/11；会议概要二） -->

<!-- 2026-07-17 新口径废弃：报名审核——无报名环节即无报名审核入口（需求确认清单 10/11；会议概要二） -->

<!-- 2026-07-17 新口径废弃：缴费落库与下载前置——保证金/文件费不缴纳（清单 26）、不实现支付（会议概要七） -->

<!-- 2026-07-17 新口径废弃：供应商异议中心——新口径没有供应商异议环节（需求确认清单 44/45） -->

### Requirement: 投标邀请闭环
WHEN 项目为邀请制,
系统 SHALL 记录邀请（项目、企业、时间、状态）,
AND 受邀供应商 SHALL 在邀请中心查看并接受或拒绝,
AND 邀请状态（已发送/已接受/已拒绝）SHALL 对发出方可跟踪。

#### Scenario: 接受邀请
GIVEN 供应商收到项目邀请
WHEN 在邀请中心点击「接受」
THEN 邀请状态变为「已接受」并持久化，发出端可见。

### Requirement: 在线报价项目选择门槛
WHEN 投标人从菜单直接进入在线报价页且无项目参数,
系统 SHALL 先要求选择项目,
AND 选择后按项目/标段渲染报价字段。

#### Scenario: 先选项目
GIVEN 投标人从菜单进入在线报价
WHEN 页面加载
THEN 显示项目选择，未选择前不渲染报价表单。

## MODIFIED Requirements

### Requirement: 项目中心操作入口
原能力：详情按钮仅提示消息；无开标大厅/中标通知入口。
现修改：详情按钮 SHALL 跳转真实项目详情页；按项目状态 SHALL 聚合「进入开标大厅」「查看中标通知」入口。

#### Scenario: 进入开标大厅
GIVEN 项目到达开标阶段
WHEN 查看我参与的项目
THEN 显示「进入开标大厅」按钮并可跳转。


<!-- Merged from fix-bid-upload-encryption-20260715 / bidder-flow -->

## ADDED Requirements

### Requirement: 投标文件上传提供完整动作链
WHEN 投标人进入投标文件上传页,
系统 SHALL 提供上传、签章、加密、提交的连续操作,
AND 每个动作的状态 SHALL 可见,
AND 支持重新签章和重新加密。

#### Scenario: 完整提交流程
GIVEN 投标人进入上传页
WHEN 上传文件 → 执行签章 → 执行加密 → 点击正式提交
THEN 系统提示提交成功并生成回执
AND 文件状态变为"已正式提交"。

#### Scenario: 重新加密
GIVEN 文件已加密但投标人想更换加密证书
WHEN 点击"重新加密"
THEN 文件回到待加密状态并可重新执行加密。

### Requirement: 正式提交只接受 CA 证书加密
WHEN 投标人执行正式提交,
系统 SHALL 校验投标文件是否使用 CA 证书加密,
AND 未使用 CA 证书加密 SHALL 阻断提交并提示。

#### Scenario: 密码加密不能正式提交
GIVEN 文件仅使用密码加密
WHEN 点击"正式提交"
THEN 系统提示"正式提交必须使用 CA 证书加密，当前为密码加密（仅草稿）"
AND 不生成正式回执。

#### Scenario: CA 加密正式提交
GIVEN 文件已使用 CA 证书加密
WHEN 点击"正式提交"
THEN 提交成功并生成正式回执。

### Requirement: 存在未加密文件时禁止正式提交
WHEN 投标人点击正式提交,
系统 SHALL 校验所有投标文件均已加密,
AND 存在未加密文件 SHALL 阻断提交并提示具体文件名。

#### Scenario: 未加密文件阻断
GIVEN 文件列表中存在未加密的"报价单.xlsx"
WHEN 点击"正式提交"
THEN 系统提示"报价单.xlsx 未加密，请先完成加密"
AND 不提交。


<!-- Merged from remove-deprecated-flows-20260717 / bidder-flow -->

## REMOVED Requirements

<!-- 2026-07-17 新口径废弃（甲方已确认四类全下）：缴纳文件费步骤动态化——不实现支付，保证金/文件费不要求缴纳（概要七、清单 26），项目跟踪不含缴费节点 -->

<!-- 2026-07-17 新口径废弃：供应商异议处理——清单 44/45 没有供应商异议环节；ObjectionManage、BidDownload 质疑入口及 objectionStore 已下线 -->

## MODIFIED Requirements

### Requirement: 投标人项目中心根据状态聚合操作入口
原能力：按项目状态显示「去缴费」「下载招标文件」「上传投标文件」等按钮。
现修改：无报名与缴费环节（清单 10/11、概要七、清单 26），系统 SHALL NOT 显示「去缴费」入口，操作聚合 SHALL 从「下载招标文件」开始（下载门控按授权/公开二态，见 authorization 能力）。

#### Scenario: 项目中心无缴费入口
GIVEN 投标人进入项目中心
WHEN 查看任意项目操作按钮
THEN 不显示「去缴费」按钮
AND 显示「下载招标文件」「上传投标文件」等入口。

### Requirement: 资质文件按项目要求上传并检测
原能力：供应商报名时校验资质文件是否满足项目要求，不满足时阻断报名。
现修改：无每次招标的报名与资格审核（清单 10/11、概要二），资质文件上传保留，但 SHALL NOT 在报名时校验阻断（供应商准入为一次性入库审核）。

#### Scenario: 无报名校验阻断
GIVEN 供应商资质文件未覆盖某项目要求类型
WHEN 该供应商参与该项目
THEN 不存在报名提交动作
AND 不因资质缺失被报名环节阻断。
