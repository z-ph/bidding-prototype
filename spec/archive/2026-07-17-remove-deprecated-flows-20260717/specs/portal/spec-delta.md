# Spec Delta: 新口径下线改造（门户）

## MODIFIED Requirements

### Requirement: 公告列表进入真正详情页
原能力：门户公告详情页展示报名条件，已登录且符合条件的供应商可点击「立即报名」。
现修改：无报名环节（清单 10/11、概要二），公告详情页 SHALL NOT 展示「立即报名」入口与报名条件，供应商参与路径为下载招标文件（授权/公开二态门控，见 `add-supplier-authorization-20260717`）后直接投标。

#### Scenario: 公告详情无报名入口
GIVEN 供应商已登录
WHEN 打开某招标公告详情页
THEN 看到公告正文和附件列表
AND 不出现「立即报名」按钮。

#### Scenario: 未登录用户查看公告
GIVEN 未登录用户打开公告详情页
WHEN 页面渲染
THEN 正常展示公告正文
AND 不因报名流程被引导登录。
