# Spec Delta: Tender Document Review Fixes

## ADDED Requirements

### Requirement: 招标文件目录可自定义
WHEN 招标人/代理进入招标文件页,
系统 SHALL 展示默认目录模板,
AND 允许新增、删除、重命名目录节点,
AND 支持拖拽调整顺序。

#### Scenario: 添加自定义目录节点
GIVEN 用户在招标文件页
WHEN 点击"添加目录"并输入"技术评分细则"
THEN 目录树新增该节点。

### Requirement: 支持一键导入招标文件模板
WHEN 用户创建新项目或编制招标文件,
系统 SHALL 提供"一键导入模板"按钮,
AND 导入后自动填充招标目录、投标人须知、评标办法等常用章节。

#### Scenario: 导入模板
GIVEN 用户在招标文件页
WHEN 选择模板"货物类公开招标"并点击导入
THEN 目录和默认内容被填充
AND 用户可在此基础上修改。

### Requirement: 评标办法编写权限不局限于代理
WHEN 项目由招标人自行组织招标,
系统 SHALL 允许招标人填写评标办法,
AND 招标代理 SHALL 仍可代填。

#### Scenario: 招标人填写评标办法
GIVEN 招标人登录并进入招标文件页
THEN "评标办法"章节可编辑
AND 保存后生效。
