

<!-- Merged from page-review-20260714-fixes / evaluation-hall -->

## ADDED Requirements

### Requirement: 评标任务以项目列表形式呈现
WHEN 专家进入评标任务页,
系统 SHALL 展示待评标的项目列表,
AND 点击项目后进入该项目评标详情,
AND 不再是单项目窗口。

#### Scenario: 专家查看评标任务列表
GIVEN 专家登录
WHEN 进入"评标任务"
THEN 看到多个待评标项目卡片/列表
AND 点击后进入评标详情。

### Requirement: 评标组长有独立流程
WHEN 专家被指定为评标组长,
系统 SHALL 在评标流程中增加组长操作入口,
AND 组长可查看统计评标结果、汇总评分、生成评标报告。

#### Scenario: 组长统计结果
GIVEN 专家甲为组长
WHEN 所有专家完成评分
THEN 组长点击"统计评标结果"
AND 系统生成汇总报告。

### Requirement: 查阅资料入口统一
WHEN 专家进入评标详情,
系统 SHALL 在评标流程步骤中提供"查阅资料"入口,
AND 不再作为左侧主导航项。

#### Scenario: 专家查看招标文件资料
GIVEN 专家进入某项目评标
WHEN 点击步骤中的"查阅资料"
THEN 打开招标文件/投标文件查阅面板。


<!-- Merged from fix-evaluation-hall-role-split-20260717 / evaluation-hall -->

## MODIFIED Requirements

### Requirement: 评标大厅按角色渲染
原能力：所有角色进入评标大厅看到同一页面与同一批操作。
现修改：系统 SHALL 按当前角色渲染差异化视图与操作——代理组织与汇总并提交结果；招标人只读查看评标进度与报告确认；专家只读查看汇总进度；监督只读并登记监督意见。

#### Scenario: 专家视角
GIVEN 专家登录并进入评标大厅
WHEN 页面渲染
THEN 不显示「提交评标结果」「保存评标报告」等组织类按钮
AND 引导其前往评标任务完成本人评分。

#### Scenario: 监督视角
GIVEN 监督人员登录
WHEN 进入评标大厅
THEN 仅可查看进度与汇总，并可登记监督意见
AND 不出现任何提交类按钮。

### Requirement: 提交评标结果的角色与前置控制
原能力：「提交评标结果」对所有进入者可见，仅以写死状态拦截。
现修改：「提交评标结果」SHALL 仅对代理（评标组织人）渲染；全部专家提交前按钮 SHALL 禁用；系统 SHALL 展示未提交专家名单；提交 SHALL 二次确认。

#### Scenario: 未全部提交禁用
GIVEN 专家丙尚未提交评分
WHEN 代理查看提交区域
THEN 「提交评标结果」为禁用状态
AND 页面显示未提交专家名单（含专家丙）。

#### Scenario: 越权不可见
GIVEN 专家或监督通过地址直接进入评标大厅
WHEN 页面渲染
THEN 不出现「提交评标结果」按钮。

## ADDED Requirements

### Requirement: 招标人评标进度只读视角
WHEN 招标人在开标完成后点击「进入评标大厅」,
系统 SHALL 允许进入并展示只读评标进度（专家提交状态、评分汇总、评标报告）,
AND 不提供任何修改/提交操作。

#### Scenario: 开标后进入评标
GIVEN 招标人完成开标唱标
WHEN 点击「进入评标大厅」
THEN 进入只读进度页而非无权限页。


<!-- Merged from harden-expert-evaluation-flow-20260717 / evaluation-hall -->

## ADDED Requirements

### Requirement: 评标操作状态持久化
WHEN 专家在评标页修改评分、评审意见、签名或提交状态,
系统 SHALL 将状态持久化到本地存储,
AND 刷新或重新进入页面后 SHALL 恢复该状态。

#### Scenario: 刷新不丢
GIVEN 专家已对投标人打分并填写意见
WHEN 刷新页面后重新进入同一项目评标
THEN 评分、意见、签名与提交锁定状态均恢复。

### Requirement: 评标组长实时推选
WHEN 评标流程进入推选组长步骤,
系统 SHALL 不默认设定组长,
AND 允许成员实时推选与改选,
AND 未选出组长时 SHALL 阻断进入在线评分。

#### Scenario: 未选组长阻断
GIVEN 评标任务初始无组长
WHEN 专家未推选组长直接点击下一步
THEN 系统提示「请先推选评标组长」并停留在当前步骤。

### Requirement: 电子签名后评分锁定
WHEN 专家完成电子签名,
系统 SHALL 立即锁定评分与评审意见,
AND 「返回修改」仅在撤销签名并记录原因后可用。

#### Scenario: 签名后禁止改分
GIVEN 专家已完成电子签名
WHEN 返回在线评分步骤
THEN 评分与意见输入为只读
AND 点击「返回修改」时要求先撤销签名并填写撤销原因。

### Requirement: 评标报告实体化
WHEN 组长生成评标报告,
系统 SHALL 创建持久化报告对象，包含报告编号、版本、内容（评分汇总、委员会意见、推荐候选人）、专家签名状态、生成时间,
AND 提供预览、下载入口与归档记录,
AND 项目状态 SHALL 联动为评标完成。

#### Scenario: 报告生成与归档
GIVEN 全部专家已提交并签名
WHEN 组长点击「生成评标报告」
THEN 系统展示报告预览（编号/版本/内容/签名状态/生成时间）
AND 提供下载入口
AND 归档记录中可查看该报告。

### Requirement: 评标任务限时提交与过期阻断
WHEN 评标任务超过截止时间,
系统 SHALL 在任务列表标记「已过期」并禁止进入评标与提交,
AND 页面 SHALL 明示评标为限时提交制（截止前可随时提交，无需全程在线）。

#### Scenario: 过期任务阻断
GIVEN 任务截止时间已过
WHEN 专家点击「进入评标」
THEN 系统阻断并提示任务已过期。

### Requirement: 评分时资料佐证
WHEN 专家处于在线评分步骤,
系统 SHALL 提供资料查阅入口（侧栏或抽屉）,
AND 展示招标文件与投标文件的真实内容供对照评分。

#### Scenario: 评分中查阅资料
GIVEN 专家在在线评分步骤
WHEN 点击「查阅资料」
THEN 打开资料侧栏并展示真实文件内容，而非提示消息。

## MODIFIED Requirements

### Requirement: 专家抽取条件与反馈
原能力：按专业领域/回避单位随机抽取并通知。
现修改：抽取条件 SHALL 增加地区与黑名单；抽取结果 SHALL 含正式名单与备选名单；专家确认/拒绝反馈 SHALL 持久化并在抽取记录可见；抽取结果 SHALL 可导出；人数不足时 SHALL 支持补抽。

#### Scenario: 条件抽取与反馈
GIVEN 代理设置专业、地区、回避单位、黑名单条件
WHEN 执行抽取
THEN 生成正式+备选名单
AND 专家确认/拒绝后反馈记录在抽取记录中
AND 可导出抽取结果。
