import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import {
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Steps,
  Table,
  Tabs,
  Tag,
  message
} from 'antd'
import { EditOutlined, FileTextOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import StatusTag from '../components/StatusTag.jsx'
import { tenderDocStore } from '../data/tenderDocStore.js'
import { expertStore } from '../data/expertStore.js'

const evaluationProjects = [
  { id: '1', name: 'XX市轨道交通设备采购项目', code: 'ZB20260701001', stage: '评标中', deadline: '2026-07-10 17:00', isLeader: true },
  { id: '2', name: '办公桌椅采购项目', code: 'ZB20260702002', stage: '待评标', deadline: '2026-07-12 14:00', isLeader: false },
  { id: '3', name: '软件开发服务项目', code: 'ZB20260703003', stage: '评标中', deadline: '2026-07-15 09:00', isLeader: false }
]

export default function ExpertProject() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId

  if (!projectId) {
    return <ProjectList onEnter={(id) => navigate({ to: '/admin/expert-project', search: { projectId: id } })} />
  }

  return <EvaluationDetail projectId={projectId} onBack={() => navigate({ to: '/admin/expert-project' })} />
}

function ProjectList({ onEnter }) {
  const columns = [
    { title: '项目名称', dataIndex: 'name', minWidth: 260 },
    { title: '项目编号', dataIndex: 'code', width: 160 },
    {
      title: '当前阶段',
      dataIndex: 'stage',
      width: 120,
      render: (stage) => <StatusTag label={stage} status={stage} />
    },
    { title: '评标截止', dataIndex: 'deadline', width: 180 },
    {
      title: '身份',
      dataIndex: 'isLeader',
      width: 100,
      render: (isLeader) => isLeader ? <Tag color="gold">组长</Tag> : <Tag>成员</Tag>
    },
    {
      title: '操作',
      width: 150,
      render: (_, row) => (
        <Button type="primary" size="small" onClick={() => onEnter(row.id)}>
          进入评标
        </Button>
      )
    }
  ]

  return (
    <div className="expert-project-list">
      <Card title="评标任务列表">
        <Table
          rowKey="id"
          dataSource={evaluationProjects}
          columns={columns}
          pagination={false}
        />
      </Card>
      <style>{`
        .expert-project-list {
          max-width: 1100px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  )
}

function EvaluationDetail({ projectId, onBack }) {
  const tenderDocVersion = tenderDocStore.getCurrentPublishedVersion(projectId)
  // 评标办法评分项由招标文件配置驱动，不再固定商务30/技术40/价格30
  const scoreItems = tenderDocStore.getPublishedScoreItems(projectId)
  const scoreWeightTotal = scoreItems.reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
  const scoreColSpan = Math.max(4, Math.floor(24 / scoreItems.length))
  const initialScores = (base = {}) => {
    const scores = {}
    scoreItems.forEach((item) => {
      scores[item.id] = base[item.id] !== undefined ? base[item.id] : Math.round((Number(item.weight) || 0) * 0.8)
    })
    return scores
  }

  const [activeStep, setActiveStep] = useState(0)
  const [declared, setDeclared] = useState(false)
  const [docsRead, setDocsRead] = useState(false)
  const [signed, setSigned] = useState(false)
  const [signTime, setSignTime] = useState('')
  const [submitLocked, setSubmitLocked] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)

  // 专家名单优先取自专家抽取结果，无抽取记录时回退演示名单
  const [experts, setExperts] = useState(() => {
    const result = expertStore.getResult(projectId)
    if (result?.experts?.length) {
      return result.experts.map((e) => ({
        name: e.name,
        field: e.field,
        status: '已签到',
        isLeader: e.name === '专家甲'
      }))
    }
    return [
      { name: '专家甲', field: '电子信息', status: '已签到', isLeader: true },
      { name: '专家乙', field: '机械设备', status: '已签到', isLeader: false },
      { name: '专家丙', field: '工程造价', status: '已签到', isLeader: false }
    ]
  })

  const isLeader = experts.some((e) => e.name === '专家甲' && e.isLeader)

  const [bidders, setBidders] = useState([
    { name: 'A科技有限公司', scores: initialScores({ business: 25, tech: 32, price: 26 }), comment: '' },
    { name: 'B实业有限公司', scores: initialScores({ business: 24, tech: 30, price: 25 }), comment: '' },
    { name: 'C股份有限公司', scores: initialScores({ business: 27, tech: 35, price: 28 }), comment: '' }
  ])

  const allScored = bidders.every((b) =>
    scoreItems.every((item) => b.scores?.[item.id] !== null && b.scores?.[item.id] !== undefined) &&
    b.comment.trim() !== ''
  )

  const allExpertsSubmitted = submitLocked

  const updateBidder = (index, key, value) => {
    setBidders((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [key]: value } : b))
    )
  }

  const updateBidderScore = (index, scoreId, value) => {
    setBidders((prev) =>
      prev.map((b, i) => (i === index ? { ...b, scores: { ...b.scores, [scoreId]: value } } : b))
    )
  }

  const checkIn = () => {
    message.success('签到成功')
    setActiveStep((prev) => prev + 1)
  }

  const voteLeader = (row) => {
    setExperts((prev) =>
      prev.map((e) => ({ ...e, isLeader: e.name === row.name }))
    )
    message.success(`已推选 ${row.name} 为评标组长`)
  }

  const viewDoc = (name) => {
    if (name.includes('招标文件') && tenderDocVersion) {
      message.success(`在线查阅招标文件：${tenderDocVersion.versionNo}，发布时间：${tenderDocVersion.publishedAt || tenderDocVersion.updatedAt}`)
      return
    }
    message.success(`在线查阅：${name}`)
  }

  const doSign = () => {
    if (submitLocked) return
    setSigned(true)
    setSignTime(new Date().toLocaleString())
    message.success('电子签名完成')
  }

  const submitAll = () => {
    if (!allScored) {
      message.warning('请完成所有投标人的评分和评审意见')
      return
    }
    if (!signed) {
      message.warning('请先完成电子签名')
      return
    }
    Modal.confirm({
      title: '确认提交',
      content: '提交后评分结果将锁定，无法修改，是否继续？',
      okText: '确认提交',
      cancelText: '取消',
      onOk: () => {
        setSubmitLocked(true)
        message.success('评分已提交，结果已锁定')
      }
    })
  }

  const finish = () => {
    if (!signed) {
      message.warning('请先完成电子签名')
      return
    }
    submitAll()
  }

  const summarizeResults = () => {
    if (!allExpertsSubmitted) {
      message.warning('请等待所有专家提交评分')
      return
    }
    Modal.confirm({
      title: '统计评标结果',
      content: '系统将汇总所有专家评分并生成推荐意见，是否继续？',
      okText: '确认统计',
      cancelText: '取消',
      onOk: () => {
        message.success('评标结果已统计汇总')
        setReportGenerated(true)
      }
    })
  }

  const generateReport = () => {
    if (!reportGenerated) {
      message.warning('请先统计评标结果')
      return
    }
    Modal.confirm({
      title: '生成评标报告',
      content: '生成评标报告后将进入定标流程，是否继续？',
      okText: '确认生成',
      cancelText: '取消',
      onOk: () => {
        message.success('评标报告已生成')
      }
    })
  }

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(0, 21, 41, 0.75)',
      steps: [
        {
          element: '#expert-steps',
          popover: {
            title: '评标流程',
            description: '评标共分为 6 步：回避声明 → 专家签到 → 推选组长 → 查阅资料 → 在线评分 → 电子签名。',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '.step-content',
          popover: {
            title: '当前步骤',
            description: '按提示完成当前步骤操作，完成后点击底部按钮进入下一步。',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#expert-submit-btn',
          popover: {
            title: '提交评分',
            description: '所有专家评分并签名后，点击此处提交评标结果。',
            side: 'bottom',
            align: 'center'
          }
        }
      ]
    })
    driverObj.drive()
  }

  const expertColumns = [
    { title: '专家姓名', dataIndex: 'name' },
    { title: '专业领域', dataIndex: 'field' },
    { title: '签到状态', dataIndex: 'status' },
    {
      title: '操作',
      width: 180,
      render: (_, row) => (
        <Button
          type="primary"
          size="small"
          disabled={row.isLeader}
          onClick={() => voteLeader(row)}
        >
          {row.isLeader ? '已当选组长' : '推选为组长'}
        </Button>
      )
    }
  ]

  const docs = [
    {
      name: tenderDocVersion
        ? `招标文件（${tenderDocVersion.versionNo}）`
        : '招标文件',
      color: '#409EFF',
      version: tenderDocVersion?.versionNo
    },
    { name: '投标文件', color: '#67C23A' },
    { name: '开标记录', color: '#E6A23C' }
  ]

  const bidderTabItems = bidders.map((b, index) => ({
    key: b.name,
    label: b.name,
    children: (
      <Form labelCol={{ flex: '0 0 120px' }} wrapperCol={{ flex: 'auto' }}>
        <Row gutter={20}>
          {scoreItems.map((item) => (
            <Col span={scoreColSpan} key={item.id}>
              <Form.Item label={item.name}>
                <InputNumber
                  min={0}
                  max={Number(item.weight) || 100}
                  disabled={submitLocked}
                  value={b.scores?.[item.id]}
                  onChange={(value) => updateBidderScore(index, item.id, value)}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Form.Item label="评审意见">
          <Input.TextArea
            rows={3}
            placeholder="请填写评审意见"
            disabled={submitLocked}
            value={b.comment}
            onChange={(e) => updateBidder(index, 'comment', e.target.value)}
          />
        </Form.Item>
      </Form>
    )
  }))

  const reportSummary = bidders
    .map((b) => ({
      ...b,
      total: scoreItems.reduce((sum, item) => sum + (Number(b.scores?.[item.id]) || 0), 0)
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="expert-project">
      <Card
        title={
          <div className="hall-header">
            <div>
              <h2>评标项目</h2>
              <p className="subtitle">XX市轨道交通设备采购项目 · 标段一：主设备 · 项目ID：{projectId}</p>
            </div>
            <div className="hall-meta">
              <StatusTag
                label={submitLocked ? '已提交锁定' : '评标中'}
                status={submitLocked ? 'completed' : 'processing'}
              />
              {!submitLocked && (
                <Button type="primary" ghost icon={<QuestionCircleOutlined />} onClick={startTour}>
                  评标引导
                </Button>
              )}
              <Button onClick={onBack}>返回列表</Button>
              {!submitLocked ? (
                <Button id="expert-submit-btn" type="primary" onClick={submitAll}>
                  提交我的评分
                </Button>
              ) : (
                <Button disabled>已提交</Button>
              )}
              {isLeader && submitLocked && (
                <>
                  <Button type="primary" ghost onClick={summarizeResults}>
                    统计评标结果
                  </Button>
                  <Button type="primary" onClick={generateReport} disabled={!reportGenerated}>
                    生成评标报告
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        <div id="expert-steps" style={{ marginBottom: 24 }}>
          <Steps
            current={activeStep}
            items={[
              { title: '回避声明' },
              { title: '专家签到' },
              { title: '推选组长' },
              { title: '查阅资料' },
              { title: '在线评分' },
              { title: '电子签名' }
            ]}
          />
        </div>

        <div className="step-panel">
          {/* 步骤0：回避声明 */}
          {activeStep === 0 && (
            <div className="step-content">
              <h3>回避声明与评标纪律</h3>
              <p className="tip">请确认与投标人不存在利害关系，并承诺遵守评标纪律。</p>
              <Card className="declare-card" size="small">
                <p>1. 本人与本次招标项目的投标人及其利害关系人不存在任何利害关系；</p>
                <p>2. 本人将严格按照招标文件和评标办法独立、客观、公正地进行评审；</p>
                <p>3. 本人不会泄露评标过程中的任何商业秘密和投标人的保密信息。</p>
              </Card>
              <Checkbox
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                style={{ marginTop: 16 }}
              >
                我已阅读并遵守上述回避声明和评标纪律
              </Checkbox>
              <div className="stage-action">
                <Button
                  type="primary"
                  size="large"
                  disabled={!declared}
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  {declared ? '下一步：专家签到' : '请先勾选回避声明'}
                </Button>
              </div>
            </div>
          )}

          {/* 步骤1：专家签到 */}
          {activeStep === 1 && (
            <div className="step-content">
              <h3>专家签到</h3>
              <p className="tip">请确认身份信息并完成在线签到，评标开始前需全部专家签到完毕。</p>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="项目名称">XX市轨道交通设备采购项目</Descriptions.Item>
                <Descriptions.Item label="评标地点">线上评标大厅</Descriptions.Item>
                <Descriptions.Item label="专家姓名">专家甲</Descriptions.Item>
                <Descriptions.Item label="专业领域">电子信息</Descriptions.Item>
              </Descriptions>
              <div className="stage-action">
                <Button onClick={() => setActiveStep((prev) => prev - 1)}>返回</Button>
                <Button type="primary" size="large" onClick={checkIn}>完成签到</Button>
              </div>
            </div>
          )}

          {/* 步骤2：推选组长 */}
          {activeStep === 2 && (
            <div className="step-content">
              <h3>推选评标组长</h3>
              <p className="tip">评标委员会成员可自荐或推选组长，组长负责汇总评分和生成报告。</p>
              <Table
                columns={expertColumns}
                dataSource={experts}
                rowKey="name"
                pagination={false}
                style={{ width: '100%' }}
              />
              <div className="stage-action">
                <Button onClick={() => setActiveStep((prev) => prev - 1)}>返回</Button>
                <Button
                  type="primary"
                  size="large"
                  disabled={!isLeader}
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  {isLeader ? '下一步：查阅资料' : '请先推选组长'}
                </Button>
              </div>
            </div>
          )}

          {/* 步骤3：查阅资料 */}
          {activeStep === 3 && (
            <div className="step-content">
              <h3>查阅投标资料</h3>
              <p className="tip">请仔细查阅招标文件、投标文件、开标记录和报价一览表，为评分做准备。</p>
              <Row gutter={20}>
                {docs.map((doc) => (
                  <Col span={8} key={doc.name}>
                    <Card
                      hoverable
                      className="doc-card"
                      onClick={() => viewDoc(doc.name)}
                    >
                      <FileTextOutlined style={{ fontSize: 32, color: doc.color }} />
                      <p>{doc.name}</p>
                    </Card>
                  </Col>
                ))}
              </Row>
              <div className="stage-action">
                <Button onClick={() => setActiveStep((prev) => prev - 1)}>返回</Button>
                <Checkbox
                  checked={docsRead}
                  onChange={(e) => setDocsRead(e.target.checked)}
                  style={{ marginRight: 12 }}
                >
                  我已查阅全部投标资料
                </Checkbox>
                <Button
                  type="primary"
                  size="large"
                  disabled={!docsRead}
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  我已查阅，开始评分
                </Button>
              </div>
            </div>
          )}

          {/* 步骤4：在线评分 */}
          {activeStep === 4 && (
            <div className="step-content">
              <h3>在线评分</h3>
              <p className="tip">
                请按评分项独立打分，每个投标人满分 {scoreWeightTotal} 分（{scoreItems.map((i) => `${i.name} ${i.weight}`).join(' + ')}）。
              </p>
              <Tabs type="card" items={bidderTabItems} />
              <div className="stage-action">
                <Button onClick={() => setActiveStep((prev) => prev - 1)}>返回</Button>
                <Button
                  type="primary"
                  size="large"
                  disabled={!allScored || submitLocked}
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  {submitLocked ? '已锁定' : (allScored ? '提交评分并签名' : '请完成所有评分')}
                </Button>
              </div>
            </div>
          )}

          {/* 步骤5：电子签名 */}
          {activeStep === 5 && (
            <div className="step-content">
              <h3>电子签名确认</h3>
              <p className="tip">请使用 CA 证书对评分结果和评标报告进行电子签名，签名后不可修改。</p>
              <Card className={`sign-area${signed ? ' signed' : ''}`} size="small">
                <div className="sign-placeholder" onClick={doSign}>
                  <EditOutlined style={{ fontSize: 48, color: signed ? '#67C23A' : '#409EFF' }} />
                  <p>{signed ? '电子签名已完成' : '点击此处进行电子签名'}</p>
                  {signed && <p className="sign-time">签名时间：{signTime}</p>}
                </div>
              </Card>

              {isLeader && submitLocked && (
                <Card title="组长：评标结果汇总" size="small" style={{ marginTop: 20 }}>
                  <Table
                    rowKey="name"
                    dataSource={reportSummary}
                    pagination={false}
                    columns={[
                      { title: '排名', render: (_, __, idx) => idx + 1, width: 80 },
                      { title: '投标人', dataIndex: 'name' },
                      { title: '总分', dataIndex: 'total', width: 100 }
                    ]}
                  />
                  <div className="stage-action">
                    <Button type="primary" ghost onClick={summarizeResults}>
                      统计评标结果
                    </Button>
                    <Button type="primary" onClick={generateReport} disabled={!reportGenerated}>
                      生成评标报告
                    </Button>
                  </div>
                </Card>
              )}

              <div className="stage-action">
                <Button
                  disabled={submitLocked}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                >
                  返回修改
                </Button>
                <Button
                  type="primary"
                  size="large"
                  disabled={!signed || submitLocked}
                  onClick={finish}
                >
                  {submitLocked ? '已完成提交' : '完成签名并提交'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <style>{`
        .expert-project {
          max-width: 1100px;
          margin: 0 auto;
        }
        .expert-project .hall-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .expert-project .hall-header h2 {
          margin: 0;
        }
        .expert-project .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .expert-project .hall-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .expert-project .step-content h3 {
          margin-bottom: 8px;
        }
        .expert-project .tip {
          color: #666;
          margin-bottom: 16px;
        }
        .expert-project .declare-card p {
          margin: 8px 0;
          line-height: 1.6;
          color: #333;
        }
        .expert-project .doc-card {
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s;
        }
        .expert-project .doc-card:hover {
          transform: translateY(-4px);
        }
        .expert-project .doc-card p {
          margin-top: 8px;
        }
        .expert-project .sign-area {
          background: #f9fafc;
        }
        .expert-project .sign-area.signed {
          background: #f0f9eb;
        }
        .expert-project .sign-placeholder {
          height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed #dcdfe6;
          border-radius: 8px;
          cursor: pointer;
        }
        .expert-project .sign-area.signed .sign-placeholder {
          border-color: #67C23A;
        }
        .expert-project .sign-time {
          color: #67C23A;
          font-size: 12px;
          margin-top: 8px;
        }
        .expert-project .stage-action {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  )
}
