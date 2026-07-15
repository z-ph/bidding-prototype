import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tree,
  message
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined
} from '@ant-design/icons'
import EmptyState from '../components/EmptyState.jsx'
import { useRole } from '../hooks/useRole.js'

const ORG_KEY = 'bidding-organization'

const DATA_SCOPE_OPTIONS = [
  { label: '本人', value: 'self' },
  { label: '本部门', value: 'department' },
  { label: '本企业', value: 'enterprise' },
  { label: '全部', value: 'all' }
]

const defaultTree = [
  {
    name: 'XX集团',
    code: 'ROOT',
    leader: '张总',
    members: 120,
    dataScope: 'enterprise',
    children: [
      { name: '采购部', code: 'CG', leader: '张三', members: 8, dataScope: 'department' },
      { name: '招标代理部', code: 'ZB', leader: '李四', members: 12, dataScope: 'department' },
      { name: '法务部', code: 'FW', leader: '王五', members: 5, dataScope: 'department' }
    ]
  }
]

function readOrg() {
  try {
    const raw = localStorage.getItem(ORG_KEY)
    return raw ? JSON.parse(raw) : defaultTree
  } catch {
    return defaultTree
  }
}

function saveOrg(tree) {
  localStorage.setItem(ORG_KEY, JSON.stringify(tree))
}

function findNode(tree, code) {
  for (const node of tree) {
    if (node.code === code) return node
    if (node.children) {
      const found = findNode(node.children, code)
      if (found) return found
    }
  }
  return null
}

function findParent(tree, code, parent = null) {
  for (const node of tree) {
    if (node.code === code) return parent
    if (node.children) {
      const found = findParent(node.children, code, node)
      if (found !== undefined) return found
    }
  }
  return undefined
}

function addNode(tree, parentCode, newNode) {
  if (!parentCode) return [...tree, newNode]
  return tree.map((node) => {
    if (node.code === parentCode) {
      return { ...node, children: [...(node.children || []), newNode] }
    }
    if (node.children) {
      return { ...node, children: addNode(node.children, parentCode, newNode) }
    }
    return node
  })
}

function updateNode(tree, code, updater) {
  return tree.map((node) => {
    if (node.code === code) return updater(node)
    if (node.children) return { ...node, children: updateNode(node.children, code, updater) }
    return node
  })
}

function removeNode(tree, code) {
  return tree
    .filter((node) => node.code !== code)
    .map((node) => (node.children ? { ...node, children: removeNode(node.children, code) } : node))
}

export default function Organization() {
  const navigate = useNavigate()
  const { dataScope, setDataScope } = useRole()
  const [treeData, setTreeData] = useState(readOrg)
  const [selectedCode, setSelectedCode] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [form] = Form.useForm()

  const selectedDept = useMemo(() => (selectedCode ? findNode(treeData, selectedCode) : null), [selectedCode, treeData])

  const persist = (next) => {
    setTreeData(next)
    saveOrg(next)
  }

  const openAdd = () => {
    setModalType('add')
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = () => {
    if (!selectedDept) {
      message.warning('请先选择要编辑的部门')
      return
    }
    setModalType('edit')
    form.setFieldsValue({
      name: selectedDept.name,
      code: selectedDept.code,
      leader: selectedDept.leader
    })
    setModalOpen(true)
  }

  const handleDelete = () => {
    if (!selectedDept) {
      message.warning('请先选择要删除的部门')
      return
    }
    if (selectedDept.children && selectedDept.children.length > 0) {
      message.error('请先删除下级部门')
      return
    }
    Modal.confirm({
      title: '删除部门',
      content: `确定删除部门「${selectedDept.name}」吗？`,
      onOk: () => {
        persist(removeNode(treeData, selectedDept.code))
        setSelectedCode(null)
        message.success('部门已删除')
      }
    })
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (modalType === 'add') {
        const newNode = {
          name: values.name,
          code: values.code,
          leader: values.leader,
          members: 0,
          dataScope: 'department',
          children: []
        }
        persist(addNode(treeData, selectedDept?.code, newNode))
        message.success('部门已新增')
      } else {
        persist(updateNode(treeData, selectedDept.code, (node) => ({
          ...node,
          name: values.name,
          code: values.code,
          leader: values.leader
        })))
        setSelectedCode(values.code)
        message.success('部门已更新')
      }
      setModalOpen(false)
    })
  }

  const handleScopeChange = (value) => {
    if (!selectedDept) return
    persist(updateNode(treeData, selectedDept.code, (node) => ({ ...node, dataScope: value })))
    message.success('部门数据范围已更新')
  }

  const handleGlobalScopeChange = (value) => {
    setDataScope(value)
    message.success('当前用户数据范围已更新')
  }

  const onDrop = (info) => {
    const dropKey = info.node.code
    const dragKey = info.dragNode.code
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    if (dragKey === dropKey) return

    // Flatten tree for simpler reordering
    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].code === key) return callback(data, i, null)
        if (data[i].children) loop(data[i].children, key, callback)
      }
    }

    let dragObj = null
    const next = JSON.parse(JSON.stringify(treeData))

    loop(next, dragKey, (data, index) => {
      dragObj = data[index]
      data.splice(index, 1)
    })

    if (!dragObj) return

    const insertInto = (data, key, position) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].code === key) {
          if (position === 0) {
            data[i].children = data[i].children || []
            data[i].children.unshift(dragObj)
          } else {
            data.splice(i + (position > 0 ? 1 : 0), 0, dragObj)
          }
          return true
        }
        if (data[i].children && insertInto(data[i].children, key, position)) return true
      }
      return false
    }

    insertInto(next, dropKey, dropPosition)
    persist(next)
    message.success('部门位置已调整')
  }

  const selectDept = (_, info) => {
    setSelectedCode(info.node.code)
  }

  return (
    <div className="organization">
      <Card
        title={
          <div className="card-header">
            <span>组织机构</span>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增部门</Button>
              <Button icon={<EditOutlined />} onClick={openEdit}>编辑</Button>
              <Button icon={<DeleteOutlined />} danger onClick={handleDelete}>删除</Button>
              <Button icon={<TeamOutlined />} onClick={() => navigate('/admin/sub-accounts')}>子账号管理</Button>
            </Space>
          </div>
        }
      >
        <Row gutter={20}>
          <Col span={8}>
            <Tree
              treeData={treeData}
              fieldNames={{ title: 'name', key: 'code', children: 'children' }}
              defaultExpandAll
              draggable
              onSelect={selectDept}
              onDrop={onDrop}
              selectedKeys={selectedCode ? [selectedCode] : []}
            />
          </Col>
          <Col span={16}>
            {selectedDept ? (
              <>
                <Descriptions column={2} bordered title="部门信息">
                  <Descriptions.Item label="部门名称">{selectedDept.name}</Descriptions.Item>
                  <Descriptions.Item label="部门编码">{selectedDept.code}</Descriptions.Item>
                  <Descriptions.Item label="负责人">{selectedDept.leader}</Descriptions.Item>
                  <Descriptions.Item label="成员数">{selectedDept.members} 人</Descriptions.Item>
                  <Descriptions.Item label="数据范围">
                    <Select
                      style={{ width: 160 }}
                      value={selectedDept.dataScope || 'department'}
                      options={DATA_SCOPE_OPTIONS}
                      onChange={handleScopeChange}
                    />
                  </Descriptions.Item>
                </Descriptions>
                <Card size="small" title="当前用户数据范围" style={{ marginTop: 16 }}>
                  <Select
                    style={{ width: 160 }}
                    value={dataScope}
                    options={DATA_SCOPE_OPTIONS}
                    onChange={handleGlobalScopeChange}
                  />
                </Card>
              </>
            ) : (
              <EmptyState description="请选择左侧部门查看详情" icon="OfficeBuilding" />
            )}
          </Col>
        </Row>
      </Card>

      <Modal
        title={modalType === 'add' ? '新增部门' : '编辑部门'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="部门名称" name="name" rules={[{ required: true, message: '请输入部门名称' }]}>
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item label="部门编码" name="code" rules={[{ required: true, message: '请输入部门编码' }]}>
            <Input placeholder="请输入唯一编码" disabled={modalType === 'edit'} />
          </Form.Item>
          <Form.Item label="负责人" name="leader" rules={[{ required: true, message: '请输入负责人' }]}>
            <Input placeholder="请输入负责人姓名" />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .organization {
          max-width: 1200px;
          margin: 0 auto;
        }
        .organization .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
