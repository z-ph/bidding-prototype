# analytics Specification

## Requirements

<!-- Merged from add-procurement-analytics-20260717 / analytics -->

### Requirement: 价格趋势分析
系统 SHALL 提供采购数据分析看板，按时间轴展示材料价格变化趋势，
AND SHALL 支持按时间、供应商、材料三个维度组合筛选，趋势图随筛选条件联动更新。

#### Scenario: 按维度筛选趋势
GIVEN 招标人打开数据分析看板
WHEN 选择时间范围、供应商、材料类别进行组合筛选
THEN 趋势图仅展示符合筛选条件的价格数据
AND 筛选条件变更后图表即时联动更新。

#### Scenario: 展示价格变化
GIVEN 看板已加载某材料的价格数据
WHEN 用户查看趋势图
THEN 图表按时间轴展示该材料历次报价的变化情况。

### Requirement: 材料报价比价
系统 SHALL 提供材料报价比价视图，对同一材料展示多家供应商的历史报价及价差。

#### Scenario: 同材料多供应商比价
GIVEN 比价视图中选定一种材料
WHEN 该材料存在两家以上供应商的报价记录
THEN 页面并列展示各供应商历史报价
AND 展示供应商之间的价差。

### Requirement: 风险预警规则
系统 SHALL 自动识别以下风险情形并生成预警记录：法人相同、存在上下级关系、报价异常高，
AND 每类规则 SHALL 提供独立的可配开关，关闭后不再产生该类预警。

#### Scenario: 法人相同预警
GIVEN 两条报价记录对应供应商的法人相同
WHEN 系统执行预警规则判定
THEN 生成一条「法人相同」类别的预警记录，包含涉及供应商与项目、命中时间。

#### Scenario: 上下级关系预警
GIVEN 参与同一项目的两家供应商存在上下级关系
WHEN 系统执行预警规则判定
THEN 生成一条「上下级关系」类别的预警记录。

#### Scenario: 报价异常高预警
GIVEN 某供应商报价明显高于同材料其他报价
WHEN 系统执行预警规则判定
THEN 生成一条「报价异常高」类别的预警记录。

#### Scenario: 规则开关配置
GIVEN 用户关闭「报价异常高」规则开关
WHEN 系统再次执行预警判定
THEN 不再产生「报价异常高」类别的新预警
AND 其余开启状态的规则不受影响。

### Requirement: 数据来源与接口预留
数据分析模块的数据来源为 e签宝，系统 SHALL 通过甲方提供的接口调用获取；
原型阶段 SHALL 使用 mock 数据（localStorage store 模式），
AND e签宝接口 SHALL 仅以预留占位形式存在，不做真实调用。

#### Scenario: 原型阶段使用 mock 数据
GIVEN 原型环境未接入 e签宝真实接口
WHEN 用户打开数据分析看板、比价视图或预警列表
THEN 页面展示 mock 数据
AND 无任何真实网络请求发出。

#### Scenario: e签宝接口预留
GIVEN 甲方后续提供 e签宝接口文档
WHEN 开发真实对接
THEN 仅需实现预留的接口占位函数并切换数据来源
AND 页面视图层无需改动。
