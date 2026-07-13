# Spec Delta: Tender/ Bid Document Association

## ADDED Requirements

### Requirement: 招标文件必须关联项目
WHEN 招标代理/招标人编制招标文件,
系统 SHALL 要求先选择一个有效的招标项目,
AND 根据所选项目的标段与采购方式动态生成招标文件目录结构。

#### Scenario: 成功选择项目后编制文件
GIVEN 招标代理进入招标文件编制页面
WHEN 从项目下拉框选择“XX市轨道交通设备采购项目”
THEN 页面标题与项目信息联动显示
AND 目录结构中出现该项目对应的标段节点（如“第一标段：主设备”、“第二标段：辅材”）。

#### Scenario: 未选择项目时禁止生成
GIVEN 招标代理未选择任何项目
WHEN 点击“生成招标文件”按钮
THEN 系统提示“请先选择招标项目”
AND 不执行生成操作。

### Requirement: 投标文件按招标文件模板分项上传
WHEN 投标人上传投标文件,
系统 SHALL 根据所投项目的要求列出商务标、技术标、报价标等必填文件类型,
AND 投标人 SHALL 为每份上传文件指定文件类型。

#### Scenario: 按模板逐项上传
GIVEN 投标人选择“XX市轨道交通设备采购项目”
WHEN 进入投标文件上传页面
THEN 页面显示该项目要求上传：商务标、技术标、报价标
AND 已上传文件按类型分组展示。

#### Scenario: 文件类型缺失提示
GIVEN 投标人已上传商务标和技术标
WHEN 尝试提交投标文件
THEN 系统提示“缺少报价标文件”
AND 不允许提交。

### Requirement: 投标文件制作向导
WHEN 投标人下载招标文件后,
系统 SHALL 提供“制作投标文件”入口,
AND 向导页列出招标文件要求的所有文件类型及其说明。

#### Scenario: 从下载页进入向导
GIVEN 投标人位于招标文件下载页
WHEN 点击“制作投标文件”按钮
THEN 跳转至投标文件制作向导
AND 向导显示当前项目的文件类型清单与上传状态。

## MODIFIED Requirements

### Requirement: 招标文件发布流程
WHILE 系统以前允许直接编辑并发布通用招标文件,
系统 SHALL 更改为：仅在已选择项目且完成必要章节编辑后才允许发布。

#### Scenario: 发布前校验
GIVEN 招标代理已完成招标文件编辑
WHEN 点击“生成招标文件”（发布）按钮
THEN 系统校验项目已选、章节内容非空、附件已上传
AND 校验通过后才将状态变更为“已发布”。
