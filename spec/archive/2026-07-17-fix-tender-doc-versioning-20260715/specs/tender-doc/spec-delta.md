# Spec Delta: 招标文件版本、结构化字段与质疑入口

## ADDED Requirements

### Requirement: 招标公告使用结构化字段
WHEN 用户发布招标公告,
系统 SHALL 要求填写项目名称、项目编号、采购方式、开标时间、开标地点、评标方法、开标一览表字段、联系人、联系电话等结构化字段,
AND 富文本编辑器 SHALL 仅用于正文补充说明。

#### Scenario: 发布公告
GIVEN 用户进入公告发布页
WHEN 填写结构化字段并发布
THEN 门户公告详情展示这些字段
AND 下载页/专家页可引用同一公告对象。

### Requirement: 招标文件支持版本链
WHEN 用户编制或修改招标文件,
系统 SHALL 生成新的版本记录,
AND 已发布版本 SHALL 不可直接覆盖,
AND 下载页、专家查阅页 SHALL 引用当前有效版本。

#### Scenario: 发布新版本
GIVEN 招标文件已发布 v1.0
WHEN 招标人编辑并重新发布
THEN 生成 v1.1
AND 已发布 v1.0 保留为历史版本。

#### Scenario: 专家查阅当前版本
GIVEN 招标文件已更新到 v1.1
WHEN 专家进入查阅资料
THEN 看到 v1.1 内容
AND 显示版本号与发布时间。

### Requirement: 招标文件有明确的状态流转
WHEN 用户操作招标文件,
系统 SHALL 展示当前状态：编辑中、预览中、待确认、已确认、已发布,
AND  SHALL 显示编制人与确认人。

#### Scenario: 发布前检查
GIVEN 招标文件状态为"待确认"
WHEN 点击"发布"
THEN 系统执行发布前检查
AND 检查通过后才变为"已发布"。

### Requirement: 投标人可质疑招标文件
WHEN 投标人查看可下载的招标文件或公告详情,
系统 SHALL 提供"质疑招标文件"入口,
AND 允许提交质疑内容、附件。

#### Scenario: 提交质疑
GIVEN 投标人下载招标文件后发现问题
WHEN 点击"质疑"并填写内容
THEN 系统记录质疑
AND 招标人/代理在异议管理页收到该质疑。

## MODIFIED Requirements

### Requirement: 招标文件目录可自定义
WHEN 招标人/代理进入招标文件页,
系统 SHALL 展示默认目录模板,
AND 允许新增、删除、重命名目录节点,
AND 支持拖拽调整顺序,
AND 目录变更 SHALL 纳入版本记录。

## REMOVED Requirements

### Requirement: 招标文件复核人字段
招标文件的"复核人"字段因需求文档未明确依据，予以移除。
编制人与确认人信息在状态流转中展示。
