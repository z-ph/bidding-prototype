# Spec Delta: 投标文件上传签章加密闭环与规则一致性

## ADDED Requirements

### Requirement: 投标文件上传提供完整动作链
WHEN 投标人进入投标文件上传页,
系统 SHALL 提供上传、签章、加密、提交的连续操作,
AND 每个动作的状态 SHALL 可见,
AND 支持重新签章和重新加密。

#### Scenario: 完整提交流程
GIVEN 投标人进入上传页
WHEN 上传文件 → 执行签章 → 执行加密 → 点击正式提交
THEN 系统提示提交成功并生成回执
AND 文件状态变为"已正式提交"。

#### Scenario: 重新加密
GIVEN 文件已加密但投标人想更换加密证书
WHEN 点击"重新加密"
THEN 文件回到待加密状态并可重新执行加密。

### Requirement: 正式提交只接受 CA 证书加密
WHEN 投标人执行正式提交,
系统 SHALL 校验投标文件是否使用 CA 证书加密,
AND 未使用 CA 证书加密 SHALL 阻断提交并提示。

#### Scenario: 密码加密不能正式提交
GIVEN 文件仅使用密码加密
WHEN 点击"正式提交"
THEN 系统提示"正式提交必须使用 CA 证书加密，当前为密码加密（仅草稿）"
AND 不生成正式回执。

#### Scenario: CA 加密正式提交
GIVEN 文件已使用 CA 证书加密
WHEN 点击"正式提交"
THEN 提交成功并生成正式回执。

### Requirement: 存在未加密文件时禁止正式提交
WHEN 投标人点击正式提交,
系统 SHALL 校验所有投标文件均已加密,
AND 存在未加密文件 SHALL 阻断提交并提示具体文件名。

#### Scenario: 未加密文件阻断
GIVEN 文件列表中存在未加密的"报价单.xlsx"
WHEN 点击"正式提交"
THEN 系统提示"报价单.xlsx 未加密，请先完成加密"
AND 不提交。
