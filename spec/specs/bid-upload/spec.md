# bid-upload Specification

## Requirements

<!-- Merged from fix-review-issues-20260714 / bid-upload -->

### Requirement: 投标文件上传提供完整动作链
WHEN 投标人进入投标文件上传页,
系统 SHALL 提供上传、签章、加密、提交的连续操作,
AND 每个动作的状态 SHALL 可见,
AND 支持重新加密。

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

### Requirement: 投标文件与招标文件评审条款关联
WHEN 投标人上传投标文件,
系统 SHALL 展示招标文件评审条款列表,
AND 允许用户把投标文件内容逐项关联到条款,
AND 关联关系 SHALL 持久化。

#### Scenario: 关联条款
GIVEN 招标文件有"技术参数响应"条款
WHEN 投标人上传技术方案.pdf 并关联到该条款
THEN 系统记录关联关系
AND 专家评标时可在该条款下查看对应投标文件内容。
