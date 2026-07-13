import { useState } from 'react'
import { Button, Card, Form, Input, Modal, Select, Table, message } from 'antd'
import StatusTag from '../components/StatusTag.jsx'

export default function SupervisorAbnormal() {
  const [records, setRecords] = useState([
    { id: 'YC20260708001', project: 'XX市轨道交通设备采购项目', type: '开标异常', desc: '投标人 A 公司 CA 证书检测失败，已要求重新插拔。', status: '已处理', time: '2026-07-08 15:10' }
  ])

  const [dialogVisible, setDialogVisible] = useState(false)
  const [form, setForm] = useState({
    project: '',
    type: '开标异常',
    desc: ''
  })

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const openDialog = () => {
    setDialogVisible(true)
  }

  const submitRecord = () => {
    if (!form.project || !form.desc) {
      message.warning('请填写完整异常信息')
      return
    }
    setRecords((prev) => [
      {
        id: 'YC' + Date.now(),
        project: form.project,
        type: form.type,
        desc: form.desc,
        status: '待处理',
        time: new Date().toLocaleString()
      },
      ...prev
    ])
    setDialogVisible(false)
    setForm((prev) => ({ ...prev, project: '', desc: '' }))
    message.success('异常记录已登记')
  }

  const columns = [
    { title: '编号', dataIndex: 'id', width: 120 },
    { title: '涉及项目', dataIndex: 'project', minWidth: 220 },
    { title: '异常类型', dataIndex: 'type', width: 140 },
    { title: '异常描述', dataIndex: 'desc', minWidth: 260 },
    {
      title: '处理状态',
      dataIndex: 'status',
      width: 120,
      render: (status) => (
        <StatusTag label={status} status={status === '已处理' ? 'completed' : 'pending'} />
      )
    },
    { title: '登记时间', dataIndex: 'time', width: 160 }
  ]

  return (
    <div className="supervisor-abnormal">
      <Card
        title={
          <div className="card-header">
            <span>监督异常登记与处理</span>
            <Button type="primary" onClick={openDialog}>登记异常</Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          bordered
          pagination={false}
          style={{ width: '100%' }}
        />
      </Card>

      <Modal
        title="登记异常"
        open={dialogVisible}
        width={600}
        onCancel={() => setDialogVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDialogVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={submitRecord}>提交</Button>
        ]}
      >
        <Form labelCol={{ flex: '0 0 100px' }} wrapperCol={{ flex: 'auto' }}>
          <Form.Item label="涉及项目">
            <Input
              value={form.project}
              onChange={(e) => updateField('project', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="异常类型">
            <Select
              style={{ width: '100%' }}
              value={form.type}
              onChange={(value) => updateField('type', value)}
              options={[
                { label: '开标异常', value: '开标异常' },
                { label: '评标异常', value: '评标异常' },
                { label: '专家违规', value: '专家违规' },
                { label: '其他', value: '其他' }
              ]}
            />
          </Form.Item>
          <Form.Item label="异常描述">
            <Input.TextArea
              rows={4}
              value={form.desc}
              onChange={(e) => updateField('desc', e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .supervisor-abnormal {
          max-width: 1200px;
          margin: 0 auto;
        }
        .supervisor-abnormal .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          width: 100%;
        }
      `}</style>
    </div>
  )
}
