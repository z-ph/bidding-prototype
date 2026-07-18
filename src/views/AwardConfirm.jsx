import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, Button, Card, DatePicker, Descriptions, Form, Input, Radio, Select, Steps, Table, Tag, Upload, message, Modal } from 'antd'
import { LockOutlined, UploadOutlined } from '@ant-design/icons'
import { projectStore } from '../data/projects.js'
import { evaluationStore } from '../data/evaluationStore.js'
import { approvalStore } from '../data/approvalStore.js'
import { useRole } from '../hooks/useRole.js'
import { BASELINE_PROJECTS, isInvitedRfqProject } from './ProjectList.jsx'
import ProjectEntryGuard from '../components/ProjectEntryGuard.jsx'

// 定标阶段（按推进顺序）：评标中 → 评标完成 → 已确认中标人 → 中标通知书已发出
const AWARD_STAGES = ['evaluating', 'evaluation-done', 'winner-confirmed', 'notice-sent']
const STAGE_LABELS = {
  evaluating: '评标中',
  'evaluation-done': '评标完成',
  'winner-confirmed': '已确认中标人',
  'notice-sent': '中标通知书已发出'
}

// 内置演示项目（与项目跟踪等页面同一套默认 mock）
const DEFAULT_PROJECTS = [
  { id: '1', name: 'XX市轨道交通设备采购项目' },
  { id: '2', name: '办公桌椅采购项目' }
]

// 现状可用的阶段判定（按优先级）：
// 1. 项目记录上的 awardStage —— 定标侧操作回写，最优先；
// 2. 邀请询比价（RFQ）项目（清单 20）无开标/评标环节，报价相关状态跳过「需评标完成」门槛，
//    直接视为「评标完成」即可确认中标人（isInvitedRfqProject：全部标段 purchaseMode 均为 invitation_inquiry）；
// 3. evaluationStore 评标状态 submitted/confirmed —— 评标环节已提交评标报告，视为「评标完成」；
// 4. 内置 1 号演示项目按历史演示口径默认处于「评标完成」（候选人已公示、待确认中标人），
//    其余项目默认「评标中」（evaluationStore 暂无其他页面写入，见实施报告说明）。
function resolveAwardStage(projectId, project) {
  if (project?.awardStage) return project.awardStage
  if (isInvitedRfqProject(project)) return 'evaluation-done'
  const evalStatus = evaluationStore.getEval(projectId).status
  if (evalStatus === 'submitted' || evalStatus === 'confirmed') return 'evaluation-done'
  if (String(projectId) === '1') return 'evaluation-done'
  return 'evaluating'
}

const stageIndex = (stage) => AWARD_STAGES.indexOf(stage)

export default function AwardConfirm() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const { role, userName } = useRole()
  const projectIdFromQuery = searchParams.projectId

  if (!projectIdFromQuery) {
    return <ProjectEntryGuard />
  }

  const [projectId, setProjectId] = useState(String(projectIdFromQuery))
  const [selected, setSelected] = useState('')
  const [form, setForm] = useState({ opinion: '' })
  // localStorage 无订阅机制：操作后递增 refreshTick 触发重读
  const [refreshTick, setRefreshTick] = useState(0)
  // 中标结果审批登记（清单 31：审批不在本系统完成，仅登记外部审批结果）
  const [regForm, setRegForm] = useState({ docNo: '', docDate: null, result: '通过', remark: '', files: [] })
  const [reRegistering, setReRegistering] = useState(false)

  const projectOptions = useMemo(() => {
    const stored = projectStore.getProjects().slice(0, 20)
    const map = new Map()
    DEFAULT_PROJECTS.forEach((p) => map.set(String(p.id), p.name))
    // 基线 mock 项目（含邀请询比价演示项目 id=6）也进入下拉，store 同 id 覆盖
    BASELINE_PROJECTS.forEach((p) => map.set(String(p.id), p.name))
    stored.forEach((p) => map.set(String(p.id), p.name))
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
  }, [refreshTick])

  // 与项目列表同一数据源：projectStore 优先，基线 mock 兜底（邀请询比价演示项目来自基线）
  const project = useMemo(
    () =>
      projectStore.getProjectById(projectId) ||
      BASELINE_PROJECTS.find((p) => String(p.id) === String(projectId)) ||
      null,
    [projectId, refreshTick]
  )
  const projectName =
    project?.name || projectOptions.find((p) => p.value === projectId)?.label || '-'

  const stage = resolveAwardStage(projectId, project)
  // 阶段门禁：确认中标人需项目到达「评标完成」
  const canConfirm = stageIndex(stage) >= stageIndex('evaluation-done')
  const confirmed = stageIndex(stage) >= stageIndex('winner-confirmed')

  // 切换/刷新项目时回填已确认结果，并重置审批登记表单
  useEffect(() => {
    const winner = projectStore.getProjectById(projectId)?.winner
    setSelected(winner?.name || '')
    setForm({ opinion: winner?.opinion || '' })
    setRegForm({ docNo: '', docDate: null, result: '通过', remark: '', files: [] })
    setReRegistering(false)
  }, [projectId, refreshTick])

  // 本项目的中标结果审批登记记录（approvalStore type=award-result，按 refId=award-{projectId} 匹配，取最新一条）
  const registration = useMemo(
    () =>
      approvalStore
        .list({ type: 'award-result' })
        .find((a) => a.refId === `award-${projectId}`) || null,
    [projectId, refreshTick]
  )

  // 登记外部审批结果：保存为 approvalStore 实例（type award-result），创建后直接 act approve 标记已登记，
  // records 注明「外部审批结果登记」，不产生系统内审批待办（清单 31）
  const registerResult = () => {
    if (!regForm.docNo.trim()) {
      message.warning('请填写审批文号')
      return
    }
    if (!regForm.docDate) {
      message.warning('请选择审批日期')
      return
    }
    const docDate = regForm.docDate.format('YYYY-MM-DD')
    const instance = approvalStore.create({
      type: 'award-result',
      refId: `award-${projectId}`,
      title: `${projectName} 中标结果审批登记`,
      publisherKind: role === 'agent' ? 'agent' : 'self',
      submittedBy: userName,
      projectId
    })
    // 登记字段（文号/日期/结果/备注/附件）补充到实例上（仅消费 store 公开 list/saveAll，不改 store 文件）
    const all = approvalStore.list()
    const idx = all.findIndex((a) => String(a.id) === String(instance.id))
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        docNo: regForm.docNo.trim(),
        docDate,
        result: regForm.result,
        remark: regForm.remark.trim(),
        attachments: regForm.files.map((f) => f.name)
      }
      approvalStore.saveAll(all)
    }
    approvalStore.act(
      instance.id,
      'approve',
      userName,
      `外部审批结果登记：${regForm.result}（文号 ${regForm.docNo.trim()}，日期 ${docDate}）`
    )
    // 清单 31：审批在外部完成，系统内仅登记结果——登记后直接置为已通过并写入 finishedAt，
    // 不产生系统内审批待办（self 链两级时 act 只推进一个节点，需在此补齐收尾）
    const after = approvalStore.list()
    const afterIdx = after.findIndex((a) => String(a.id) === String(instance.id))
    if (afterIdx >= 0) {
      after[afterIdx] = {
        ...after[afterIdx],
        status: 'approved',
        finishedAt: new Date().toLocaleString(),
        currentNodeIndex: Math.max(0, (after[afterIdx].chain || []).length - 1),
        currentAssignee: ''
      }
      approvalStore.saveAll(after)
    }
    message.success('审批结果已登记，记录已进入项目归档')
    setRefreshTick((t) => t + 1)
  }

  const candidates = [
    { rank: 1, name: 'C股份有限公司', total: 93, price: 798, recommend: '综合得分最高，推荐为第一中标候选人' },
    { rank: 2, name: 'A科技有限公司', total: 89, price: 820, recommend: '推荐为第二中标候选人' },
    { rank: 3, name: 'B实业有限公司', total: 84, price: 845, recommend: '推荐为第三中标候选人' }
  ]

  const rankText = (rank) => ['一', '二', '三'][rank - 1] || rank

  const choose = (row) => {
    setSelected(row.name)
    setForm({ opinion: `经公示无异议，确定第${rankText(row.rank)}中标候选人 ${row.name} 为中标人。` })
  }

  const confirm = () => {
    if (!selected) {
      message.warning('请先选择中标人')
      return
    }
    Modal.confirm({
      title: '确认中标人',
      content: `确定将 ${selected} 确认为「${projectName}」的中标人吗？确认后项目进入中标结果公示环节，并解锁中标通知书发送。`,
      okText: '确认中标',
      cancelText: '取消',
      onOk: () => {
        const winnerRow = candidates.find((c) => c.name === selected)
        projectStore.saveProject({
          ...(project || {}),
          id: projectId,
          name: projectName,
          awardStage: 'winner-confirmed',
          winner: {
            name: selected,
            total: winnerRow?.total,
            price: winnerRow?.price,
            opinion: form.opinion,
            confirmedAt: new Date().toISOString()
          }
        })
        setRefreshTick((t) => t + 1)
        message.success(`已确认中标人：${selected}`)
        navigate({ to: '/admin/award-notice', search: { projectId } })
      }
    })
  }

  const columns = [
    { title: '排名', dataIndex: 'rank', width: 80 },
    { title: '投标人', dataIndex: 'name', minWidth: 200 },
    { title: '综合得分', dataIndex: 'total', width: 120 },
    { title: '投标报价（万元）', dataIndex: 'price', width: 160 },
    { title: '评标委员会推荐意见', dataIndex: 'recommend', minWidth: 200 },
    {
      title: '选择',
      width: 120,
      render: (_, row) => (
        <Radio
          checked={selected === row.name}
          disabled={!canConfirm || confirmed}
          onChange={() => choose(row)}
        >
          选择
        </Radio>
      )
    }
  ]

  const stepsCurrent = {
    evaluating: 0,
    'evaluation-done': 2,
    'winner-confirmed': 3,
    'notice-sent': 4
  }[stage]

  return (
    <div className="award-confirm">
      <Card
        title={
          <div className="card-header">
            <span>确认中标人</span>
            <span>
              <Tag color="warning">项目：{projectName}</Tag>
              <Tag color={canConfirm ? 'processing' : 'default'}>{STAGE_LABELS[stage]}</Tag>
            </span>
          </div>
        }
      >
        <div className="project-bar">
          <span className="project-bar-label">选择项目</span>
          <Select
            style={{ minWidth: 320 }}
            value={projectId}
            options={projectOptions}
            onChange={(value) => setProjectId(String(value))}
          />
        </div>
        <Steps
          current={stepsCurrent}
          style={{ marginBottom: 24 }}
          items={[
            { title: '评标结束' },
            { title: '候选人公示' },
            { title: '确认中标人' },
            { title: '结果公示' },
            { title: '发送通知书' }
          ]}
        />
        {!canConfirm && (
          <Alert
            title={`当前项目阶段：${STAGE_LABELS[stage]}。需项目到达「评标完成」阶段后才能确认中标人，请先在评标环节完成评审并提交评标报告。`}
            type="warning"
            showIcon
            icon={<LockOutlined />}
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}
        {canConfirm && !confirmed && (
          <Alert
            title="公示期结束后，招标人在此处确认最终中标人。确认后将进入中标结果公示和中标通知书发送环节。"
            type="info"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}
        {confirmed && (
          <Alert
            title={`本项目已确认中标人：${project?.winner?.name || selected}（${project?.winner?.confirmedAt ? new Date(project.winner.confirmedAt).toLocaleString() : '-'}），当前阶段：${STAGE_LABELS[stage]}。`}
            type="success"
            showIcon
            closable={false}
            style={{ marginBottom: 20 }}
          />
        )}
        <h3>中标候选人排名</h3>
        <Table
          columns={columns}
          dataSource={candidates}
          rowKey="name"
          bordered
          pagination={false}
          style={{ width: '100%' }}
        />
        <Form layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="定标意见">
            <Input.TextArea
              rows={4}
              placeholder="请填写定标意见..."
              value={form.opinion}
              disabled={!canConfirm || confirmed}
              onChange={(e) => setForm((prev) => ({ ...prev, opinion: e.target.value }))}
            />
          </Form.Item>
        </Form>
        <div className="actions">
          <Button
            type="primary"
            size="large"
            disabled={!canConfirm || confirmed}
            onClick={confirm}
          >
            确认中标人
          </Button>
          <Button
            size="large"
            disabled={!confirmed}
            onClick={() => navigate({ to: '/admin/award-notice', search: { projectId } })}
          >
            下一步：发送中标通知书
          </Button>
        </div>
      </Card>

      {confirmed && (
        <Card title="中标结果审批结果登记" size="small" style={{ marginTop: 20 }}>
          {registration && !reRegistering ? (
            <>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="审批文号">{registration.docNo || '-'}</Descriptions.Item>
                <Descriptions.Item label="审批日期">{registration.docDate || '-'}</Descriptions.Item>
                <Descriptions.Item label="审批结果">
                  <Tag color={registration.result === '不通过' ? 'error' : 'success'}>
                    {registration.result || '通过'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="登记人">
                  {registration.records?.[0]?.actor || registration.submittedBy || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="登记时间">{registration.finishedAt || '-'}</Descriptions.Item>
                <Descriptions.Item label="附件">
                  {(registration.attachments || []).join('、') || '-'}
                </Descriptions.Item>
                {registration.remark && (
                  <Descriptions.Item label="备注" span={2}>{registration.remark}</Descriptions.Item>
                )}
              </Descriptions>
              <Alert
                title={
                  registration.result === '不通过'
                    ? '登记结果为不通过，中标结果不可发布。'
                    : '审批结果已登记（外部审批，清单 31），中标结果可进入发布环节；登记记录已进入项目归档。'
                }
                type={registration.result === '不通过' ? 'error' : 'success'}
                showIcon
                closable={false}
                style={{ marginTop: 16 }}
              />
              {registration.result === '不通过' && (
                <Button style={{ marginTop: 16 }} onClick={() => setReRegistering(true)}>
                  重新登记
                </Button>
              )}
            </>
          ) : (
            <>
              <Alert
                title="中标结果需经外部审批后登记（清单 31：审批不在本系统完成，系统内仅登记审批结果）；未登记前中标结果不可发布。"
                type="warning"
                showIcon
                closable={false}
                style={{ marginBottom: 16 }}
              />
              <Form layout="vertical">
                <Form.Item label="审批文号" required>
                  <Input
                    placeholder="请输入外部审批文号"
                    value={regForm.docNo}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, docNo: e.target.value }))}
                    maxLength={100}
                  />
                </Form.Item>
                <Form.Item label="审批日期" required>
                  <DatePicker
                    style={{ width: '100%' }}
                    value={regForm.docDate}
                    onChange={(value) => setRegForm((prev) => ({ ...prev, docDate: value }))}
                  />
                </Form.Item>
                <Form.Item label="审批结果" required>
                  <Radio.Group
                    value={regForm.result}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, result: e.target.value }))}
                    options={[
                      { label: '通过', value: '通过' },
                      { label: '不通过', value: '不通过' }
                    ]}
                  />
                </Form.Item>
                <Form.Item label="备注">
                  <Input.TextArea
                    rows={3}
                    placeholder="审批情况说明（选填）"
                    value={regForm.remark}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, remark: e.target.value }))}
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
                <Form.Item label="审批附件（选填）">
                  <Upload
                    fileList={regForm.files}
                    beforeUpload={() => false}
                    onChange={({ fileList }) => setRegForm((prev) => ({ ...prev, files: fileList }))}
                    multiple
                  >
                    <Button icon={<UploadOutlined />}>选择文件</Button>
                  </Upload>
                </Form.Item>
              </Form>
              <Button type="primary" onClick={registerResult}>
                登记审批结果
              </Button>
            </>
          )}
        </Card>
      )}

      <style>{`
        .award-confirm {
          max-width: 1100px;
          margin: 0 auto;
        }
        .award-confirm .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        .award-confirm .project-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .award-confirm .project-bar-label {
          font-weight: 500;
        }
        .award-confirm .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  )
}
