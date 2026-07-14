# Spec Delta: Organization Department, Sub-account and Data Scope

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
