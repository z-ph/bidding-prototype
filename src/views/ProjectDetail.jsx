import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Steps,
  Table,
  Tag,
  Timeline,
  message,
  Modal
} from 'antd'
import {
  CheckCircleOutlined,
  EditOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  CheckSquareOutlined
} from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { projectStore } from '../data/projects.js'
import { requirementStore } from '../data/requirements.js'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useRole()

  const [project] = useState(() => {
    const stored = projectStore.getProjectById(id)
    return stored || {
      id: Number(id) || 1,
      name: 'XX市轨道交通设备采购项目',
      code: 'ZB20260701001',
      type: '公开招标',
      orgMode: 'self',
      budget: 850,
      status: 'registering',
      publishTime: '2026-07-01',
      deadline: '2026-07-20',
      openTime: '2026-07-21 09:30',
      demandSource: '年度采购计划',
      demandCode: 'XQ-2026-001',
      linkedRequirementId: '',
      agentId: '',
      packages: [
        { name: '第一标段：主设备', code: 'B1', budget: 600, content: '主设备采购', purchaseMode: 'open', bidFee: 500, deposit: 50000, bidStart: '2026-07-10 09:00', bidEnd: '2026-07-20 17:00' },
        { name: '第二标段：辅材', code: 'B2', budget: 250, content: '辅助材料', purchaseMode: 'open', bidFee: 300, deposit: 20000, bidStart: '2026-07-10 09:00', bidEnd: '2026-07-20 17:00' }
      ],
      qualifications: ['营业执照', 'ISO9001认证'],
      intro: '本项目为轨道交通设备采购，包含主设备及辅材两个标段。'
    }
  })

  const linkedRequirement = project.linkedRequirementId
    ? requirementStore.getRequirementById(project.linkedRequirementId)
    : null

  const orgModeText = { self: '自行招标', agent: '委托代理' }[project.orgMode] || project.orgMode || '-'
  const agentOption = project.agentId
    ? [{ label: '诚信招标代理有限公司', value: 'agent_01' }, { label: '国信招标代理股份有限公司', value: 'agent_02' }, { label: '中机国际招标有限公司', value: 'agent_03' }].find((a) => a.value === project.agentId)
    : null

  const formatTime = (t) => {
    if (!t) return '-'
    return new Date(t).toLocaleString()
  }

  const beforeOpen = ['draft', 'tendering', 'registering'].includes(project.status)

  const statusMap = {
    draft: { text: '草稿', color: 'default' },
    tendering: { text: '招标中', color: 'success' },
    registering: { text: '报名中', color: 'processing' },
    pending_open: { text: '待开标', color: 'warning' },
    evaluating: { text: '评标中', color: 'error' },
    done: { text: '已完成', color: 'default' }
  }

  const iconMap = {
    CheckCircleOutlined,
    EditOutlined,
    UploadOutlined,
    PlayCircleOutlined,
    StarOutlined,
    TrophyOutlined,
    CheckSquareOutlined
  }

  const [nodes] = useState([
    { title: '创建采购需求', desc: '招标人创建需求并提交审核', time: '2026-07-01 10:00', color: 'green', icon: 'CheckCircleOutlined' },
    { title: '编制招标文件', desc: '代理机构编制招标文件、配置评标办法', time: '2026-07-02 14:00', color: 'green', icon: 'EditOutlined' },
    { title: '发布招标公告', desc: '招标公告已发布至门户，供应商可报名', time: '2026-07-03 09:00', color: 'green', icon: 'CheckCircleOutlined' },
    { title: '投标报名与缴费', desc: '供应商报名并通过审核、缴纳费用', time: '2026-07-05 16:00', color: 'green', icon: 'CheckCircleOutlined' },
    { title: '上传投标文件', desc: '供应商上传加密投标文件并报价', time: '进行中', color: 'blue', icon: 'UploadOutlined' },
    { title: '线上开标', desc: '开标大厅完成签到、解密、唱标', time: '待进行', color: 'gray', icon: 'PlayCircleOutlined' },
    { title: '线上评标', desc: '专家评分、生成评标报告', time: '待进行', color: 'gray', icon: 'StarOutlined' },
    { title: '定标公示', desc: '确认中标人并发布结果公示', time: '待进行', color: 'gray', icon: 'TrophyOutlined' },
    { title: '合同归档', desc: '上传合同，项目结束', time: '待进行', color: 'gray', icon: 'CheckSquareOutlined' }
  ])

  const publish = () => {
    Modal.confirm({
      title: '发标确认',
      content: `确认发布项目“${project.name}”？发布后将进入招标中状态并生成公告。`,
      okText: '确认发标',
      cancelText: '取消',
      onOk: () => {
        message.success('项目已发标，状态更新为“招标中”')
      }
    })
  }

  const goTenderDoc = () => {
    navigate({ to: '/admin/tender-doc', search: { projectId: project.id } })
  }

  const goOpeningHall = () => {
    navigate({ to: '/admin/opening-hall', search: { projectId: project.id } })
  }

  const packageColumns = [
    { title: '标段名称', dataIndex: 'name', width: 200 },
    { title: '标段编号', dataIndex: 'code', width: 100 },
    { title: '采购方式', dataIndex: 'purchaseMode', width: 120, render: (v) => ({ open: '公开招标', invitation: '邀请招标', inquiry: '公开询比价', invitation_inquiry: '邀请询比价' }[v] || v || '-') },
    { title: '预算金额', dataIndex: 'budget', width: 120, render: (v) => `${v} 万元` },
    { title: '标书费', dataIndex: 'bidFee', width: 100, render: (v) => (v ? `${v} 元` : '-') },
    { title: '保证金', dataIndex: 'deposit', width: 120, render: (v) => (v ? `${v} 元` : '-') },
    { title: '投标开始', dataIndex: 'bidStart', width: 160, render: (v) => formatTime(v) },
    { title: '投标截止', dataIndex: 'bidEnd', width: 160, render: (v) => formatTime(v) },
    { title: '采购内容', dataIndex: 'content', ellipsis: true }
  ]

  return (
    <div className="project-detail">
      <Card
        title={
          <div className="detail-header">
            <div>
              <h2>{project.name}</h2>
              <p className="subtitle">{project.code} · {project.type}</p>
            </div>
            <div className="detail-actions">
              <Tag color={statusMap[project.status]?.color || 'default'}>
                {statusMap[project.status]?.text || project.status}
              </Tag>
              {role === 'tenderee' && beforeOpen && (
                <Button onClick={() => message.success('进入编辑模式')} icon={<EditOutlined />}>
                  编辑
                </Button>
              )}
              {role === 'tenderee' && project.status === 'draft' && (
                <Button type="primary" onClick={publish}>发标</Button>
              )}
              {project.status === 'pending_open' && (
                <Button type="primary" onClick={goOpeningHall}>进入开标大厅</Button>
              )}
              <Button onClick={() => navigate({ to: '/admin/projects' })}>返回列表</Button>
            </div>
          </div>
        }
      >
        <Alert
          title="项目详情页集中展示项目基本信息、标段、招标文件、流程跟踪和当前可执行操作。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />

        <Descriptions column={3} bordered style={{ marginBottom: 20 }}>
          <Descriptions.Item label="项目编号">{project.code}</Descriptions.Item>
          <Descriptions.Item label="采购方式">{project.type}</Descriptions.Item>
          <Descriptions.Item label="组织方式">{orgModeText}</Descriptions.Item>
          <Descriptions.Item label="项目预算">{project.budget} 万元</Descriptions.Item>
          <Descriptions.Item label="发布时间">{project.publishTime}</Descriptions.Item>
          <Descriptions.Item label="报名截止">{project.deadline}</Descriptions.Item>
          <Descriptions.Item label="开标时间">{project.openTime}</Descriptions.Item>
          <Descriptions.Item label="代理机构">{agentOption ? agentOption.label : '-'}</Descriptions.Item>
          <Descriptions.Item label="资质要求">{project.qualifications.join('、')}</Descriptions.Item>
          <Descriptions.Item label="需求来源">{project.demandSource || '-'}</Descriptions.Item>
          <Descriptions.Item label="需求编号">{project.demandCode || '-'}</Descriptions.Item>
          <Descriptions.Item label="关联采购需求">
            {linkedRequirement ? `${linkedRequirement.id} ${linkedRequirement.title}` : '-'}
          </Descriptions.Item>
        </Descriptions>

        <Card title="标段信息" size="small" style={{ marginBottom: 20 }}>
          <Table
            rowKey="code"
            dataSource={project.packages}
            columns={packageColumns}
            pagination={false}
          />
        </Card>

        <Card
          title="招标文件"
          size="small"
          extra={<Button type="link" onClick={goTenderDoc}>查看/编辑招标文件</Button>}
          style={{ marginBottom: 20 }}
        >
          <p>招标公告、投标人须知、评标办法、合同条款、采购需求、投标文件格式等章节。</p>
        </Card>

        <Card title="项目流程跟踪" size="small">
          <Timeline
            items={nodes.map((node, idx) => {
              const Icon = iconMap[node.icon]
              return {
                key: idx,
                color: node.color,
                dot: Icon ? <Icon /> : null,
                content: (
                  <>
                    <h4>{node.title}</h4>
                    <p>{node.desc}</p>
                    <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{node.time}</p>
                  </>
                )
              }
            })}
          />
        </Card>
      </Card>

      <style>{`
        .project-detail {
          max-width: 1100px;
          margin: 0 auto;
        }
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .detail-header h2 {
          margin: 0;
        }
        .detail-header .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .detail-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>
    </div>
  )
}
