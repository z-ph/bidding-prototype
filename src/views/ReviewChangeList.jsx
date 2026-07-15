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

  // yy0 无问题页面
  { id: 'yy0-ok-001', source: 'yy0', module: '登录', page: 'Login', severity: '无问题', issue: '登录入口、方式切换、演示账号说明清楚', status: '无需修复', fix: '-', commit: '-' },
  { id: 'yy0-ok-002', source: 'yy0', module: '项目管理', page: 'ProjectList', severity: '无问题', issue: '列表、状态、筛选、操作入口完整', status: '无需修复', fix: '-', commit: '-' },
  { id: 'yy0-ok-003', source: 'yy0', module: '流程跟踪', page: 'ProjectTrack', severity: '无问题', issue: '时间线展示主流程节点清楚（按钮角色问题单独跟踪）', status: '无需修复', fix: '-', commit: '-' },
  { id: 'yy0-ok-004', source: 'yy0', module: '文件下载', page: 'Downloads', severity: '无问题', issue: '文件列表、版本、下载/预览入口完整', status: '无需修复', fix: '-', commit: '-' },
  { id: 'yy0-ok-005', source: 'yy0', module: '专家档案', page: 'ExpertProfile', severity: '无问题', issue: '专家基础信息、专业领域、回避单位等完整', status: '无需修复', fix: '-', commit: '-' }
]

const statusColor = {
  '已修复': 'success',
  '部分修复': 'warning',
  '未修复': 'error',
  '无需修复': 'default'
}

const severityColor = {
  'P0': 'red',
  'P1': 'orange',
  'P2': 'blue',
  '中': 'blue',
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
    return { total, fixed, partial, pending, na }
  }, [])

  const columns = [
    { title: '编号', dataIndex: 'id', width: 110 },
    {
      title: '来源',
      dataIndex: 'source',
      width: 80,
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
          title="本页面汇总 2026-07-14 两次页面评审意见的当前处理状态，供团队追踪哪些问题已修复、哪些仍待修复。"
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
              { label: '无需修复', value: '无需修复' }
            ]}
          />
          <Select
            placeholder="按来源筛选"
            allowClear
            style={{ width: 120 }}
            value={sourceFilter}
            onChange={setSourceFilter}
            options={[
              { label: '胡桃 评审', value: '胡桃' },
              { label: 'yy0 评审', value: 'yy0' },
              { label: 'zph 评审', value: 'zph' },
              { label: 'cxy 评审', value: 'cxy' }
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
