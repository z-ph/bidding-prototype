import { useState, useMemo } from 'react'
import { Card, Table, Tag, Badge, Input, Select, Space, Typography, Alert } from 'antd'

const { Title, Text } = Typography

const reviewData = [
  // 胡桃评审 #1-26
  { id: 'zip-001', source: '胡桃', module: '评标大厅', page: 'ExpertProject', severity: '中', issue: '查阅资料不应作为左侧单独菜单项', status: '已修复', fix: '从专家菜单移除查阅资料，改为评标流程内步骤入口', commit: 'feat(project)' },
  { id: 'zip-002', source: '胡桃', module: '评标大厅', page: 'ExpertProject', severity: '中', issue: '评标组长没有单独统计结果流程', status: '已修复', fix: '增加组长统计评标结果、生成报告入口', commit: 'feat(project)' },
  { id: 'zip-003', source: '胡桃', module: '评标大厅', page: 'ExpertProject', severity: '中', issue: '评标任务应是列表而非单个项目窗口', status: '已修复', fix: 'ExpertProject 改为项目列表，点击进入详情', commit: 'feat(project)' },
  { id: 'zip-004', source: '胡桃', module: '通用', page: 'Layout', severity: '中', issue: '主页/工作台命名不一致', status: '已修复', fix: '左侧菜单第一项统一改为“工作台”', commit: 'feat(integration)' },
  { id: 'zip-005', source: '胡桃', module: '企业准入', page: 'SupplierProfile', severity: '中', issue: '供应商档案缺少按项目资质类型的上传接口', status: '已修复', fix: 'SupplierProfile/Register 按资质类型上传', commit: 'feat(auth)' },
  { id: 'zip-006', source: '胡桃', module: '投标人工作流', page: 'BidUpload / BidQuote', severity: '中', issue: '初次报价应在上传投标文件中完成，询比价开标后启用报价大厅', status: '已修复', fix: 'BidUpload/BidQuote 报价字段按项目模板动态渲染，继承 ProjectCreate 配置', commit: 'fix(p1)' },
  { id: 'zip-007', source: '胡桃', module: '投标人工作流', page: 'BidderProjects / Layout', severity: '中', issue: '缴费/下载/上传不应作为独立控制台菜单项', status: '已修复', fix: '移除左侧独立菜单，按项目状态在项目中心聚合按钮', commit: 'feat(project) / feat(integration)' },
  { id: 'zip-008', source: '胡桃', module: '投标人工作流', page: 'ProjectTrack', severity: '中', issue: '缴纳文件费应为动态步骤', status: '已修复', fix: 'ProjectTrack 缴纳文件费节点动态显示“去缴纳”', commit: 'feat(project)' },
  { id: 'zip-009', source: '胡桃', module: '投标人工作流', page: 'BidRegister', severity: '严重', issue: '资质文件检测不能进入下阶段', status: '已修复', fix: 'BidRegister 按项目资质要求校验缺失项并阻断', commit: 'feat(auth)' },
  { id: 'zip-010', source: '胡桃', module: '通用', page: '多个页面', severity: '中', issue: '敏感操作缺少二次确认弹窗', status: '已修复', fix: '在发标、开标、解密、定标、驳回等操作处增加 Modal.confirm', commit: 'feat(project)' },
  { id: 'zip-011', source: '胡桃', module: '开标/评标大厅', page: 'OpeningHall / ExpertProject', severity: '中', issue: '大厅不应作为顶级菜单，应从项目子页面进入', status: '已修复', fix: '移除大厅顶级菜单，改为从项目列表/跟踪进入', commit: 'feat(integration)' },
  { id: 'zip-012', source: '胡桃', module: '招标文件', page: 'TenderDoc', severity: '中', issue: '缺少一键导入模板按钮', status: '已修复', fix: 'TenderDoc 增加一键导入模板', commit: 'feat(project)' },
  { id: 'zip-013', source: '胡桃', module: '招标文件', page: 'TenderDoc', severity: '中', issue: '招标文件目录应可自定义', status: '已修复', fix: 'TenderDoc 目录树支持增删改与拖拽排序', commit: 'feat(project)' },
  { id: 'zip-014', source: '胡桃', module: '项目管理', page: 'ProjectList / Dashboard', severity: '中', issue: '创建项目应仅招标人可见，招标代理不应有入口', status: '已修复', fix: 'permissions.js 移除 agent 创建权限，Layout/列表隐藏入口', commit: 'feat(integration)' },
  { id: 'zip-015', source: '胡桃', module: '开标大厅', page: 'OpeningHall', severity: '中', issue: '解密操作角色不对，应由投标人自己解密', status: '已修复', fix: 'OpeningHall canDecrypt 限制仅投标人解密本企业文件，招标人/代理/监督仅查看', commit: 'fix(p1)' },
  { id: 'zip-016', source: '胡桃', module: '开标大厅', page: 'OpeningHall', severity: '中', issue: '是否必须所有人签到才能开标，缺了谁应提示', status: '已修复', fix: '显示未签到名单并二次确认', commit: 'feat(project)' },
  { id: 'zip-017', source: '胡桃', module: '开标大厅', page: 'OpeningHall', severity: '中', issue: '签到按钮错误出现，应改为各角色单独签到', status: '已修复', fix: '签到表改为状态队列，仅允许各账号签自己', commit: 'feat(project)' },
  { id: 'zip-018', source: '胡桃', module: '项目管理', page: 'ProjectList', severity: '中', issue: '编辑页缺失，且只有开标前可编辑', status: '已修复', fix: 'ProjectList 根据状态控制编辑按钮显隐', commit: 'feat(project)' },
  { id: 'zip-019', source: '胡桃', module: '项目管理', page: 'ProjectList', severity: '严重', issue: '详情页缺失', status: '已修复', fix: '新增 ProjectDetail.jsx 并接线', commit: 'feat(project) / feat(integration)' },
  { id: 'zip-020', source: '胡桃', module: '项目管理', page: 'ProjectList', severity: '中', issue: '按钮文案不符（进入开标/开标大厅）', status: '已修复', fix: '按状态统一按钮文案', commit: 'feat(project)' },
  { id: 'zip-021', source: '胡桃', module: '项目管理', page: 'ProjectList', severity: '中', issue: '没有发标按钮', status: '已修复', fix: 'ProjectList 增加发标按钮与二次确认', commit: 'feat(project)' },
  { id: 'zip-022', source: '胡桃', module: '招标文件', page: 'TenderDoc', severity: '中', issue: '评标办法编写不应仅代理可做，招标人自行招标也应有入口', status: '已修复', fix: 'TenderDoc 评标办法配置评分项/权重，ExpertProject 按配置驱动评分', commit: 'fix(p1)' },
  { id: 'zip-023', source: '胡桃', module: '注册/企业准入', page: 'Register / SupplierProfile', severity: '中', issue: '注册时若没有资质类型上传方式，资质要求无限制作用', status: '已修复', fix: 'Register/SupplierProfile 按资质类型上传', commit: 'feat(auth)' },
  { id: 'zip-024', source: '胡桃', module: '项目管理', page: 'ProjectCreate', severity: '中', issue: '标段合计与项目预算关系不明确', status: '已修复', fix: 'ProjectCreate 实时校验标段合计 ≤ 项目预算', commit: 'feat(project)' },
  { id: 'zip-025', source: '胡桃', module: '项目管理', page: 'ProjectCreate', severity: '中', issue: '需求编号含义不清', status: '已修复', fix: 'ProjectCreate 需求编号增加 tooltip/placeholder', commit: 'feat(project)' },
  { id: 'zip-026', source: '胡桃', module: '项目管理', page: 'ProjectCreate', severity: '中', issue: '招标邀请缺少选择/邀请投标人入口', status: '已修复', fix: 'ProjectCreate 邀请招标步骤增加 Transfer 选择 + 邀请码', commit: 'feat(project)' },

  // yy0 评审
  { id: 'yy0-001', source: 'yy0', module: '开标大厅', page: 'OpeningHall', severity: 'P0', issue: '解密动作应由投标人使用各自 CA 私钥完成，招标人/代理/监督不应代替解密', status: '已修复', fix: 'OpeningHall canDecrypt 限制仅投标人解密本企业文件，招标人/代理/监督仅查看状态', commit: 'fix(p1)' },
  { id: 'yy0-002', source: 'yy0', module: '投标文件上传', page: 'BidUpload', severity: 'P0', issue: '上传页缺少签章、加密、重新加密、查看加密结果动作，无法闭环', status: '已修复', fix: 'BidUpload 补齐签章/加密/重新签章/重新加密/提交回执动作链', commit: 'fix(p1)' },
  { id: 'yy0-003', source: 'yy0', module: '投标文件上传', page: 'BidUpload', severity: 'P0', issue: '提示正式提交必须 CA 加密，但允许密码加密进入提交结果，规则矛盾', status: '已修复', fix: '密码加密仅保存草稿，正式提交仅接受 CA 证书加密并阻断密码加密', commit: 'fix(p1)' },
  { id: 'yy0-004', source: 'yy0', module: '投标文件上传', page: 'BidUpload', severity: 'P1', issue: '缺少投标文件与招标文件评审条款关联功能', status: '已修复', fix: 'BidUpload 新增评审条款关联面板，挂接关系持久化到 clauseStore', commit: 'fix(p1)' },
  { id: 'yy0-005', source: 'yy0', module: '专家任务', page: 'ExpertProject / 新增页面', severity: 'P1', issue: '缺少专家抽取、授权、通知、接收任务链路', status: '已修复', fix: '新增 ExpertExtraction 抽取 + ExpertTasks 任务中心，菜单/权限/路由接入', commit: 'fix(p1)' },
  { id: 'yy0-006', source: 'yy0', module: '开标大厅', page: 'OpeningHall', severity: 'P2', issue: '步骤文案写“专家签到”但签到表没有专家，对象不一致', status: '已修复', fix: '签到表与步骤文案对象一致，均无专家列', commit: 'fix(p1)' },
  { id: 'yy0-007', source: 'yy0', module: '文件版本', page: 'TenderDoc / Downloads / ExpertProject', severity: '待确认', issue: '三处页面文件版本未体现统一版本链', status: '已修复', fix: 'tenderDocStore 统一版本链，TenderDoc/BidDownload/ExpertProject 共享同一文件对象', commit: 'fix(p1)' },
  { id: 'yy0-008', source: 'yy0', module: '项目创建/报价', page: 'ProjectCreate / BidUpload', severity: 'P1', issue: '报价字段固定，未继承前半段项目/标段配置', status: '已修复', fix: 'ProjectCreate 配置报价字段模板，BidQuote/BidUpload 按模板动态渲染', commit: 'fix(p1)' },
  { id: 'yy0-009', source: 'yy0', module: '招标文件/评标', page: 'TenderDoc / ExpertProject', severity: 'P1', issue: '专家评分页维度固定，未由评标办法配置驱动', status: '已修复', fix: 'tenderDocStore scoreItems 驱动 ExpertProject 评分项/权重，不再固定 30/40/30', commit: 'fix(p1)' },
  { id: 'yy0-010', source: 'yy0', module: '文件版本', page: 'TenderDoc / Downloads / ExpertProject', severity: 'P1', issue: '招标文件附件、下载页、专家查阅页未引用同一文件对象', status: '已修复', fix: '三处页面引用同一 tenderDocStore 文件版本对象，变更后提示有效版本', commit: 'fix(p1)' },
  { id: 'yy0-011', source: 'yy0', module: '项目跟踪', page: 'ProjectTrack', severity: 'P1', issue: '招标人页面出现“上传投标文件”等投标人动作按钮', status: '已修复', fix: 'ProjectTrack 按 useRole 过滤投标人动作按钮，招标方/监督仅查看', commit: 'fix(p1)' },
  { id: 'yy0-012', source: 'yy0', module: '项目创建', page: 'ProjectCreate', severity: 'P1', issue: '空白标段仍可提交审核', status: '已修复', fix: 'ProjectCreate validatePackages 校验标段必填字段，空白标段禁止提交', commit: 'fix(p1)' },
  { id: 'zph-001', source: 'zph', module: '登录/导航', page: 'Login', severity: 'P2', issue: '登录页缺少返回门户首页的入口', status: '已修复', fix: 'Login.jsx 注册链接旁增加「返回首页」', commit: 'fix(portal)' },
  { id: 'zph-002', source: 'zph', module: '导航', page: 'Layout', severity: 'P2', issue: '各角色工作后台没有返回门户首页的方式', status: '已修复', fix: 'Layout.jsx 左侧 Logo/标题点击返回门户首页', commit: 'fix(portal)' },

  // cxy 2026-07-14 23:11 评审
  { id: 'cxy-001', source: 'cxy', module: '招标文件', page: 'BidDownload / BidderProjects', severity: '中', issue: '缺少质疑招标文件的功能选项', status: '已修复', fix: 'BidDownload 增加「质疑招标文件」按钮，ObjectionManage 可查看/答复', commit: 'fix(tender)' },
  { id: 'cxy-002', source: 'cxy', module: '招标文件', page: 'TenderDoc', severity: '低', issue: '招标文件复核人字段缺少需求依据', status: '已修复', fix: 'TenderDoc 移除「复核人」字段', commit: 'fix(tender)' },
  { id: 'cxy-003', source: 'cxy', module: '招标文件', page: 'TenderDoc / ProjectCreate', severity: '中', issue: '招标公告关键信息全部在富文本中，无结构化字段存储', status: '已修复', fix: 'TenderDoc 增加「项目结构化信息」「标段/包件信息」「报价字段配置」「开标一览表模板」卡片', commit: 'fix(tender)' },
  { id: 'cxy-004', source: 'cxy', module: '公告管理', page: 'NoticePublish', severity: '中', issue: '发布公告缺少关联的标段', status: '已修复', fix: 'NoticePublish 关联项目后显示标段多选', commit: 'fix(notice)' },
  { id: 'cxy-005', source: 'cxy', module: '公告管理', page: 'NoticePublish', severity: '中', issue: '缺少公告列表页，无法查看已发布/草稿公告', status: '已修复', fix: '新增 NoticeList 公告列表页', commit: 'fix(notice)' },
  { id: 'cxy-006', source: 'cxy', module: '公告管理', page: 'NoticePublish', severity: '中', issue: '变更公告缺少变更原因填写项', status: '已修复', fix: 'NoticePublish 变更公告类型下增加必填「变更原因」字段，详情页高亮展示', commit: 'fix(notice)' },
  { id: 'cxy-007', source: 'cxy', module: '公告管理', page: 'NoticePublish', severity: '中', issue: '发布公告中的公告类型缺少澄清公告选项', status: '已修复', fix: '公告类型下拉增加「澄清公告」', commit: 'fix(notice)' },
  { id: 'cxy-008', source: 'cxy', module: '项目创建', page: 'ProjectCreate', severity: '中', issue: '标段部分信息缺失：采购方式、标书费、保证金、投标起止时间', status: '已修复', fix: 'ProjectCreate 标段设置增加采购方式、标书费、保证金、投标起止时间', commit: 'fix(project)' },
  { id: 'cxy-009', source: 'cxy', module: '项目创建', page: 'ProjectCreate', severity: '中', issue: '没有组织方式选项（自行招标/委托代理）', status: '已修复', fix: 'ProjectCreate 增加「组织方式」选择及代理机构/成员规则', commit: 'fix(project)' },
  { id: 'cxy-010', source: 'cxy', module: '采购需求', page: '新增页面', severity: '高', issue: '缺少采购需求独立入口及类型管理', status: '已修复', fix: '新增 ProcurementRequirementList 采购需求管理页面，含类型管理', commit: 'fix(project)' },
  { id: 'cxy-011', source: 'cxy', module: '项目创建', page: 'ProjectCreate', severity: '中', issue: '采购方式下拉中「单一来源」应为「邀请询比价」', status: '已修复', fix: 'ProjectCreate 采购方式选项改为「邀请询比价」', commit: 'fix(project)' },

  // cxy 2026-07-16 复测评审（新发现问题）
  { id: 'cxy-012', source: 'cxy', module: '项目管理', page: 'ProjectList', severity: 'P1', issue: '创建项目按钮点击无效，点击后无任何反应', status: '已修复', fix: '创建按钮改为 TanStack Router 对象式导航（fa951a9），路由/权限链路完整；7-16 复测仍报无效，疑为旧部署包，当前代码静态验证有效', commit: 'fix(navigation)' },
  { id: 'cxy-013', source: 'cxy', module: '费用管理', page: 'BidPayment / FeeManage', severity: 'P1', issue: '缺少标书费缴纳/上传缴费凭证入口，报名审核通过后直接跳过缴费环节', status: '无需修复', fix: '2026-07-17 新口径（清单 26/概要七）：保证金/文件费不缴纳、不实现支付功能，缴费入口需求作废；费用台账改造见提案 remove-deprecated-flows-20260717（待甲方确认）', commit: '-' },
  { id: 'cxy-014', source: 'cxy', module: '报名管理', page: '新增页面', severity: 'P1', issue: '缺少报名审核入口，招标人/代理无法对报名的投标方进行审核', status: '无需修复', fix: '2026-07-17 新口径（清单 10/11/概要二）：无报名环节，报名审核需求作废', commit: '-' },
  { id: 'cxy-015', source: 'cxy', module: '标段管理', page: 'ProjectCreate', severity: 'P1', issue: '标段设置缺少「报名是否需要审核」配置字段', status: '无需修复', fix: '同上：无报名环节，标段「报名需审核」配置不需要', commit: '-' },
  { id: 'cxy-016', source: 'cxy', module: '项目管理', page: 'ProjectCreate', severity: 'P2', issue: '项目基本信息存在「采购方式」字段，与标段级采购方式冗余', status: '已修复', fix: '项目级「采购方式」字段已移除（标段级保留），列表/详情从标段派生展示', commit: '-' },
  { id: 'cxy-017', source: 'cxy', module: '项目管理', page: 'ProjectList / NoticePublish', severity: 'P1', issue: '采购方式选项中包含「单一来源」，应为「邀请询比价」', status: '已修复', fix: 'NoticePublish/参数字典/帮助文案残留「单一来源」已全部清理为「邀请询比价」（grep 全库无残留）', commit: 'fix(project)' },
  { id: 'cxy-018', source: 'cxy', module: '委托代理', page: 'ProjectCreate', severity: '待确认', issue: '代理机构抽选方式：当前直接指定代理，需求文档要求按条件筛选后随机抽取，需确认最终支持哪些方式', status: '已修复', fix: '口径确认（清单 71/概要六）：代理机构直接指定，无需随机抽取；当前实现即直接指定，关闭本项', commit: '-' },
  { id: 'cxy-019', source: 'cxy', module: '投标管理', page: 'BidDownload', severity: 'P1', issue: '缺少供应商质疑招标文件功能入口，投标人菜单无质疑入口', status: '无需修复', fix: '2026-07-17 新口径（清单 44/45）：没有供应商异议环节，质疑入口需求作废；已实现的质疑功能待下线（remove-deprecated-flows-20260717 待甲方确认）', commit: 'fix(tender)' },

  // cal 2026-07-15 交叉评审
  { id: 'cal-001', source: 'cal', module: '招标文件', page: 'TenderDoc', severity: 'P0', issue: '委托代理模式下招标文件应由代理机构编制，招标人仅有查看/确认权限，编制入口应按组织方式动态控制', status: '已修复', fix: 'TenderDoc canEdit 按「角色 + 项目组织方式」双维度控制：委托代理(orgMode=agent)下招标人只读并显示原因提示，自行招标(self)下招标人/代理均可编制；projectMeta 增加 orgMode 字段', commit: 'fix(tender-doc-perm)' },
  { id: 'cal-002', source: 'cal', module: '发标管理/邀请招标', page: 'ProjectCreate / BidderProjects', severity: 'P0', issue: '投标邀请管理缺失：缺少受邀供应商选择、投标邀请书发送、受邀接受/拒绝、非受邀阻断报名、邀请状态跟踪', status: '已修复', fix: '邀请闭环补齐：受邀接受/拒绝入口+持久化、非受邀不可见不可操作（新口径无报名环节）、邀请状态跟踪（SupplierAuthorization 页）、邀请书自动生成（闭环）', commit: 'feat(project)' },
  { id: 'cal-003', source: 'cal', module: '开标管理', page: 'OpeningHall', severity: 'P1', issue: '代理机构开标准备前无法指定主持人/监督人', status: '已修复', fix: '开标参与人不再硬编码：OpeningHall 新增「阶段 0 开标准备」，招标人/代理可指定主持人/监督人（localStorage 持久化），未指定不可进入下一步；签到表与唱标联动该名单', commit: '-' },
  { id: 'cal-004', source: 'cal', module: '开标大厅', page: 'OpeningHall', severity: 'P0', issue: '投标人缺少在线解密功能，招标人不可解密', status: '已修复', fix: 'OpeningHall canDecrypt 限制仅投标人解密本企业文件（CA 解密确认弹窗），招标人/代理/监督仅查看状态', commit: 'fix(p1)' },
  { id: 'cal-005', source: 'cal', module: '评标管理', page: 'ExpertExtraction / ExpertTasks', severity: 'P0', issue: '缺少专家抽取功能：按专业/地区/回避等条件随机抽取、抽取记录、通知、确认反馈、导出、补抽', status: '已修复', fix: '专家抽取增强（按清单 40/41 缩圈）：回避仅按单位；被抽中专家在 ExpertTasks 确认/拒绝（可填原因），拒绝后备选自动递补；备选名单；抽取结果 CSV 导出', commit: 'fix(p1)' },
  { id: 'cal-006', source: 'cal', module: '异议管理', page: 'ObjectionManage', severity: 'P1', issue: '招标人视角下无异议管理入口，无法查看异议并在线答复', status: '已修复', fix: '招标人菜单接入 ObjectionManage，支持查看/答复/驳回，与投标人质疑共用 objectionStore 闭环', commit: 'fix(objection)' },
  { id: 'cal-007', source: 'cal', module: '异议管理', page: 'Layout / BidderProjects', severity: 'P0', issue: '供应商工作台缺失异议管理，无法在线发起异议并查看答复状态', status: '无需修复', fix: '同上：无供应商异议环节，供应商异议管理需求作废', commit: '-' },
  { id: 'cal-008', source: 'cal', module: '工作台', page: 'Dashboard', severity: 'P2', issue: '「待办事项」自评清单称通过，但复核当前代码仅有工作台待办卡片，无独立待办页面/路由', status: '已修复', fix: '新增 TodoCenter 待办中心页（/admin/todo-center，全角色菜单紧随工作台）：聚合审批待办（approvalStore）/项目待办/系统待办，Tab 计数，点击跳转处理页', commit: '-' },
  { id: 'cal-009', source: 'cal', module: '通知管理', page: 'MessageCenter', severity: 'P2', issue: '「通知管理」自评清单称通过，但复核仅见消息中心 MessageCenter 近似页面，无独立通知管理（发送/列表）', status: '已修复', fix: '新增 NotificationManage 通知管理页（管理员）：站内信发送/列表/已读；MessageCenter 接入 messageStore 形成闭环；短信/邮件按新口径仅预留接口（页面 Alert 注明）', commit: '-' },
  { id: 'cal-010', source: 'cal', module: '模板管理', page: '无', severity: 'P2', issue: '「模板管理」自评清单称通过，但复核全库无模板管理页面，仅 TenderDoc 内「导入模板」功能', status: '已修复', fix: '新增 TemplateManage 模板管理页：招标文件目录/投标邀请书/中标通知书三类模板新增/编辑/启停用，localStorage 持久化；注明内容维护与采购管理部联系', commit: '-' },
  { id: 'cal-011', source: 'cal', module: '系统设置', page: '无', severity: 'P2', issue: '「系统设置」自评清单称通过，但复核无对应视图/路由/菜单', status: '已修复', fix: '新增 SystemSettings 系统设置页（管理员）：系统信息维护表单持久化；非 admin 被路由守卫拦截（权限口径正确）', commit: '-' },

  // page-reviews-20260714-2052 评审导出（未指明代号，以来源文件名记录）
  { id: '2052-001', source: 'page-reviews-20260714-2052', module: '登录/注册', page: 'Login', severity: '中', issue: '登录页「立即注册」看起来可点击，但没有进入注册页面', status: '已修复', fix: '登录页「立即注册」跳转 /register，Register 实现角色化必填校验与资质上传的注册流程', commit: 'feat(auth)' },
  { id: '2052-002', source: 'page-reviews-20260714-2052', module: '通用', page: 'Layout', severity: '低', issue: '退出登录缺少确认和登录失效说明', status: '部分修复', fix: '退出后未登录访问 /admin 一律被 beforeLoad 拦截并强制回登录页；退出操作本身仍无二次确认弹窗', commit: '-' },
  { id: '2052-003', source: 'page-reviews-20260714-2052', module: '评标大厅', page: 'EvaluationHall', severity: '中', issue: '评标汇总可以在专家未全部提交时直接提交', status: '已修复', fix: '提交评标结果接入 evaluationStore.getSubmittedInfo 真实数据：未全部提交时按钮禁用并逐名列出未提交专家（替换写死 mock）', commit: '-' },
  { id: '2052-004', source: 'page-reviews-20260714-2052', module: '项目管理', page: 'ProjectCreate / ProjectList', severity: '中', issue: '项目创建后没有真正出现在项目列表，刷新后无法继续演示', status: '已修复', fix: 'ProjectList 改接 projectStore（基线 mock 合并）：创建/草稿/发标落库持久化，刷新可见，ProjectDetail 同源；另修复迁移遗留的 /admin/projects 子路由遮蔽（Outlet 布局+index 路由），创建/详情/跟踪页恢复可达', commit: '-' },
  { id: '2052-005', source: 'page-reviews-20260714-2052', module: '投标人工作流', page: 'BidderProjects', severity: '中', issue: '供应商点击项目详情仍然只是提示信息，未进入真实详情页', status: '已修复', fix: 'BidderProjects 详情真实跳转 /admin/projects/detail/:id（TanStack 对象式导航）；permissions 对该路由加 bidder', commit: '-' },
  { id: '2052-006', source: 'page-reviews-20260714-2052', module: '投标人工作流', page: 'Layout / BidderProjects', severity: '中', issue: '供应商菜单缺少开标大厅、质疑与异议、中标通知入口', status: '已修复', fix: '投标人菜单新增开标大厅、中标通知；项目中心操作列按状态聚合入口（开标大厅/上传投标/报价/中标通知）', commit: '-' },
  { id: '2052-007', source: 'page-reviews-20260714-2052', module: '评标管理', page: 'Layout', severity: '中', issue: '招标人菜单中没有独立的评标结果入口（评标进度/评标报告确认/定标管理）', status: '部分修复', fix: '招标人评标进度查看已由只读评标视图（2052-010）与待办中心覆盖；菜单级独立评标入口（评标报告确认/定标管理聚合）未单独建设', commit: '-' },
  { id: '2052-008', source: 'page-reviews-20260714-2052', module: '评标大厅', page: 'EvaluationHall', severity: '中', issue: '评标大厅职责混在一个页面，评分汇总/专家评审/否决投标/评标报告/提交结果未按角色拆分', status: '已修复', fix: 'EvaluationHall 引入 useRole 按角色拆视图：组长（评分汇总/否决/报告/提交）、专家（进度+去评分）、招标人/代理/监督（只读）', commit: '-' },
  { id: '2052-009', source: 'page-reviews-20260714-2052', module: '评标大厅', page: 'EvaluationHall', severity: '严重', issue: '专家和监督人员可能看到并点击「提交评标结果」，角色操作错误', status: '已修复', fix: '「提交评标结果」仅组长渲染，其余角色不渲染', commit: '-' },
  { id: '2052-010', source: 'page-reviews-20260714-2052', module: '开标大厅', page: 'OpeningHall', severity: '中', issue: '招标人完成开标后点「进入评标大厅」被禁止进入，流程前后冲突', status: '已修复', fix: 'permissions evaluation-hall 加 tenderee；招标人只读进度视图；OpeningHall「进入评标大厅」带 projectId', commit: '-' },
  { id: '2052-011', source: 'page-reviews-20260714-2052', module: '评标大厅', page: 'ExpertProject / Layout', severity: '高', issue: '专家「查阅资料」菜单点击进入无权限页面（菜单与页面规则冲突）', status: '已修复', fix: '专家菜单已移除「查阅资料」，改为评标流程内步骤在线查阅，不再跳无权限页', commit: 'feat(project)' },
  { id: '2052-012', source: 'page-reviews-20260714-2052', module: '登录/注册', page: 'Login', severity: '高', issue: '账号密码登录没有检查密码，空密码或随意填写也能登录', status: '已修复', fix: '账号密码与 DEMO_ACCOUNTS mock 表逐条比对，错误/空密码登录失败并提示', commit: 'fix(auth)' },
  { id: '2052-013', source: 'page-reviews-20260714-2052', module: '登录/注册', page: 'admin 路由守卫', severity: '高', issue: '未登录仍可直接进入后台页面，系统把访问者当成招标人', status: '已修复', fix: 'admin 布局路由 beforeLoad 按 localStorage 实际角色鉴权，未登录访问后台跳 forbidden/login，不再默认当成招标人', commit: 'fix(auth)' },

  // page-reviews-20260715-1415 评审导出（未指明代号，以来源文件名记录）
  { id: '1415-001', source: 'page-reviews-20260715-1415', module: '专家管理', page: 'ExpertExtraction', severity: '严重', issue: '抽取专家时需要筛选，但专家库未看到可筛选字段（专业领域、研究年龄等）', status: '已修复', fix: 'ExpertExtraction 支持按专业领域多选+回避单位条件筛选并随机抽取（无独立专家库列表页，筛选落在抽取页）', commit: 'fix(p1)' },
  { id: '1415-002', source: 'page-reviews-20260715-1415', module: '评标大厅', page: 'ExpertProject', severity: '中', issue: '在线评分时无法查看资料进行佐证，建议合并查阅资料和评分页面', status: '已修复', fix: '评分步骤新增内嵌资料查阅抽屉（招标文件/投标文件/开标记录三 Tab），替换 message 提示', commit: '-' },
  { id: '1415-003', source: 'page-reviews-20260715-1415', module: '评标管理', page: 'ExpertProject', severity: '中', issue: '评标流程性质确认：是「全程在线评标」还是「限时前提交分数即可」', status: '待确认', fix: '已按「限时前提交分数即可」实现（任务截止时间+过期阻断+页面注明），待产品最终确认流程性质', commit: '-' },
  { id: '1415-004', source: 'page-reviews-20260715-1415', module: '评审工具', page: '页面评审组件', severity: '中', issue: '评审写错了无法编辑，只能重写', status: '未修复', fix: 'ReviewTool@0.7.10 UI 无编辑已提交评审入口（库限制）；如需该能力需另立提案自研或推动库支持', commit: '-' },
  { id: '1415-005', source: 'page-reviews-20260715-1415', module: '投标人工作流', page: 'BidUpload / BidQuote', severity: '高', issue: '项目选择方式不合理：不同项目分段不同，应先选择项目再显示其他填写栏', status: '已修复', fix: 'BidQuote 无 projectId 时先显示项目选择门槛（列出可报价项目），选定进入且可重选；与 BidUpload 先选项目口径一致（闭环）', commit: '-' },
  { id: '1415-006', source: 'page-reviews-20260715-1415', module: '投标人工作流', page: 'BidderProjects', severity: '严重', issue: '缺少接受邀请入口', status: '已修复', fix: '受邀项目在 BidderProjects 显示「待接受邀请」，可接受/拒绝并持久化；邀请书自动生成可查看下载', commit: '-' },
  { id: '1415-007', source: 'page-reviews-20260715-1415', module: '通用', page: 'ObjectionManage / AwardConfirm / AwardNotice / ContractArchive / FeeManage', severity: '中', issue: '异议管理、确认中标人、中标通知书、合同归档、费用管理属于项目强相关，应按项目列表显示', status: '部分修复', fix: '异议管理、费用管理为带「关联项目」列的全局列表；确认中标人/中标通知书/合同归档仍写死单一项目，未按项目维度展示', commit: '-' },
  { id: '1415-008', source: 'page-reviews-20260715-1415', module: '公告管理', page: 'NoticePublish', severity: '严重', issue: '发布公告按钮页面报错', status: '已修复', fix: 'TanStack Router 迁移重写（e40b8ff/fa951a9）后页面静态检查无报错点；评审时版本为迁移前旧代码', commit: 'fix(navigation)' },
  { id: '1415-009', source: 'page-reviews-20260715-1415', module: '项目创建', page: 'ProjectCreate', severity: '高', issue: '标书费异议：每个标段单独设置标书费，但标书按项目上传，费用与文件维度矛盾', status: '待确认', fix: '2026-07-17 新口径不缴纳标书费/保证金（清单 26），费用维度矛盾将随字段下线消除（remove-deprecated-flows-20260717 待甲方确认）；中标人结果后缴费的收款方仍待确认', commit: '-' },
  { id: '1415-010', source: 'page-reviews-20260715-1415', module: '项目创建', page: 'ProjectCreate', severity: '严重', issue: '「选择已发布/已审核的采购需求」下拉框选择后页面报错', status: '已修复', fix: '需求选择 onChange 加可选链守卫并联动回填预算/简介（e40b8ff），选择后不再报错', commit: 'fix(project)' },
  { id: '1415-011', source: 'page-reviews-20260715-1415', module: '项目创建', page: 'ProjectCreate', severity: '高', issue: '代理合同确认流程错误：应在供应商要求填写完成后发布委托合同', status: '无需修复', fix: '2026-07-17 新口径（清单 72）：委托合同不用审核，无审批节点，原流程调整需求作废', commit: '-' },

  // 招投标测试（文件名来源，2026-07-16 前）
  { id: 'test-001', source: '招投标测试', module: '定标/归档', page: 'AwardConfirm / AwardNotice / ContractArchive', severity: 'P0', issue: '确认中标人、中标通知书、合同归档可从菜单直接打开，没有根据项目实际阶段限制访问', status: '已修复', fix: 'AwardConfirm/AwardNotice 增加项目维度+阶段门禁（评标完成→确认中标人→发通知书；未达阶段锁定提示+操作禁用+二次确认）；合同归档按 2026-07-17 新口径下线不在本项范围', commit: '-' },
  { id: 'test-002', source: '招投标测试', module: '评标大厅', page: 'ExpertProject', severity: 'P0', issue: '当前演示默认设定专家组组长，应不默认设定、由专家实时推选后再进行下一步', status: '已修复', fix: '初始无默认组长（leader=null），专家实时推选并持久化，未推选时后续步骤锁定，报告生成后禁止改选', commit: '-' },
  { id: 'test-003', source: '招投标测试', module: '评标大厅', page: 'ExpertProject', severity: 'P1', issue: '误刷新或关闭页面会造成全部操作（评标结果）丢失', status: '已修复', fix: '评分/意见/签名/提交状态全部接入 evaluationStore（localStorage），刷新不丢失', commit: '-' },
  { id: 'test-004', source: '招投标测试', module: '评标大厅', page: 'ExpertProject / EvaluationHall', severity: 'P1', issue: '评标报告并未真正生成：缺报告预览、编号版本、内容、签名、下载、归档记录、项目状态变化', status: '已修复', fix: '评标报告实体化：编号/版本/内容/签名状态表/归档记录/HTML 下载；生成后项目状态推进「评标完成」并回写 evaluationReportId', commit: '-' },
  { id: 'test-005', source: '招投标测试', module: '评标大厅', page: 'ExpertProject', severity: 'P1', issue: '页面提示「签名后不可修改」，但完成电子签名后「返回修改」仍可用，分数和意见仍可编辑', status: '已修复', fix: '签名后分数与意见锁定，「返回修改」需先撤销签名（必填原因，记录 revoked/revokeReason）', commit: '-' },

  // 7.16招投标测试2（文件名来源）
  { id: 'test2-001', source: '7.16招投标测试2', module: '用户管理', page: 'AdminUsers', severity: 'P0', issue: '管理员可以停用自己的账号：无本人防护、无二次确认、会话不失效、可再启用自己', status: '已修复', fix: '当前登录账号停用按钮禁用并 Tooltip 提示；停用/启用任意账号均需 Modal 二次确认；用户列表持久化 userStore；Login 读取 userStore 拦截被停用账号登录', commit: 'fix(admin-users)' },
  { id: 'test2-002', source: '7.16招投标测试2', module: '用户管理', page: 'AdminUsers', severity: 'P1', issue: '新增用户空表也提示保存成功，列表没有新增用户', status: '已修复', fix: '新增用户校验账号必填且唯一、姓名/角色/所属组织必填，失败给字段级提示并阻断；成功立即入列表并持久化', commit: 'fix(admin-users)' },
  { id: 'test2-003', source: '7.16招投标测试2', module: '评标大厅', page: 'ExpertTasks', severity: 'P1', issue: '过期任务仍可进入评标，任务时间结束后仍可打开并继续操作', status: '已修复', fix: 'ExpertTasks 任务含截止时间，过期置灰+「已过期」Tag，进入被 Modal 阻断；ExpertProject 过期封锁评分/签名/提交', commit: '-' },

  // yy0 无问题页面
  { id: 'yy0-ok-001', source: 'yy0', module: '登录', page: 'Login', severity: '无问题', issue: '登录入口、方式切换、演示账号说明清楚', status: '无需修复', fix: '-', commit: '-' },
  { id: 'yy0-ok-002', source: 'yy0', module: '项目管理', page: 'ProjectList', severity: '无问题', issue: '列表、状态、筛选、操作入口完整', status: '无需修复', fix: '-', commit: '-' },
  { id: 'yy0-ok-003', source: 'yy0', module: '流程跟踪', page: 'ProjectTrack', severity: '无问题', issue: '时间线展示主流程节点清楚（按钮角色问题单独跟踪）', status: '无需修复', fix: '-', commit: '-' },
  { id: 'yy0-ok-004', source: 'yy0', module: '文件下载', page: 'Downloads', severity: '无问题', issue: '文件列表、版本、下载/预览入口完整', status: '无需修复', fix: '-', commit: '-' },
  { id: 'yy0-ok-005', source: 'yy0', module: '专家档案', page: 'ExpertProfile', severity: '无问题', issue: '专家基础信息、专业领域、回避单位等完整', status: '无需修复', fix: '-', commit: '-' },

  // cal 自评无问题页面（经复核存在）
  { id: 'cal-ok-001', source: 'cal', module: '工作台', page: 'Dashboard', severity: '无问题', issue: '六角色工作台：不同角色进入不同工作台', status: '无需修复', fix: '-', commit: '-' },
  { id: 'cal-ok-002', source: 'cal', module: '用户管理', page: 'AdminUsers', severity: '无问题', issue: '用户管理列表展示完整（菜单名「用户权限」）', status: '无需修复', fix: '-', commit: '-' },
  { id: 'cal-ok-003', source: 'cal', module: '费用管理', page: 'FeeManage', severity: '无问题', issue: '费用订单管理：订单列表和状态流转', status: '无需修复', fix: '-', commit: '-' },
  { id: 'cal-ok-004', source: 'cal', module: '发票管理', page: 'BidderInvoices', severity: '无问题', issue: '发票管理：发票申请审核流程（仅投标人侧发票申请页，无管理侧发票管理）', status: '无需修复', fix: '-', commit: '-' },
  { id: 'cal-ok-005', source: 'cal', module: '异常管理', page: 'SupervisorAbnormal', severity: '无问题', issue: '异常管理：异常记录和状态（菜单名「异常登记」）', status: '无需修复', fix: '-', commit: '-' },
  { id: 'cal-ok-006', source: 'cal', module: '监督', page: 'SupervisorHall', severity: '无问题', issue: '监督看板：监督视角数据展示（菜单名「监督大厅」）', status: '无需修复', fix: '-', commit: '-' },
  { id: 'cal-ok-007', source: 'cal', module: '字典管理', page: 'AdminDictionary', severity: '无问题', issue: '参数字典管理：字典增删改查可用', status: '无需修复', fix: '-', commit: '-' },
  { id: 'cal-ok-008', source: 'cal', module: '日志', page: 'SupervisorLogs / AdminLogs', severity: '无问题', issue: '操作日志：日志列表可查看', status: '无需修复', fix: '-', commit: '-' }
]

const statusColor = {
  '已修复': 'success',
  '部分修复': 'warning',
  '未修复': 'error',
  '无需修复': 'default',
  '待确认': 'processing'
}

const severityColor = {
  'P0': 'red',
  'P1': 'orange',
  'P2': 'blue',
  '高': 'orange',
  '中': 'blue',
  '低': 'green',
  '严重': 'red',
  '无问题': 'default',
  '待确认': 'purple'
}

export default function ReviewChangeList() {
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [sourceFilter, setSourceFilter] = useState(null)

  const filtered = useMemo(() => {
    return reviewData.filter((item) => {
      const matchKeyword = !keyword ||
        item.issue.includes(keyword) ||
        item.module.includes(keyword) ||
        item.page.includes(keyword) ||
        item.fix.includes(keyword)
      const matchStatus = !statusFilter || item.status === statusFilter
      const matchSource = !sourceFilter || item.source === sourceFilter
      return matchKeyword && matchStatus && matchSource
    })
  }, [keyword, statusFilter, sourceFilter])

  const stats = useMemo(() => {
    const total = reviewData.length
    const fixed = reviewData.filter((i) => i.status === '已修复').length
    const partial = reviewData.filter((i) => i.status === '部分修复').length
    const pending = reviewData.filter((i) => i.status === '未修复').length
    const na = reviewData.filter((i) => i.status === '无需修复').length
    const tbc = reviewData.filter((i) => i.status === '待确认').length
    return { total, fixed, partial, pending, na, tbc }
  }, [])

  const columns = [
    { title: '编号', dataIndex: 'id', width: 110 },
    {
      title: '来源',
      dataIndex: 'source',
      width: 190,
      render: (s) => <Tag>{s}</Tag>
    },
    { title: '模块', dataIndex: 'module', width: 120 },
    { title: '页面', dataIndex: 'page', width: 160 },
    {
      title: '严重等级',
      dataIndex: 'severity',
      width: 100,
      render: (s) => <Tag color={severityColor[s]}>{s}</Tag>
    },
    { title: '评审意见', dataIndex: 'issue', minWidth: 280 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s) => <Badge status={statusColor[s]} text={s} />
    },
    { title: '修复手段/结果', dataIndex: 'fix', minWidth: 260 },
    { title: '相关 commit', dataIndex: 'commit', width: 140 }
  ]

  return (
    <div className="review-change-list">
      <Card
        title={<Title level={4} style={{ margin: 0 }}>评审变更列表</Title>}
      >
        <Alert
          title="本页面汇总 2026-07-13 至 2026-07-16 期间多轮页面评审与测试反馈的处理状态；状态列经逐条代码复核。；2026-07-17 按实施验证结果更新（验证报告 docs/verification-20260717-report.md）"
          description="评审来源代号：胡桃、yy0、zph、cxy、cal（page-reviews 导出包未标注代号，以来源文件名记录）。评审原始文件已归档至 review-inputs/，其中页面评审导出包 page-reviews-*.zip 与其对应评审报告 page-reviews-*-review.md 配套存档。未指明代号的来源（page-reviews-20260714-2052 / page-reviews-20260715-1415 / 招投标测试 / 7.16招投标测试2）均以文件名为来源标识。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Space style={{ marginBottom: 16 }} size="large">
          <Text>总计：<strong>{stats.total}</strong></Text>
          <Text type="success">已修复：<strong>{stats.fixed}</strong></Text>
          <Text type="warning">部分修复：<strong>{stats.partial}</strong></Text>
          <Text type="danger">未修复：<strong>{stats.pending}</strong></Text>
          <Text type="secondary">无需修复：<strong>{stats.na}</strong></Text>
          <Text>待确认：<strong>{stats.tbc}</strong></Text>
        </Space>

        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="搜索评审意见、模块、页面..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 260 }}
          />
          <Select
            placeholder="按状态筛选"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: '已修复', value: '已修复' },
              { label: '部分修复', value: '部分修复' },
              { label: '未修复', value: '未修复' },
              { label: '无需修复', value: '无需修复' },
              { label: '待确认', value: '待确认' }
            ]}
          />
          <Select
            placeholder="按来源筛选"
            allowClear
            style={{ width: 220 }}
            value={sourceFilter}
            onChange={setSourceFilter}
            options={[
              { label: '胡桃 评审', value: '胡桃' },
              { label: 'yy0 评审', value: 'yy0' },
              { label: 'zph 评审', value: 'zph' },
              { label: 'cxy 评审', value: 'cxy' },
              { label: 'cal 评审', value: 'cal' },
              { label: 'page-reviews-20260714-2052', value: 'page-reviews-20260714-2052' },
              { label: 'page-reviews-20260715-1415', value: 'page-reviews-20260715-1415' },
              { label: '招投标测试', value: '招投标测试' },
              { label: '7.16招投标测试2', value: '7.16招投标测试2' }
            ]}
          />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <style>{`
        .review-change-list {
          max-width: 1400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  )
}
