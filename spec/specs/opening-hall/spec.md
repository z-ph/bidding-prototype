

<!-- Merged from page-review-20260714-fixes / opening-hall -->

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


<!-- Merged from fix-evaluation-hall-role-split-20260717 / opening-hall -->

## ADDED Requirements

### Requirement: 开标准备指定主持人与监督人
WHEN 代理机构进入开标大厅且开标未开始,
系统 SHALL 提供指定主持人与监督人的配置（可从人员中选择或手动输入）,
AND 配置 SHALL 持久化,
AND 签到表与唱标环节 SHALL 使用所配置的人员名单。

#### Scenario: 指定并生效
GIVEN 代理在开标前指定主持人为「王五」、监督人为「赵监督」
WHEN 进入签到环节
THEN 签到表显示王五（主持人）、赵监督（监督人）等待签到
AND 刷新页面后配置保留。


<!-- Merged from fix-review-issues-20260714 / opening-hall -->

## ADDED Requirements

### Requirement: 仅投标人可解密本企业投标文件
WHEN 进入开标大厅解密阶段,
系统 SHALL 只向当前登录投标人展示其所属企业的"解密"按钮,
AND 招标人、招标代理、监督人员 SHALL 只能查看解密状态,
AND 任何角色 SHALL 不能代替其他投标人解密。

#### Scenario: 投标人解密自己企业
GIVEN A 科技有限公司以投标人身份登录
WHEN 进入开标大厅
THEN 只能看到 A 科技有限公司对应的解密按钮
AND 点击后该投标文件状态变为"已解密"。

#### Scenario: 招标人无法替投标人解密
GIVEN 招标人登录
WHEN 进入开标大厅
THEN 解密按钮对所有投标人都不显示
AND 只能看到"解密中"/"已解密"状态。

### Requirement: 开标大厅步骤文案与签到表一致
WHEN 展示开标流程步骤和签到表,
系统 SHALL 保持描述对象一致,
AND 若专家不参与签到 SHALL 从步骤文案中移除"专家",
AND 若专家参与 SHALL 在签到表中体现专家列。

#### Scenario: 专家不参与开标签到
GIVEN 开标大厅签到表只有招标人、代理、投标人、监督人
WHEN 查看步骤描述
THEN 步骤描述不写"专家签到"。
