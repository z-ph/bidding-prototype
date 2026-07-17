

<!-- Merged from page-review-20260714-fixes / tender-doc -->

## ADDED Requirements

### Requirement: 招标文件目录可自定义
WHEN 招标人/代理进入招标文件页,
系统 SHALL 展示默认目录模板,
AND 允许新增、删除、重命名目录节点,
AND 支持拖拽调整顺序,
AND 目录变更 SHALL 纳入版本记录。

#### Scenario: 添加自定义目录节点
GIVEN 用户在招标文件页
WHEN 点击"添加目录"并输入"技术评分细则"
THEN 目录树新增该节点。

### Requirement: 支持一键导入招标文件模板
WHEN 用户创建新项目或编制招标文件,
系统 SHALL 提供"一键导入模板"按钮,
AND 导入后自动填充招标目录、投标人须知、评标办法等常用章节。

#### Scenario: 导入模板
GIVEN 用户在招标文件页
WHEN 选择模板"货物类公开招标"并点击导入
THEN 目录和默认内容被填充
AND 用户可在此基础上修改。

### Requirement: 评标办法编写权限不局限于代理
WHEN 项目由招标人自行组织招标,
系统 SHALL 允许招标人填写评标办法,
AND 招标代理 SHALL 仍可代填。

#### Scenario: 招标人填写评标办法
GIVEN 招标人登录并进入招标文件页
THEN "评标办法"章节可编辑
AND 保存后生效。


<!-- Merged from fix-tender-document-20260714 / tender-doc -->

## ADDED Requirements

### Requirement: 招标文件引用结构化公告字段
WHEN 招标人/代理查看招标文件,
系统 SHALL 将项目名称、项目编号、开标时间、截止时间、评标方法、开标一览表、报价字段配置作为结构化字段展示,
AND 这些字段 SHALL 在项目创建/标段配置中维护,
AND 招标文件页面 SHALL 只读引用或按模板渲染。

#### Scenario: 招标文件展示结构化字段
GIVEN 项目标段已配置开标时间与评标方法
WHEN 用户打开招标文件页
THEN 招标公告部分展示与标段配置一致的开标时间与评标方法。

### Requirement: 投标人可质疑招标文件
WHEN 投标人进入"项目中心 / 招标文件下载"页面,
系统 SHALL 提供"质疑招标文件"按钮,
AND 点击后 SHALL 弹出表单：质疑类型（商务/技术/其他）、质疑内容、附件上传,
AND 质疑提交后招标人/代理 SHALL 可在"异议管理"中查看与回复。

#### Scenario: 投标人提交质疑
GIVEN 投标人已登录并进入招标文件下载页
WHEN 点击"质疑招标文件"并填写类型、内容后提交
THEN 招标人/代理在异议管理中看到该质疑并可回复。


<!-- Merged from fix-review-issues-20260714 / tender-doc -->

## ADDED Requirements

### Requirement: 评标办法配置驱动专家评分
WHEN 招标人或代理在招标文件中配置评标办法,
系统 SHALL 支持定义评分项、权重、否决规则,
AND 专家评分页 SHALL 按配置渲染评分维度,
AND 评标汇总 SHALL 按配置计算总分和排名。

#### Scenario: 配置评分项
GIVEN 评标办法配置：商务 20、技术 50、价格 30
WHEN 专家进入评分页
THEN 看到商务、技术、价格三个评分项及对应权重
AND 输入分数后按权重汇总。

#### Scenario: 否决规则生效
GIVEN 评标办法配置"技术分低于 20 分否决"
WHEN 某投标人技术分 15 分
THEN 系统自动标记为否决
AND 不进入总分排名。

### Requirement: 文件版本统一链
WHEN 招标文件附件发生变更,
系统 SHALL 更新版本号,
AND 招标文件页、下载页、专家查阅页 SHALL 引用同一文件对象和版本,
AND 非最新版本 SHALL 明确提示。

#### Scenario: 版本变更同步
GIVEN 管理员更新招标文件附件到 V2.0
WHEN 投标人访问下载页、专家访问查阅页
THEN 两处都显示 V2.0
AND V1.0 显示"已过期"或"非当前版本"。

#### Scenario: 旧版本提示
GIVEN 投标人已下载 V1.0
WHEN 管理员发布 V2.0
THEN 投标人再次进入下载页看到"当前有效版本为 V2.0，您此前下载的 V1.0 已过期"。


<!-- Merged from enhance-tender-doc-association / tender-doc -->

## ADDED Requirements

### Requirement: 招标文件必须关联项目
WHEN 招标代理/招标人编制招标文件,
系统 SHALL 要求先选择一个有效的招标项目,
AND 根据所选项目的标段与采购方式动态生成招标文件目录结构。

#### Scenario: 成功选择项目后编制文件
GIVEN 招标代理进入招标文件编制页面
WHEN 从项目下拉框选择“XX市轨道交通设备采购项目”
THEN 页面标题与项目信息联动显示
AND 目录结构中出现该项目对应的标段节点（如“第一标段：主设备”、“第二标段：辅材”）。

#### Scenario: 未选择项目时禁止生成
GIVEN 招标代理未选择任何项目
WHEN 点击“生成招标文件”按钮
THEN 系统提示“请先选择招标项目”
AND 不执行生成操作。

### Requirement: 投标文件按招标文件模板分项上传
WHEN 投标人上传投标文件,
系统 SHALL 根据所投项目的要求列出商务标、技术标、报价标等必填文件类型,
AND 投标人 SHALL 为每份上传文件指定文件类型。

#### Scenario: 按模板逐项上传
GIVEN 投标人选择“XX市轨道交通设备采购项目”
WHEN 进入投标文件上传页面
THEN 页面显示该项目要求上传：商务标、技术标、报价标
AND 已上传文件按类型分组展示。

#### Scenario: 文件类型缺失提示
GIVEN 投标人已上传商务标和技术标
WHEN 尝试提交投标文件
THEN 系统提示“缺少报价标文件”
AND 不允许提交。

### Requirement: 投标文件制作向导
WHEN 投标人下载招标文件后,
系统 SHALL 提供“制作投标文件”入口,
AND 向导页列出招标文件要求的所有文件类型及其说明。

#### Scenario: 从下载页进入向导
GIVEN 投标人位于招标文件下载页
WHEN 点击“制作投标文件”按钮
THEN 跳转至投标文件制作向导
AND 向导显示当前项目的文件类型清单与上传状态。

## MODIFIED Requirements

### Requirement: 招标文件发布流程
WHILE 系统以前允许直接编辑并发布通用招标文件,
系统 SHALL 更改为：仅在已选择项目且完成必要章节编辑后才允许发布。

#### Scenario: 发布前校验
GIVEN 招标代理已完成招标文件编辑
WHEN 点击“生成招标文件”（发布）按钮
THEN 系统校验项目已选、章节内容非空、附件已上传
AND 校验通过后才将状态变更为“已发布”。


<!-- Merged from fix-tender-doc-versioning-20260715 / tender-doc -->

## ADDED Requirements

### Requirement: 招标公告使用结构化字段
WHEN 用户发布招标公告,
系统 SHALL 要求填写项目名称、项目编号、采购方式、开标时间、开标地点、评标方法、开标一览表字段、联系人、联系电话等结构化字段,
AND 富文本编辑器 SHALL 仅用于正文补充说明。

#### Scenario: 发布公告
GIVEN 用户进入公告发布页
WHEN 填写结构化字段并发布
THEN 门户公告详情展示这些字段
AND 下载页/专家页可引用同一公告对象。

### Requirement: 招标文件支持版本链
WHEN 用户编制或修改招标文件,
系统 SHALL 生成新的版本记录,
AND 已发布版本 SHALL 不可直接覆盖,
AND 下载页、专家查阅页 SHALL 引用当前有效版本。

#### Scenario: 发布新版本
GIVEN 招标文件已发布 v1.0
WHEN 招标人编辑并重新发布
THEN 生成 v1.1
AND 已发布 v1.0 保留为历史版本。

#### Scenario: 专家查阅当前版本
GIVEN 招标文件已更新到 v1.1
WHEN 专家进入查阅资料
THEN 看到 v1.1 内容
AND 显示版本号与发布时间。

### Requirement: 招标文件有明确的状态流转
WHEN 用户操作招标文件,
系统 SHALL 展示当前状态：编辑中、预览中、待确认、已确认、已发布,
AND  SHALL 显示编制人与确认人。

#### Scenario: 发布前检查
GIVEN 招标文件状态为"待确认"
WHEN 点击"发布"
THEN 系统执行发布前检查
AND 检查通过后才变为"已发布"。

### Requirement: 投标人可质疑招标文件
WHEN 投标人查看可下载的招标文件或公告详情,
系统 SHALL 提供"质疑招标文件"入口,
AND 允许提交质疑内容、附件。

#### Scenario: 提交质疑
GIVEN 投标人下载招标文件后发现问题
WHEN 点击"质疑"并填写内容
THEN 系统记录质疑
AND 招标人/代理在异议管理页收到该质疑。

## REMOVED Requirements

<!-- Removed 2026-07-17: 招标文件复核人字段——"复核人"字段因需求文档未明确依据，予以移除；编制人与确认人信息在状态流转中展示。（living spec 中无同名需求块，故仅记录移除说明） -->


<!-- Merged from fix-admin-users-tender-perm-20260717 / tender-doc -->

## MODIFIED Requirements

### Requirement: 招标文件编制权限
原能力：招标人与代理均可编辑招标文件（仅按角色判断）。
现修改：系统 SHALL 按「角色 + 项目组织方式」控制编制入口——自行招标模式下招标人、代理均可编制；委托代理模式下仅代理可编制，招标人 SHALL 只读且不显示编辑入口，并说明原因。

#### Scenario: 委托代理下招标人只读
GIVEN 项目组织方式为委托代理
WHEN 招标人打开招标文件页
THEN 不显示编辑/编制入口
AND 页面提示「委托代理项目由代理机构编制招标文件」。

#### Scenario: 自行招标下招标人可编制
GIVEN 项目组织方式为自行招标
WHEN 招标人打开招标文件页
THEN 可正常编辑招标文件。
