# Spec Delta: 通用交互与状态提示统一

## ADDED Requirements

### Requirement: 关键表单提交前执行全量校验
WHEN 用户点击表单提交或进入下一步,
系统 SHALL 对所有字段执行校验,
AND 校验失败 SHALL 自动滚动并聚焦到首个错误字段,
AND SHALL 在对应字段附近显示错误信息。

#### Scenario: ProjectCreate 提交审核
GIVEN 用户填写项目创建表单但标段名称为空
WHEN 点击"提交审核"
THEN 系统阻断提交
AND 自动滚动到标段名称字段
AND 显示"请输入标段名称"。

### Requirement: 操作成功后页面状态同步更新
WHEN 用户完成发标、开标、提交标书、审批等关键操作,
系统 SHALL 更新当前页面状态与按钮展示,
AND 同步更新关联列表/详情数据,
AND 在操作记录区域新增一条记录,
AND 提示信息说明下一步操作。

#### Scenario: 项目发标
GIVEN 项目状态为"草稿"
WHEN 用户点击"发标"并确认
THEN 项目状态变为"招标中"
AND 项目列表对应行状态同步更新
AND 提示"发标成功，供应商现在可以报名"
AND 操作记录新增"发标"记录。

### Requirement: 统一空状态/失败状态/重试引导
WHEN 页面处于加载中、无数据、加载失败或无权限状态,
系统 SHALL 使用统一组件展示,
AND 空状态 SHALL 说明原因并提供推荐操作,
AND 加载失败 SHALL 保留用户已填写内容并提供重试按钮,
AND 无权限 SHALL 说明角色与可申请权限。

#### Scenario: 列表无数据
GIVEN 某列表当前没有数据
WHEN 用户访问该列表
THEN 显示"暂无数据"与"去创建"按钮。

#### Scenario: 接口加载失败
GIVEN 某页面加载数据失败
WHEN 用户看到失败提示
THEN 保留已填写内容
AND 显示"重新加载"按钮。

### Requirement: 业务页面展示当前状态与下一步提示
WHEN 用户进入流程跟踪、开标大厅、评标大厅等业务页面,
系统 SHALL 在首屏展示当前状态、当前节点、截止时间,
AND SHALL 显示下一步推荐操作,
AND 不能继续时 SHALL 说明阻断原因。

#### Scenario: 项目跟踪
GIVEN 投标人查看项目跟踪
WHEN 页面加载完成
THEN 首屏显示"当前阶段：报名中"
AND 显示"下一步：缴纳文件费"
AND 若已截止则显示"已截止，无法报名"。
