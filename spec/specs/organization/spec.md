

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
