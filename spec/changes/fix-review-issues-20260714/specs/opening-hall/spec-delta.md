# Spec Delta: Opening Hall Decryption Permission and Text Consistency

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
