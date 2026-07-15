import { useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { Card, Select, InputNumber, Form, Button, Table, Tag, Alert, message, Modal, Empty } from 'antd'
import { TeamOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { expertStore } from '../data/expertStore.js'

const PROJECT_OPTIONS = [
  { id: '1', name: 'XX市轨道交通设备采购项目', fields: ['电子信息', '机械设备'] },
  { id: '3', name: '软件开发服务项目', fields: ['软件工程'] }
]

const FIELD_OPTIONS = [
  { label: '电子信息', value: '电子信息' },
  { label: '机械设备', value: '机械设备' },
  { label: '工程造价', value: '工程造价' },
  { label: '软件工程', value: '软件工程' }
]

const BIDDER_ORGS = ['A科技有限公司', 'B实业有限公司', 'C股份有限公司', 'D集团有限公司']

export default function ExpertExtraction() {
  const searchParams = useSearch({ strict: false })
  const initialProject = PROJECT_OPTIONS.find((p) => p.id === searchParams.projectId) || PROJECT_OPTIONS[0]
  const [projectId, setProjectId] = useState(initialProject.id)
  const [fields, setFields] = useState(initialProject.fields || [])
  const [count, setCount] = useState(3)
  const [avoidOrgs, setAvoidOrgs] = useState([])
  const [result, setResult] = useState(() => expertStore.getResult(initialProject.id))

  const onProjectChange = (id) => {
    setProjectId(id)
    const p = PROJECT_OPTIONS.find((x) => x.id === id)
    setFields(p?.fields || [])
    setResult(expertStore.getResult(id))
  }

  const doExtract = () => {
    if (count < 1) {
      message.warning('抽取人数至少为 1')
      return
    }
    const r = expertStore.extract(projectId, { fields, count, avoidOrgs })
    setResult({ ...r })
    message.success(`已随机抽取 ${r.experts.length} 名专家`)
  }

  const confirm = () => {
    if (!result || result.experts.length === 0) {
      message.warning('请先抽取专家')
      return
    }
    Modal.confirm({
      title: '确认专家名单',
      content: '确认后将通知相关专家参与评标，名单不可更改，是否继续？',
      okText: '确认并通知',
      cancelText: '取消',
      onOk: () => {
        const r = expertStore.confirmResult(projectId)
        setResult({ ...r })
        message.success('专家名单已确认并通知，专家可在“我的任务”中查看')
      }
    })
  }

  const columns = [
    { title: '专家姓名', dataIndex: 'name' },
    { title: '专业领域', dataIndex: 'field', render: (f) => <Tag color="blue">{f}</Tag> },
    { title: '所属单位', dataIndex: 'org' },
    { title: '联系方式', dataIndex: 'phone', width: 160 }
  ]

  return (
    <div className="expert-extraction">
      <Card title={<span><TeamOutlined /> 专家随机抽取</span>}>
        <Alert
          title="按项目所需专业领域随机抽取评标专家，系统自动应用回避规则（回避单位及关联投标人），抽取结果可重新生成，确认后通知专家。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Form labelCol={{ flex: '0 0 120px' }} wrapperCol={{ flex: 'auto' }}>
          <Form.Item label="选择项目">
            <Select
              style={{ width: 360 }}
              value={projectId}
              onChange={onProjectChange}
              options={PROJECT_OPTIONS.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item label="专业领域">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={fields}
              onChange={setFields}
              options={FIELD_OPTIONS}
              placeholder="选择项目所需专业领域"
            />
          </Form.Item>
          <Form.Item label="抽取人数">
            <InputNumber min={1} max={9} value={count} onChange={(v) => setCount(Number(v) || 1)} />
          </Form.Item>
          <Form.Item label="回避单位">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={avoidOrgs}
              onChange={setAvoidOrgs}
              options={BIDDER_ORGS.map((o) => ({ label: o, value: o }))}
              placeholder="选择需回避的投标人单位，关联单位专家将被排除"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<ReloadOutlined />} onClick={doExtract}>
              {result ? '重新抽取' : '执行抽取'}
            </Button>
            {result && !result.confirmed && (
              <Button type="primary" ghost icon={<CheckCircleOutlined />} style={{ marginLeft: 12 }} onClick={confirm}>
                确认并通知
              </Button>
            )}
          </Form.Item>
        </Form>

        {result && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>抽取结果</h4>
              <Tag color={result.confirmed ? 'success' : 'processing'}>
                {result.confirmed ? `已确认 · ${result.confirmedAt}` : `待确认 · 抽取于 ${result.extractedAt}`}
              </Tag>
            </div>
            {result.experts.length > 0 ? (
              <Table rowKey="id" dataSource={result.experts} columns={columns} pagination={false} size="small" bordered />
            ) : (
              <Empty description="未抽到符合条件的专家，请调整条件后重试" />
            )}
          </div>
        )}
      </Card>
      <style>{`
        .expert-extraction { max-width: 1000px; margin: 0 auto; }
      `}</style>
    </div>
  )
}
