

<!-- Merged from page-review-20260714-fixes / common -->

## ADDED Requirements

### Requirement: 敏感操作增加确认弹窗
WHEN 用户执行发标、开标、解密、定标、驳回等敏感操作,
系统 SHALL 弹出二次确认对话框,
AND 用户确认后才执行操作。

#### Scenario: 发标确认
GIVEN 用户点击"发标"
WHEN 确认弹窗出现
AND 用户点击"确认"
THEN 项目状态更新为"招标中"。

### Requirement: 主页/工作台命名与入口统一
WHEN 用户登录后进入后台,
系统 SHALL 统一使用"工作台"作为首个菜单名称,
AND 面包屑与菜单文案保持一致。

#### Scenario: 管理员查看菜单
GIVEN 管理员登录
WHEN 查看左侧菜单第一项
THEN 显示"工作台"而不是"主页"。


<!-- Merged from fix-common-interactions-20260715 / common -->

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


<!-- Merged from fix-admin-users-tender-perm-20260717 / common -->

## MODIFIED Requirements

### Requirement: 退出登录确认
原能力：点击退出按钮立即退出，无确认。
现修改：点击退出登录 SHALL 弹出二次确认（提示未保存内容可能丢失），确认后才清除会话并返回登录页。

#### Scenario: 确认退出
GIVEN 用户已登录后台
WHEN 点击「退出」并在弹窗中确认
THEN 退出登录并返回登录页
AND 未登录访问后台被拦截。

#### Scenario: 取消退出
GIVEN 用户点击「退出」
WHEN 在确认弹窗中取消
THEN 保持当前会话与页面不变。
