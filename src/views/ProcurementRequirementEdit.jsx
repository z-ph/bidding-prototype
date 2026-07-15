import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  message
} from 'antd'
import {
  SaveOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { requirementStore } from '../data/requirements.js'

export default function ProcurementRequirementEdit() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const queryId = searchParams.id
  const isCreate = !queryId

  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const requirementTypes = useMemo(() => requirementStore.getTypes(), [])

  useEffect(() => {
    if (isCreate) {
      form.resetFields()
      form.setFieldsValue({ status: 'draft' })
      return
    }
    const record = requirementStore.getRequirementById(queryId)
    if (!record) {
      message.error('采购需求不存在')
      navigate('/admin/procurement-requirements')
      return
    }
    form.setFieldsValue({
      id: record.id,
      title: record.title,
      type: record.type,
      budget: record.budget,
      content: record.content,
      status: record.status,
      publisher: record.publisher
    })
  }, [queryId, isCreate, form, navigate])

  const handleSave = async (nextStatus) => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const record = {
        ...values,
        id: isCreate ? undefined : values.id
      }
      const saved = requirementStore.saveRequirement(record)
      if (nextStatus && nextStatus !== saved.status) {
        requirementStore.updateStatus(saved.id, nextStatus)
      }
      message.success(isCreate ? '需求已创建' : '需求已更新')
      navigate('/admin/procurement-requirements')
    } catch {
      // validation failed
    } finally {
      setSaving(false)
    }
  }

  const statusOptions = [
    { label: '草稿', value: 'draft' },
    { label: '已发布', value: 'published' },
    { label: '已审核', value: 'approved' },
    { label: '已驳回', value: 'rejected' }
  ]

  return (
    <div className="procurement-requirement-edit">
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/procurement-requirements')}>
              返回
            </Button>
            <span>{isCreate ? '新建采购需求' : '编辑采购需求'}</span>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 720 }}
          initialValues={{ status: 'draft' }}
        >
          {!isCreate && (
            <Form.Item label="需求编号" name="id">
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            label="需求标题"
            name="title"
            rules={[{ required: true, message: '请输入需求标题' }]}
          >
            <Input placeholder="请输入需求标题" maxLength={100} showCount />
          </Form.Item>
          <Form.Item
            label="需求类型"
            name="type"
            rules={[{ required: true, message: '请选择需求类型' }]}
          >
            <Select placeholder="请选择需求类型" options={requirementTypes} />
          </Form.Item>
          <Form.Item
            label="预算金额（万元）"
            name="budget"
            rules={[{ required: true, message: '请输入预算金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入预算金额"
            />
          </Form.Item>
          <Form.Item
            label="具体需求内容"
            name="content"
            rules={[{ required: true, message: '请输入具体需求内容' }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="描述采购范围、技术要求、服务要求等"
              maxLength={2000}
              showCount
            />
          </Form.Item>
          <Form.Item
            label="当前状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态" options={statusOptions} />
          </Form.Item>
          <Form.Item label="发布人" name="publisher">
            <Input placeholder="例如：张三" />
          </Form.Item>

          <Space style={{ marginTop: 16 }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => handleSave()}
            >
              保存
            </Button>
            <Button
              icon={<SendOutlined />}
              onClick={() => handleSave('published')}
            >
              保存并发布
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => handleSave('approved')}
            >
              保存并审核
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleSave('rejected')}
            >
              保存并驳回
            </Button>
          </Space>
        </Form>
      </Card>

      <style>{`
        .procurement-requirement-edit {
          max-width: 900px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  )
}
