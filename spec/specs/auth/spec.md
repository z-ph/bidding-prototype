

<!-- Merged from complete-recruiting-remaining-tasks / auth -->

## ADDED Requirements

### Requirement: 账号密码登录完整校验
WHEN 用户在登录页输入账号密码,
系统 SHALL 校验字段非空,
AND 提交后 SHALL 验证账号密码正确性,
AND 错误时给出明确提示,
AND 登录成功后 SHALL 持久化登录态。

#### Scenario: 正确账号登录
GIVEN 用户输入正确账号密码
WHEN 点击登录
THEN 跳转对应角色工作台
AND 刷新页面后仍保持登录。

#### Scenario: 错误账号登录
GIVEN 用户输入错误密码
WHEN 点击登录
THEN 提示"账号或密码错误"
AND 不跳转。

### Requirement: 当前用户信息与退出
WHEN 用户已登录并进入后台,
系统 SHALL 在顶部栏显示当前用户名、角色、组织,
AND 点击退出 SHALL 清除登录态,
AND 退出后访问后台 URL SHALL 自动跳转登录页。

#### Scenario: 退出后访问后台
GIVEN 用户已退出
WHEN 直接访问 /admin/projects
THEN 自动跳转到 /login。

### Requirement: 注册流程完整校验
WHEN 用户注册,
系统 SHALL 要求选择角色,
AND 必须勾选用户协议,
AND 按角色展示对应必填字段,
AND 提交后资料 SHALL 持久化并进入审核状态。

#### Scenario: 供应商注册
GIVEN 用户选择供应商角色
WHEN 填写企业信息、上传营业执照、勾选协议并提交
THEN 提示"注册信息已提交，等待审核"
AND 刷新后仍能看到审核状态。

#### Scenario: 未勾选协议不能提交
GIVEN 用户未勾选用户协议
WHEN 点击提交
THEN 提示"请阅读并同意用户协议"。

### Requirement: 手机验证码登录（演示环境）
WHEN 用户选择手机验证码登录,
系统 SHALL 支持输入手机号,
AND 点击获取验证码后 SHALL 进入倒计时并限制频繁发送,
AND 演示环境 SHALL 使用固定验证码完成登录,
AND 真实环境 SHALL 预留短信接口。

#### Scenario: 演示验证码登录
GIVEN 用户输入手机号并点击获取验证码
WHEN 输入演示验证码 123456
THEN 登录成功。

### Requirement: CA 登录入口与证书提示（演示环境）
WHEN 用户选择 CA 登录,
系统 SHALL 提示插入 CA UKey,
AND 演示环境 SHALL 模拟证书检测,
AND 异常时 SHALL 给出明确原因（未插入、驱动未安装、证书过期等）。

#### Scenario: 未插入 UKey
GIVEN 用户点击"检测证书并登录"
WHEN 未插入 UKey
THEN 提示"未检测到 CA 证书，请插入 UKey"。
