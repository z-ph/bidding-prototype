

<!-- Merged from add-portal-org-missing-features / organization -->

## ADDED Requirements

### Requirement: 部门树可维护
WHEN 管理员进入组织机构页面,
系统 SHALL 展示企业组织树,
AND 支持新增、编辑、删除部门,
AND 支持拖拽调整部门层级。

#### Scenario: 新增部门
GIVEN 管理员选中"XX集团"
WHEN 点击"新增部门"并填写部门名称、编码、负责人
THEN 树中新增该部门节点
AND 右侧详情展示新增部门信息。

### Requirement: 子账号管理
WHEN 管理员进入子账号管理页面,
系统 SHALL 展示子账号列表（姓名、手机号、状态、部门、联系信息）,
AND 支持创建、停用、启用、编辑联系信息、重置密码。

#### Scenario: 创建子账号
GIVEN 管理员点击"新建子账号"
WHEN 填写姓名、手机号、所属部门、角色并保存
THEN 列表新增该子账号
AND 该账号可登录系统。

### Requirement: 组织数据范围与角色权限衔接
WHEN 管理员为部门或角色配置数据范围,
系统 SHALL 按"本人/本部门/本企业/全部"控制数据可见性,
AND 项目、公告等业务列表按该范围过滤。

#### Scenario: 设置部门数据范围
GIVEN 管理员选中"采购部"
WHEN 设置数据范围为"本部门"
THEN 属于采购部的子账号只能看到本部门数据
AND 不属于采购部的数据被隐藏。


<!-- Merged from complete-recruiting-remaining-tasks / org -->

## ADDED Requirements

### Requirement: 企业基本资料可持久化编辑
WHEN 企业用户进入企业档案页,
系统 SHALL 展示当前企业基本资料,
AND 允许有权限用户编辑并保存,
AND 保存后 SHALL 持久化,
AND 刷新页面后数据仍存在,
AND 非本企业用户 SHALL 只读。

#### Scenario: 保存企业资料
GIVEN 供应商登录并进入 /admin/supplier-profile
WHEN 修改注册资本并点击保存
THEN 提示保存成功
AND 刷新后显示新值。

#### Scenario: 其他企业只读
GIVEN 招标人登录
WHEN 访问供应商档案页
THEN 表单为只读状态。

### Requirement: 企业资质上传持久化与过期提示
WHEN 企业用户上传营业执照或资质证书,
系统 SHALL 保存文件信息,
AND 刷新后文件列表仍存在,
AND 对有过期日期的资质 SHALL 在临近/已过期时给出警告,
AND 无下载权限用户 SHALL 不能下载。

#### Scenario: 上传营业执照
GIVEN 供应商上传营业执照.pdf
WHEN 保存后刷新页面
THEN 营业执照仍在文件列表中。

#### Scenario: 过期资质提示
GIVEN 某资质证书已过期
WHEN 进入企业资质页
THEN 该文件显示"已过期"警告标签。

### Requirement: 准入申请提交前校验
WHEN 企业提交准入申请,
系统 SHALL 校验必填材料是否齐全,
AND 不齐全时 SHALL 阻断提交并提示缺失项,
AND 提交后状态 SHALL 变为"审核中"并锁定编辑。

#### Scenario: 资料不全不能提交
GIVEN 供应商未上传营业执照
WHEN 点击"提交准入申请"
THEN 提示"请先上传营业执照"
AND 状态不变。

### Requirement: 准入审核支持通过、驳回、退回修改
WHEN 管理员进入准入审核页,
系统 SHALL 展示待审核企业/专家列表,
AND 支持"通过"、"驳回"、"退回修改"三种操作,
AND 驳回/退回时 SHALL 要求填写原因,
AND 被退回申请人 SHALL 可查看原因并修改后重新提交。

#### Scenario: 退回修改
GIVEN 某供应商状态为"待审核"
WHEN 管理员点击"退回修改"并填写原因"营业执照不清晰"
THEN 该供应商状态变为"已退回"
AND 供应商登录后看到原因并可修改资料重新提交。

#### Scenario: 审核通过
GIVEN 某供应商资料完整
WHEN 管理员点击"通过"
THEN 状态变为"已通过"
AND 该供应商可参与后续报名投标。

### Requirement: 企业组织机构可维护
WHEN 管理员进入组织机构页,
系统 SHALL 展示企业组织树,
AND 支持新增、编辑、删除组织节点,
AND 数据 SHALL 持久化,
AND 子账号创建时 SHALL 可选择所属组织。

#### Scenario: 新增部门
GIVEN 管理员在组织机构页
WHEN 点击"新增部门"并填写名称、编码、负责人
THEN 组织树新增该节点
AND 刷新后仍存在。

#### Scenario: 子账号选择组织
GIVEN 管理员创建子账号
WHEN 填写信息时
THEN 可选择已维护的组织部门。


<!-- Merged from add-admin-missing-pages-20260717 / organization -->

## ADDED Requirements

### Requirement: 待办事项独立页面
WHEN 用户进入待办事项页,
系统 SHALL 按当前角色聚合展示待办（类型、来源、时间）,
AND 点击待办 SHALL 跳转到对应处理页面。

#### Scenario: 角色待办
GIVEN 招标人登录
WHEN 打开待办事项
THEN 展示其职责相关待办（如报名审核、异议答复、报告确认）并可跳转处理。

### Requirement: 通知管理
WHEN 管理员/招标方进入通知管理,
系统 SHALL 展示通知列表（标题、类型、接收角色、时间、状态）,
AND 支持发送通知，发送结果 SHALL 持久化并在消息中心可见。

#### Scenario: 发送通知
GIVEN 管理员填写通知标题与内容并选择接收角色
WHEN 点击发送
THEN 通知出现在列表中且对应角色消息中心可见。

### Requirement: 模板管理
WHEN 管理员进入模板管理,
系统 SHALL 展示公告与招标文件模板列表（名称、类型、更新时间、状态）,
AND 支持启停用与内容编辑并持久化。

#### Scenario: 编辑模板
GIVEN 管理员打开一个公告模板
WHEN 修改内容并保存
THEN 列表更新修改时间，刷新后内容保留。

### Requirement: 系统设置
WHEN 管理员进入系统设置,
系统 SHALL 提供演示参数配置（CA 沙箱、短信模拟、演示数据重置）并持久化,
AND 数据重置 SHALL 二次确认。

#### Scenario: 重置演示数据
GIVEN 管理员点击数据重置
WHEN 二次确认后执行
THEN 本地演示数据恢复初始状态。


<!-- Merged from fix-admin-users-tender-perm-20260717 / organization -->

## MODIFIED Requirements

### Requirement: 账号停用保护
原能力：管理员可将任意账号（含当前登录账号）直接停用，无确认、无持久化。
现修改：系统 SHALL 禁止停用当前登录账号；停用/启用账号 SHALL 二次确认；账号状态 SHALL 持久化；已停用账号登录 SHALL 被拦截并提示。

#### Scenario: 停用本人被禁止
GIVEN 管理员 admin 登录
WHEN 查看用户列表中 admin 自己的行
THEN 停用按钮禁用并提示「不能停用当前登录账号」。

#### Scenario: 停用他人生效
GIVEN 管理员停用账号 expert1 并二次确认
WHEN expert1 尝试登录
THEN 登录被拦截并提示账号已停用。

### Requirement: 新增用户校验
原能力：空表单保存也提示成功且不写入列表。
现修改：新增用户 SHALL 校验账号（必填且唯一）、姓名（必填）、角色（必选）、所属组织（必填）；校验通过 SHALL 立即写入列表并持久化。

#### Scenario: 空表阻断
GIVEN 管理员打开新增用户对话框且未填写任何字段
WHEN 点击保存
THEN 各必填字段显示校验错误，不提示保存成功。

#### Scenario: 成功入列
GIVEN 填写合法的新用户信息
WHEN 保存
THEN 列表立即出现该用户，刷新后仍在。
