# Spec Delta: Opening Hall Review Fixes

## ADDED Requirements

### Requirement: 开标大厅作为项目子页面入口
WHEN 用户进入项目列表或项目跟踪,
系统 SHALL 根据项目状态显示"进入开标大厅"或"开始开标"按钮,
AND 不再在左侧菜单保留独立的"开标大厅"顶级入口。

#### Scenario: 从项目列表进入开标大厅
GIVEN 项目状态为"待开标"
WHEN 用户点击"开始开标"
THEN 跳转该项目对应的开标大厅页面。

### Requirement: 签到改为各角色状态队列
WHEN 进入开标大厅签到阶段,
系统 SHALL 展示所有参与方（招标人、代理、投标人、监督人）的签到状态,
AND 每个参与方只能签到自己的账号,
AND 主持人可查看整体签到进度。

#### Scenario: 投标人签到
GIVEN 投标人以 A 科技有限公司身份登录
WHEN 进入开标大厅
THEN 只能看到本企业对应的签到按钮
AND 不能替其他企业签到。

### Requirement: 签到完成条件可视化
WHEN 尚未全部签到,
系统 SHALL 显示"尚有 X 人未签到"及未签到名单,
AND 主持人进入开标 SHALL 需要二次确认。

#### Scenario: 缺员开标
GIVEN 3 家投标人中有 1 家未签到
WHEN 主持人点击"进入开标"
THEN 弹窗提示缺员名单
AND 用户确认后才可继续。

### Requirement: 投标文件解密仅投标人可操作
WHEN 进入解密阶段,
系统 SHALL 只向各投标人自己的投标文件显示"解密"按钮,
AND 招标人/代理只能查看解密状态,
AND 解密失败可标记为废标。

#### Scenario: 投标人解密自己的文件
GIVEN A 科技有限公司登录
WHEN 点击"解密"
THEN 只有 A 科技的投标文件被解密
AND 主持人视角显示"已解密"。
