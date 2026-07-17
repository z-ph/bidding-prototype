# Spec Delta: 项目创建与列表评审问题整改

## MODIFIED Requirements

### Requirement: 采购方式仅保留在标段级
原能力：项目基本信息与标段均有「采购方式」，两级冗余。
现修改：项目级「采购方式」字段 SHALL 移除，采购方式仅在标段级设置；项目列表与详情中的采购方式 SHALL 由标段数据派生展示。

#### Scenario: 创建项目
GIVEN 招标人创建项目
WHEN 填写基本信息
THEN 不出现项目级「采购方式」字段
AND 标段设置中每个标段独立选择采购方式。

### Requirement: 采购方式枚举统一
原能力：公告、参数字典、帮助中残留「单一来源」。
现修改：全系统采购方式选项 SHALL 统一为：公开招标、邀请招标、公开询比价、邀请询比价。

#### Scenario: 发布公告
GIVEN 代理发布公告
WHEN 查看采购方式选项
THEN 选项中无「单一来源」，包含「邀请询比价」。

### Requirement: 委托合同确认时机
原能力：委托合同确认位于第 0 步「基本信息」。
现修改：委托合同确认 SHALL 在「供应商要求」填写完成后进行。

#### Scenario: 步骤顺序
GIVEN 招标人选择委托代理
WHEN 按步骤推进
THEN 完成供应商要求后才出现委托合同确认。

### Requirement: 项目列表展示新建与草稿项目
原能力：项目列表为硬编码 mock，新建/草稿项目不出现。
现修改：项目列表 SHALL 展示 projectStore 中的新建项目（待审核）与草稿，刷新后保留。

#### Scenario: 创建后入列
GIVEN 招标人完成项目创建并提交审核
WHEN 返回项目列表
THEN 新项目以「待审核」状态出现在列表中
AND 刷新页面后仍在。

## ADDED Requirements

### Requirement: 标段报名审核开关
WHEN 招标人设置标段,
系统 SHALL 提供「报名是否需要审核」开关（needRegisterAudit）并随项目持久化。

#### Scenario: 配置审核开关
GIVEN 招标人编辑标段
WHEN 打开「报名是否需要审核」并保存
THEN 项目标段数据中 needRegisterAudit 为 true。

### Requirement: 代理机构筛选与随机抽取
WHEN 招标人选择委托代理,
系统 SHALL 支持按条件（资质、服务地区、黑名单、回避单位）筛选候选机构并随机抽取,
AND 抽取结果 SHALL 进入委托合同,
AND 保留手动指定模式。

#### Scenario: 随机抽取代理
GIVEN 招标人选择「随机抽取」模式并设置筛选条件
WHEN 执行抽取
THEN 系统从符合条件的机构中随机选出一家并展示抽取结果。
