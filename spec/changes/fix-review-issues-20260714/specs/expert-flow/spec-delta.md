# Spec Delta: Expert Task Chain

## ADDED Requirements

### Requirement: 专家可查看抽取和任务授权记录
WHEN 专家被抽取并授权参与某项目评标,
系统 SHALL 在专家任务中心展示抽取结果、项目信息、抽取时间、任务状态,
AND 专家 SHALL 能明确知道因哪个项目、哪次抽取、何时收到任务、去哪里开始评标。

#### Scenario: 专家接收任务
GIVEN 管理员完成专家抽取并授权
WHEN 专家登录并进入任务中心
THEN 看到"XX项目 · 2026-07-14 抽取 · 已授权 · 前往评标"记录
AND 点击"前往评标"进入评标页面。

#### Scenario: 任务状态流转
GIVEN 专家已收到任务但未确认
WHEN 专家点击"确认参加"
THEN 状态变为"已接收"
AND 系统记录确认时间。

### Requirement: 专家任务中心入口可见
WHEN 专家登录后台,
系统 SHALL 在左侧菜单提供"评标任务"或"任务中心"入口,
AND 入口 SHALL 展示待处理任务数量。

#### Scenario: 查看任务中心
GIVEN 专家登录
WHEN 查看左侧菜单
THEN 看到"评标任务"菜单项
AND 若有未处理任务显示红点或数字角标。
