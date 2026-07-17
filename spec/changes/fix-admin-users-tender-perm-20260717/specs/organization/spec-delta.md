# Spec Delta: 用户管理加固

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
