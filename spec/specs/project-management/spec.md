

<!-- Merged from page-review-20260714-fixes / project-management -->

## ADDED Requirements

### Requirement: 项目创建权限控制
WHEN 用户进入项目列表或工作台,
系统 SHALL 只在用户角色为招标人时显示"创建项目"入口,
AND 招标代理 SHALL 只能查看和处理已创建的项目,
AND 招标代理 SHALL 不能创建自行招标项目。

#### Scenario: 招标代理看不到创建按钮
GIVEN 招标代理登录并进入 /admin/projects
THEN 列表右上角没有"创建项目"按钮
AND /admin/dashboard 的快速入口也没有"创建项目"。

### Requirement: 项目列表支持详情页与阶段化编辑
WHEN 用户在项目列表点击"详情"或"编辑",
系统 SHALL 跳转到真正的项目详情页,
AND 编辑功能 SHALL 只在项目状态处于开标前阶段可用,
AND 开标后阶段 SHALL 隐藏编辑入口。

#### Scenario: 开标前项目可编辑
GIVEN 项目状态为"草稿"
WHEN 用户点击"编辑"
THEN 进入项目编辑页并可保存。

#### Scenario: 开标后项目不可编辑
GIVEN 项目状态为"待开标"
WHEN 用户查看操作列
THEN 不显示"编辑"按钮。

### Requirement: 项目列表增加发标操作
WHEN 项目处于可发标状态,
系统 SHALL 在项目列表/详情提供"发标"按钮,
AND 发标后项目状态变为"招标中"。

#### Scenario: 草稿项目发标
GIVEN 项目状态为"草稿"且信息完整
WHEN 用户点击"发标"并确认
THEN 项目状态更新为"招标中"
AND 门户公告列表出现该招标公告。

### Requirement: 邀请招标支持选择投标人
WHEN 项目采购方式为"邀请招标",
系统 SHALL 在项目创建/编辑页提供邀请投标人入口,
AND 支持从平台已注册企业选择或输入邀请码邀请外部企业。

#### Scenario: 选择已注册企业
GIVEN 用户创建邀请招标项目
WHEN 进入"标段/供应商"步骤
THEN 可选择已注册供应商
AND 被邀请企业收到邀请通知。

### Requirement: 标段预算与项目预算联动
WHEN 用户填写标段预算,
系统 SHALL 自动校验标段预算合计 ≤ 项目预算,
AND 超标时给出提示并不允许提交。

#### Scenario: 标段合计超过总预算
GIVEN 项目预算为 100 万元
WHEN 添加两个标段预算分别为 60 万元和 70 万元
THEN 系统提示"标段预算合计超过项目预算"。

### Requirement: 需求编号字段可理解
WHEN 用户看到"需求编号"字段,
系统 SHALL 提供字段说明或占位提示,
AND 该字段 SHALL 关联正式需求单号或支持为空。

#### Scenario: 查看需求编号提示
GIVEN 用户进入项目创建第二步
WHEN 聚焦"需求编号"输入框
THEN 显示提示"关联年度采购计划或临时采购申请单号，非必填"。


<!-- Merged from fix-project-creation-20260714 / project-management -->

## ADDED Requirements

### Requirement: 采购需求独立管理
WHEN 招标人进入采购需求模块,
系统 SHALL 提供需求发布、类型管理、需求草稿、需求已发布/已审核视图,
AND 采购需求 SHALL 包含需求类型、需求标题、预算金额、具体需求内容,
AND 创建项目时 SHALL 可关联已发布的采购需求。

#### Scenario: 创建项目关联采购需求
GIVEN 存在一条已发布的采购需求
WHEN 用户创建项目并选择该需求
THEN 项目详情中展示关联的采购需求信息。

### Requirement: 标段独立配置采购方式与费用时间
WHEN 用户配置项目标段,
系统 SHALL 允许每个标段独立设置采购方式、标书费、保证金、投标开始时间、投标截止时间,
AND 不同标段的采购方式 SHALL 允许不同。

#### Scenario: 多标段不同采购方式
GIVEN 项目包含两个标段
WHEN 标段一选择"公开招标"、标段二选择"邀请询比价"
THEN 两个标段分别按各自采购方式流转。

### Requirement: 项目组织方式选择
WHEN 用户创建项目,
系统 SHALL 在第一步提供"组织方式"选择：自行招标 / 委托代理,
AND 选择"自行招标"时项目成员 SHALL 仅包含招标方人员,
AND 选择"委托代理"时 SHALL 选择代理机构，代理机构确认委托合同后方可加入项目成员。

#### Scenario: 委托代理创建项目
GIVEN 用户创建项目并选择"委托代理"
WHEN 选择代理机构并提交
THEN 项目等待代理机构确认委托合同
AND 确认后代理机构人员加入项目成员。


<!-- Merged from add-award-stage-gating-20260717 / project-management -->

## MODIFIED Requirements

### Requirement: 定标与归档页面按项目维度展示
原能力：确认中标人、中标通知书、合同归档写死单一项目。
现修改：系统 SHALL 在三个页面提供项目选择，页面内容 SHALL 按所选项目渲染。

#### Scenario: 切换项目
GIVEN 招标人进入中标通知书页
WHEN 切换所选项目
THEN 通知书标题、项目信息、中标人随项目联动更新。

## ADDED Requirements

### Requirement: 定标/通知书/归档按项目阶段门禁
<!-- 2026-07-17 新口径修订：无合同归档环节，门禁链终于中标通知书，本条被文末 remove-deprecated-flows 合并块的 MODIFIED 版本取代 -->
WHEN 项目未到达对应业务阶段（确认中标人需评标完成；中标通知书需已确认中标人；合同归档需通知书已发出）,
系统 SHALL 锁定对应操作并提示当前不可操作的原因,
AND 到达阶段后 SHALL 允许操作并将项目状态推进到下一阶段。

#### Scenario: 未达阶段阻断
GIVEN 项目仍处于「招标中」
WHEN 招标人打开确认中标人页
THEN 页面提示「项目尚未完成评标，暂不可确认中标人」
AND 确认操作禁用。

#### Scenario: 阶段流转
GIVEN 项目已评标完成
WHEN 招标人确认中标人
THEN 项目状态推进为「已确认中标人」
AND 中标通知书页面对该项目解锁。


<!-- Merged from add-purchase-method-flow-20260717 / project-management -->

## MODIFIED Requirements

### Requirement: 项目业务流程按采购方式分流
原能力：所有采购方式的项目统一经过开标、评标、定标等固定流程节点。
现修改：系统 SHALL 按项目/标段的采购方式（公开招标、邀请招标、公开询比价、邀请询比价）驱动流程节点显隐与页面可达性；四种方式环节一致，唯邀请询比价 SHALL 跳过开标与评标环节，报价截止后直接进入采购结果（清单 20）。

#### Scenario: 邀请询比价跳过开标评标
GIVEN 项目采购方式为「邀请询比价」
WHEN 供应商报价截止
THEN 项目不进入开标、评标环节
AND 直接推进到定标/采购结果阶段。

#### Scenario: 邀请询比价无开标评标入口
GIVEN 项目采购方式为「邀请询比价」
WHEN 招标人或投标人查看该项目可用操作
THEN 不显示开标大厅、评标大厅入口
AND 直接访问开标/评标页面时被阻断并提示该采购方式无此环节。

#### Scenario: 其他采购方式保持完整链路
GIVEN 项目采购方式为公开招标、邀请招标或公开询比价
WHEN 项目按流程推进
THEN 开标、评标、定标节点及页面可达性与现有行为一致。

### Requirement: 项目跟踪时间线按采购方式渲染
原能力：ProjectTrack 对所有项目渲染固定流程节点。
现修改：项目跟踪时间线与投标人项目中心操作入口 SHALL 按项目采购方式渲染，邀请询比价 SHALL NOT 出现开标、评标节点及相关操作入口。

#### Scenario: 邀请询比价时间线
GIVEN 项目采购方式为「邀请询比价」
WHEN 查看项目跟踪时间线
THEN 节点序列不含开标、评标
AND 报价节点之后直接为采购结果相关节点。


<!-- Merged from fix-project-creation-gaps-20260715 / project-management -->

## ADDED Requirements

### Requirement: 标段必须包含完整字段
WHEN 用户在项目创建中设置标段,
系统 SHALL 要求每个标段填写名称、编号、预算、内容、采购方式、标书费、保证金、投标开始时间和投标截止时间,
AND 任一标段字段不完整 SHALL 阻断进入下一步或提交审核。

#### Scenario: 空白标段阻止提交
GIVEN 用户添加了一个标段但未填写标段名称
WHEN 点击"下一步"或"提交审核"
THEN 系统提示"标段 1 缺少标段名称"
AND 自动定位到该字段。

#### Scenario: 标段字段完整
GIVEN 用户填写了标段所有字段
WHEN 点击"下一步"
THEN 成功进入下一步。

### Requirement: 标段预算合计仍受项目预算约束
WHEN 用户填写标段预算,
系统 SHALL 自动校验标段预算合计 ≤ 项目预算,
AND 超标时 SHALL 给出提示并不允许提交。

#### Scenario: 标段合计超过总预算
GIVEN 项目预算为 100 万元
WHEN 添加两个标段预算分别为 60 万元和 70 万元
THEN 系统提示"标段预算合计超过项目预算"。

### Requirement: 项目必须选择组织方式
WHEN 用户创建项目,
系统 SHALL 要求选择组织方式：自行招标或委托代理,
AND 组织方式 SHALL 影响项目成员组成与权限边界。

#### Scenario: 自行招标
GIVEN 用户选择"自行招标"
WHEN 进入项目成员步骤
THEN 成员列表仅允许选择招标方人员
AND 招标代理无权限编辑该项目。

#### Scenario: 委托代理
GIVEN 用户选择"委托代理"
WHEN 选择代理机构并确认委托合同
THEN 代理机构人员自动加入项目成员
AND 代理机构可协助编制文件与组织开评标。

### Requirement: 采购方式文案正确
WHEN 用户查看采购方式选项,
系统 SHALL 显示"公开招标"、"邀请招标"、"公开询比价"、"邀请询比价",
AND SHALL 不出现"单一来源"。

#### Scenario: 创建项目时选择采购方式
GIVEN 用户进入项目创建页
WHEN 打开采购方式下拉
THEN 可见"邀请询比价"
AND 不可见"单一来源"。

### Requirement: 采购需求可独立维护并被项目关联
WHEN 管理员/招标人进入采购需求模块,
系统 SHALL 支持创建、编辑、发布、审核采购需求,
AND 创建项目时 SHALL 可选择已发布的采购需求。

#### Scenario: 发布采购需求
GIVEN 用户填写采购需求标题、类型、预算、内容
WHEN 点击"发布"
THEN 需求状态变为"已发布"
AND 创建项目时可在下拉中选择该需求。

#### Scenario: 项目关联采购需求
GIVEN 用户创建项目并选择已发布采购需求
WHEN 进入项目基本信息
THEN 自动带入需求编号、预算摘要与需求内容。


<!-- Merged from fix-project-creation-review-20260717 / project-management -->

## MODIFIED Requirements

### Requirement: 采购方式仅保留在标段级
原能力：项目基本信息与标段均有「采购方式」，两级冗余。
现修改：项目级「采购方式」字段 SHALL 移除，采购方式仅在标段级设置；项目列表与详情中的采购方式 SHALL 由标段数据派生展示。

#### Scenario: 创建项目
GIVEN 招标人创建项目
WHEN 填写基本信息
THEN 不出现项目级「采购方式」字段
AND 标段设置中每个标段独立选择采购方式。

### Requirement: 采购方式枚举统一
原能力：公告、参数字典、帮助中残留「单一来源」。
现修改：全系统采购方式选项 SHALL 统一为：公开招标、邀请招标、公开询比价、邀请询比价。

#### Scenario: 发布公告
GIVEN 代理发布公告
WHEN 查看采购方式选项
THEN 选项中无「单一来源」，包含「邀请询比价」。

<!-- 2026-07-17 新口径废弃：委托合同确认时机——委托合同不用审核（需求确认清单 72），无审批节点可调整，步骤重排失去意义 -->

### Requirement: 项目列表展示新建与草稿项目
原能力：项目列表为硬编码 mock，新建/草稿项目不出现。
现修改：项目列表 SHALL 展示 projectStore 中的新建项目（待审核）与草稿，刷新后保留。

#### Scenario: 创建后入列
GIVEN 招标人完成项目创建并提交审核
WHEN 返回项目列表
THEN 新项目以「待审核」状态出现在列表中
AND 刷新页面后仍在。

## ADDED Requirements

<!-- 2026-07-17 新口径废弃：标段报名审核开关——新口径无报名环节，标段无需「报名是否需要审核」开关（需求确认清单 10/11） -->

### Requirement: 代理机构指定与委托
WHEN 招标人选择委托代理,
系统 SHALL 支持由招标人直接指定代理机构（2026-07-17 新口径：清单 71「直接指定」，不做随机抽取）,
AND 代理机构每年更换一次、由招标人授权登录（清单 18）,
AND 代理机构 SHALL 确认接受委托（清单 19）,
AND 委托合同不需要审核（清单 72）。

#### Scenario: 直接指定代理
GIVEN 招标人创建委托代理项目
WHEN 在代理机构下拉中选定机构
THEN 该机构被指定为项目代理并收到委托确认请求。

#### Scenario: 代理确认接受委托
GIVEN 招标人已指定代理机构
WHEN 代理机构确认接受委托
THEN 委托关系生效，代理机构可开展该项目招标工作。


<!-- Merged from fix-review-issues-20260714 / project-management -->

## ADDED Requirements

### Requirement: 报价字段可配置并继承到报价页
WHEN 招标人在创建项目时配置报价字段模板,
系统 SHALL 保存该模板,
AND 投标人在在线报价页 SHALL 按模板字段填写,
AND 默认保留总报价、交货期、质保期等常用字段。

#### Scenario: 配置报价字段
GIVEN 创建项目时添加"售后服务年限"报价字段
WHEN 投标人进入报价页
THEN 看到"售后服务年限"输入项
AND 提交后该字段值被保存。

### Requirement: 空白标段禁止提交
WHEN 用户在创建项目时添加标段,
系统 SHALL 校验每个标段必须填写名称、编号、预算、内容,
AND 存在空白标段时 SHALL 阻止进入下一步和提交审核。

#### Scenario: 空白标段阻止下一步
GIVEN 用户添加了标段但只填了名称
WHEN 点击"下一步"
THEN 系统提示"请完善标段信息"
AND 不进入下一步。

### Requirement: 项目跟踪按钮按角色过滤
WHEN 用户查看项目跟踪,
系统 SHALL 根据当前角色只展示该角色可执行的操作,
AND 招标人视角 SHALL 不显示投标人动作按钮。

#### Scenario: 招标人看不到上传按钮
GIVEN 招标人登录并查看某项目跟踪
WHEN 到"上传投标文件"节点
THEN 不显示"去上传"按钮
AND 只展示招标人职责内的操作入口。


<!-- Merged from remove-deprecated-flows-20260717 / project-management -->

## REMOVED Requirements

<!-- 2026-07-17 新口径废弃：标段报名审核配置——无报名环节（清单 10/11、概要二），标段不再含「报名需审核」配置；原型中该配置已随报名流一并下线 -->

## MODIFIED Requirements

### Requirement: 定标/通知书/归档按项目阶段门禁
原能力：确认中标人→中标通知书→合同归档的阶段门禁链。
现修改：无合同归档环节（清单 33、概要五；甲方已确认清单 47「合同公示」字样为旧需求残留，亦不保留），阶段门禁链 SHALL 在中标通知书发出后结束，不再包含归档节点；合同归档页面与入口已下线。

#### Scenario: 定标流程终于通知书
GIVEN 项目已发出中标通知书
WHEN 查看该项目后续可用操作
THEN 无合同归档节点与入口
AND 项目阶段推进至采购结果/完成。
