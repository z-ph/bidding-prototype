import { useState } from 'react'
import { Alert, Button, Card, Descriptions, Form, Input, Modal, Radio, Select, Table, Tag, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { objectionStore } from '../data/objectionStore.js'

export default function ObjectionManage() {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [replyVisible, setReplyVisible] = useState(false)
  const [currentRow, setCurrentRow] = useState(null)
  const [replyContent, setReplyContent] = useState('')

  const [objections, setObjections] = useState(() => objectionStore.getAll())

  const [form, setForm] = useState({ project: '1', type: '招标文件', content: '', attachments: [] })

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const statusType = (s) => {
    const map = { '待答复': 'warning', '已答复': 'success', '已驳回': 'error' }
    return map[s]
  }

  const refresh = (next) => {
    objectionStore.saveAll(next)
    setObjections(next)
  }

  const reply = (row) => {
    setCurrentRow(row)
    setReplyContent(row.reply || '')
    setReplyVisible(true)
  }

  const submitReply = () => {
    if (!currentRow) return
    if (!replyContent.trim()) {
      message.warning('请填写答复内容')
      return
    }
    const next = objectionStore.update(currentRow.id, { status: '已答复', reply: replyContent })
    refresh(next)
    setReplyVisible(false)
    setCurrentRow(null)
    setReplyContent('')
    message.success('异议已答复')
  }

  const reject = (row) => {
    Modal.confirm({
      title: '驳回确认',
      content: '确定驳回该异议吗？',
      okText: '驳回',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const next = objectionStore.update(row.id, { status: '已驳回', reply: '异议不成立，予以驳回。' })
        refresh(next)
        message.success('异议已驳回')
      }
    })
  }

  const view = (row) => {
    setCurrentRow(row)
    setDetailVisible(true)
  }

  const submit = () => {
    if (!form.content.trim()) {
      message.warning('请填写异议内容')
      return
    }
    const projectNameMap = {
      '1': 'XX市轨道交通设备采购项目',
      '2': '办公桌椅采购项目',
      '3': '软件开发服务项目',
      '4': '物业服务采购项目',
      '5': '实验室设备采购项目'
    }
    const next = objectionStore.add({
      id: `obj-${Date.now()}`,
      project: projectNameMap[form.project] || '未知项目',
      projectId: form.project,
      type: form.type,
      subType: '其他',
      bidder: '当前用户',
      content: form.content,
      status: '待答复',
      attachments: form.attachments.map((f) => f.name || f),
      reply: '',
      createdAt: new Date().toLocaleString()
    })
    refresh(next)
    message.success('异议已提交')
    setDialogVisible(false)
    setForm({ project: '1', type: '招标文件', content: '', attachments: [] })
  }

  const columns = [
    { title: '关联项目', dataIndex: 'project', minWidth: 220 },
    { title: '异议类型', dataIndex: 'type', width: 120 },
    { title: '质疑类型', dataIndex: 'subType', width: 100, render: (v) => v || '-' },
    { title: '提出人', dataIndex: 'bidder', width: 180 },
    { title: '异议内容', dataIndex: 'content', minWidth: 250, ellipsis: true },
    { title: '提交时间', dataIndex: 'createdAt', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => <Tag color={statusType(status)}>{status}</Tag>
    },
    {
      title: '操作',
      width: 220,
      fixed: 'right',
      render: (_, row) => (
        <>
          <Button type="link" onClick={() => view(row)}>查看</Button>
          {row.status === '待答复' && (
            <>
              <Button type="link" onClick={() => reply(row)}>答复</Button>
              <Button type="link" danger onClick={() => reject(row)}>驳回</Button>
            </>
          )}
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
          title="供应商可对招标文件、开标、评标、定标结果提出异议，招标方/代理应在规定时间内答复。答复可触发澄清或异常处理。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Table
          columns={columns}
          dataSource={objections}
          rowKey="id"
          pagination={false}
          style={{ width: '100%' }}
          scroll={{ x: 'max-content' }}
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
              options={[
                { label: 'XX市轨道交通设备采购项目', value: '1' },
                { label: '办公桌椅采购项目', value: '2' },
                { label: '软件开发服务项目', value: '3' },
                { label: '物业服务采购项目', value: '4' },
                { label: '实验室设备采购项目', value: '5' }
              ]}
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
          <Form.Item label="附件">
            <Upload
              fileList={form.attachments}
              onChange={({ fileList }) => updateField('attachments', fileList)}
              beforeUpload={() => false}
              multiple
            >
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="异议详情"
        open={detailVisible}
        width={700}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>
        ]}
      >
        {currentRow && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="关联项目">{currentRow.project}</Descriptions.Item>
            <Descriptions.Item label="异议类型">{currentRow.type}</Descriptions.Item>
            {currentRow.subType && <Descriptions.Item label="质疑类型">{currentRow.subType}</Descriptions.Item>}
            <Descriptions.Item label="提出人">{currentRow.bidder}</Descriptions.Item>
            <Descriptions.Item label="提交时间">{currentRow.createdAt}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusType(currentRow.status)}>{currentRow.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="异议内容">{currentRow.content}</Descriptions.Item>
            {currentRow.attachments?.length > 0 && (
              <Descriptions.Item label="附件">{currentRow.attachments.join('、')}</Descriptions.Item>
            )}
            {currentRow.reply && <Descriptions.Item label="答复内容">{currentRow.reply}</Descriptions.Item>}
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="答复异议"
        open={replyVisible}
        width={640}
        onCancel={() => setReplyVisible(false)}
        onOk={submitReply}
        okText="确认答复"
        cancelText="取消"
      >
        {currentRow && (
          <>
            <Alert
              title={`${currentRow.bidder} 对「${currentRow.project}」提出的${currentRow.type}异议`}
              description={currentRow.content}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form layout="horizontal" labelCol={{ flex: '80px' }}>
              <Form.Item label="答复内容">
                <Input.TextArea
                  rows={5}
                  placeholder="请输入答复内容..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
              </Form.Item>
            </Form>
          </>
        )}
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
