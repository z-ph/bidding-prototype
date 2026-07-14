# Spec Delta: Tender Doc Driven Scoring and File Version Chain

## ADDED Requirements

### Requirement: 评标办法配置驱动专家评分
WHEN 招标人或代理在招标文件中配置评标办法,
系统 SHALL 支持定义评分项、权重、否决规则,
AND 专家评分页 SHALL 按配置渲染评分维度,
AND 评标汇总 SHALL 按配置计算总分和排名。

#### Scenario: 配置评分项
GIVEN 评标办法配置：商务 20、技术 50、价格 30
WHEN 专家进入评分页
THEN 看到商务、技术、价格三个评分项及对应权重
AND 输入分数后按权重汇总。

#### Scenario: 否决规则生效
GIVEN 评标办法配置"技术分低于 20 分否决"
WHEN 某投标人技术分 15 分
THEN 系统自动标记为否决
AND 不进入总分排名。

### Requirement: 文件版本统一链
WHEN 招标文件附件发生变更,
系统 SHALL 更新版本号,
AND 招标文件页、下载页、专家查阅页 SHALL 引用同一文件对象和版本,
AND 非最新版本 SHALL 明确提示。

#### Scenario: 版本变更同步
GIVEN 管理员更新招标文件附件到 V2.0
WHEN 投标人访问下载页、专家访问查阅页
THEN 两处都显示 V2.0
AND V1.0 显示"已过期"或"非当前版本"。

#### Scenario: 旧版本提示
GIVEN 投标人已下载 V1.0
WHEN 管理员发布 V2.0
THEN 投标人再次进入下载页看到"当前有效版本为 V2.0，您此前下载的 V1.0 已过期"。
