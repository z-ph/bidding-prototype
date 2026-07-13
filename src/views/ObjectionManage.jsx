import { useState } from 'react'
import { Alert, Button, Card, Form, Input, Modal, Radio, Select, Table, Tag, message } from 'antd'

export default function ObjectionManage() {
  const [dialogVisible, setDialogVisible] = useState(false)

  const [objections, setObjections] = useState([
    { project: 'XX市轨道交通设备采购项目', type: '招标文件', bidder: 'B实业有限公司', content: '技术参数中某指标设置过高，建议澄清。', status: '已答复' },
    { project: '软件开发服务项目', type: '评标', bidder: 'A科技有限公司', content: '对评分结果有异议，申请复核。', status: '待答复' }
  ])

  const [form, setForm] = useState({ project: '', type: '招标文件', content: '' })

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const statusType = (s) => {
    const map = { '待答复': 'warning', '已答复': 'success', '已驳回': 'error' }
    return map[s]
  }

  const reply = (row) => {
    setObjections((prev) => prev.map((item) => (item === row ? { ...item, status: '已答复' } : item)))
    message.success('异议已答复')
  }
  const view = (row) => message.success(`查看异议：${row.content}`)
  const submit = () => {
    message.success('异议已提交')
    setDialogVisible(false)
  }

  const columns = [
    { title: '关联项目', dataIndex: 'project', minWidth: 220 },
    { title: '异议类型', dataIndex: 'type', width: 140 },
    { title: '提出人', dataIndex: 'bidder', width: 180 },
    { title: '异议内容', dataIndex: 'content', minWidth: 250 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => <Tag color={statusType(status)}>{status}</Tag>
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      render: (_, row) => (
        <>
          {row.status === '待答复' && (
            <Button type="link" onClick={() => reply(row)}>答复</Button>
          )}
          <Button type="link" onClick={() => view(row)}>查看</Button>
        </>
      )
    }
  ]

  return (
    <div className="objection-manage">
      <Card
        title={
          <div className="card-header">
            <span>异议管理</span>
            <Button type="primary" onClick={() => setDialogVisible(true)}>提出异议</Button>
          </div>
        }
      >
        <Alert
          message="供应商可对招标文件、开标、评标、定标结果提出异议，招标方/代理应在规定时间内答复。答复可触发澄清或异常处理。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Table
          columns={columns}
          dataSource={objections}
          rowKey={(row) => `${row.project}-${row.bidder}`}
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <Modal
        title="提出异议"
        open={dialogVisible}
        width={600}
        onCancel={() => setDialogVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDialogVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={submit}>提交</Button>
        ]}
      >
        <Form layout="horizontal" labelCol={{ flex: '100px' }}>
          <Form.Item label="关联项目">
            <Select
              value={form.project}
              onChange={(value) => updateField('project', value)}
              style={{ width: '100%' }}
              options={[{ label: 'XX市轨道交通设备采购项目', value: '1' }]}
            />
          </Form.Item>
          <Form.Item label="异议类型">
            <Radio.Group
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
            >
              <Radio value="招标文件">招标文件</Radio>
              <Radio value="开标">开标</Radio>
              <Radio value="评标">评标</Radio>
              <Radio value="中标结果">中标结果</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="异议内容">
            <Input.TextArea
              rows={5}
              placeholder="请详细描述异议内容..."
              value={form.content}
              onChange={(e) => updateField('content', e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .objection-manage {
          max-width: 1200px;
          margin: 0 auto;
        }
        .objection-manage .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
