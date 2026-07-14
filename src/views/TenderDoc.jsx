import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Alert,
  Row,
  Col,
  Card,
  Tree,
  Tag,
  Button,
  Descriptions,
  Form,
  Input,
  Upload,
  Divider,
  Timeline,
  message,
  Modal,
  Select
} from 'antd'
import { InboxOutlined, PlusOutlined, DeleteOutlined, ImportOutlined } from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'

const defaultCatalog = [
  {
    key: '招标公告',
    title: '招标公告',
    children: [
      { key: '项目概况', title: '项目概况', content: '' },
      { key: '投标人资格要求', title: '投标人资格要求', content: '' }
    ]
  },
  { key: '投标人须知', title: '投标人须知', content: '' },
  { key: '评标办法', title: '评标办法', content: '' },
  { key: '合同条款', title: '合同条款', content: '' },
  {
    key: '采购需求',
    title: '采购需求',
    children: [
      { key: '技术规格', title: '技术规格', content: '' },
      { key: '商务要求', title: '商务要求', content: '' }
    ]
  },
  { key: '投标文件格式', title: '投标文件格式', content: '' }
]

const templates = [
  {
    name: '货物类公开招标',
    catalog: [
      {
        key: '招标公告',
        title: '招标公告',
        children: [
          { key: '项目概况', title: '项目概况', content: '货物类项目概况...' },
          { key: '投标人资格要求', title: '投标人资格要求', content: '' }
        ]
      },
      { key: '投标人须知', title: '投标人须知', content: '投标人须知正文...' },
      { key: '评标办法', title: '评标办法', content: '综合评分法...' },
      { key: '合同条款', title: '合同条款', content: '' },
      {
        key: '采购需求',
        title: '采购需求',
        children: [
          { key: '技术规格', title: '技术规格', content: '' },
          { key: '商务要求', title: '商务要求', content: '' }
        ]
      },
      { key: '投标文件格式', title: '投标文件格式', content: '' }
    ]
  },
  {
    name: '服务类公开招标',
    catalog: [
      {
        key: '招标公告',
        title: '招标公告',
        children: [
          { key: '项目概况', title: '项目概况', content: '服务类项目概况...' },
          { key: '投标人资格要求', title: '投标人资格要求', content: '' }
        ]
      },
      { key: '投标人须知', title: '投标人须知', content: '' },
      { key: '评标办法', title: '评标办法', content: '性价比法...' },
      { key: '合同条款', title: '合同条款', content: '' },
      {
        key: '采购需求',
        title: '采购需求',
        children: [
          { key: '服务要求', title: '服务要求', content: '' },
          { key: '人员要求', title: '人员要求', content: '' }
        ]
      },
      { key: '投标文件格式', title: '投标文件格式', content: '' }
    ]
  }
]

export default function TenderDoc() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  const { role } = useRole()
  const canEdit = role === 'tenderee' || role === 'agent'

  const [docStatus, setDocStatus] = useState('editing') // editing, reviewed, published
  const version = 'V1.0'
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString())

  const [catalog, setCatalog] = useState(defaultCatalog)
  const [selectedKeys, setSelectedKeys] = useState(['招标公告'])
  const [currentNode, setCurrentNode] = useState({
    label: '招标公告',
    content: '【招标公告正文】\n\n一、招标条件\n本项目已由相关部门批准建设，招标人为 XX单位，资金来源为自筹。\n\n二、项目概况与招标范围\n...'
  })
  const [newNodeName, setNewNodeName] = useState('')

  const [fileList, setFileList] = useState([
    { uid: '-1', name: '图纸.zip', size: 1024000 },
    { uid: '-2', name: '技术参数表.xlsx', size: 256000 }
  ])

  const [history, setHistory] = useState([
    { id: 1, content: '李四 创建了招标文件 V1.0', time: '2026-07-08 09:00', type: 'primary' },
    { id: 2, content: '李四 编辑了“招标公告”章节', time: '2026-07-08 10:30', type: 'info' }
  ])

  const [importVisible, setImportVisible] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const statusLabelMap = { editing: '编辑中', reviewed: '已复核', published: '已发布' }
  const statusColorMap = { editing: 'default', reviewed: 'warning', published: 'success' }
  const timelineColorMap = { primary: 'blue', info: 'gray', success: 'green', warning: 'orange', danger: 'red' }

  const canPublish = currentNode.content.length > 50 && fileList.length > 0

  const findNode = (nodes, key) => {
    for (const node of nodes) {
      if (node.key === key) return node
      if (node.children) {
        const found = findNode(node.children, key)
        if (found) return found
      }
    }
    return null
  }

  const selectNode = (keys, info) => {
    const key = keys[0] || info.node.key
    setSelectedKeys([key])
    const node = findNode(catalog, key)
    if (node) {
      setCurrentNode({
        label: node.title,
        content: node.content || `${node.title} 内容待编辑...`
      })
    }
  }

  const updateNodeContent = (nodes, key, title, content) => {
    return nodes.map((node) => {
      if (node.key === key) {
        return { ...node, title, content }
      }
      if (node.children) {
        return { ...node, children: updateNodeContent(node.children, key, title, content) }
      }
      return node
    })
  }

  const addNode = () => {
    if (!newNodeName.trim()) {
      message.warning('请输入目录名称')
      return
    }
    const key = `${newNodeName}-${Date.now()}`
    const newCatalog = [...catalog, { key, title: newNodeName, content: '' }]
    setCatalog(newCatalog)
    setNewNodeName('')
    setHistory((prev) => [
      { id: Date.now(), content: `新增目录节点“${newNodeName}”`, time: new Date().toLocaleString(), type: 'info' },
      ...prev
    ])
    message.success('目录节点已添加')
  }

  const deleteNode = () => {
    const key = selectedKeys[0]
    if (!key) return
    Modal.confirm({
      title: '删除确认',
      content: `确定删除目录节点“${key}”吗？`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const remove = (nodes) => nodes.filter((n) => n.key !== key).map((n) => ({
          ...n,
          children: n.children ? remove(n.children) : undefined
        }))
        const newCatalog = remove(catalog)
        setCatalog(newCatalog)
        setSelectedKeys(['招标公告'])
        setCurrentNode({ label: '招标公告', content: '招标公告内容...' })
        setHistory((prev) => [
          { id: Date.now(), content: `删除目录节点“${key}”`, time: new Date().toLocaleString(), type: 'warning' },
          ...prev
        ])
        message.success('目录节点已删除')
      }
    })
  }

  const onDrop = (info) => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr)
          return
        }
        if (item.children) {
          loop(item.children, key, callback)
        }
      })
    }

    const data = JSON.parse(JSON.stringify(catalog))
    let dragObj
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!info.dropToGap) {
      loop(data, dropKey, (item) => {
        item.children = item.children || []
        item.children.unshift(dragObj)
      })
    } else if ((info.node.children || []).length > 0 && info.node.expanded && dropPosition === 1) {
      loop(data, dropKey, (item) => {
        item.children = item.children || []
        item.children.unshift(dragObj)
      })
    } else {
      let ar
      let i
      loop(data, dropKey, (item, index, arr) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }
    setCatalog(data)
    setHistory((prev) => [
      { id: Date.now(), content: `调整目录节点“${dragKey}”顺序`, time: new Date().toLocaleString(), type: 'info' },
      ...prev
    ])
  }

  const saveDoc = () => {
    const now = new Date().toLocaleString()
    const newCatalog = updateNodeContent(catalog, selectedKeys[0], currentNode.label, currentNode.content)
    setCatalog(newCatalog)
    setLastUpdate(now)
    setHistory((prev) => [
      {
        id: Date.now(),
        content: `${role === 'tenderee' ? '张三' : '李四'} 编辑了“${currentNode.label}”章节`,
        time: now,
        type: 'info'
      },
      ...prev
    ])
    message.success('招标文件已保存')
  }

  const previewDoc = () => {
    message.success('打开招标文件预览')
  }

  const publishDoc = () => {
    Modal.confirm({
      title: '发布确认',
      content: '发布后将不可直接修改，是否继续？',
      okText: '确认发布',
      cancelText: '取消',
      onOk: () => {
        const now = new Date().toLocaleString()
        setDocStatus('published')
        setLastUpdate(now)
        setHistory((prev) => [
          {
            id: Date.now(),
            content: '张三 复核并发布了招标文件',
            time: now,
            type: 'success'
          },
          ...prev
        ])
        message.success('招标文件已生成，可关联项目发布')
      }
    })
  }

  const importTemplate = () => {
    if (!selectedTemplate) {
      message.warning('请选择要导入的模板')
      return
    }
    const tpl = templates.find((t) => t.name === selectedTemplate)
    if (tpl) {
      setCatalog(JSON.parse(JSON.stringify(tpl.catalog)))
      setCurrentNode({ label: '招标公告', content: '招标公告内容...' })
      setSelectedKeys(['招标公告'])
      setHistory((prev) => [
        { id: Date.now(), content: `一键导入模板“${tpl.name}”`, time: new Date().toLocaleString(), type: 'success' },
        ...prev
      ])
      message.success(`已导入模板：${tpl.name}`)
    }
    setImportVisible(false)
    setSelectedTemplate(null)
  }

  return (
    <div className="tender-doc">
      {docStatus === 'published' && (
        <Alert
          message="当前招标文件已发布，如需修改请先创建新版本。"
          type="warning"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={20} className="doc-layout">
        <Col span={5}>
          <Card
            className="catalog-card"
            title={
              <div className="card-header"><span>招标文件目录</span></div>
            }
            extra={
              canEdit && docStatus !== 'published' && (
                <>
                  <Button size="small" icon={<ImportOutlined />} onClick={() => setImportVisible(true)}>导入模板</Button>
                </>
              )
            }
          >
            {canEdit && docStatus !== 'published' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <Input
                  size="small"
                  placeholder="新目录名称"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  onPressEnter={addNode}
                />
                <Button size="small" icon={<PlusOutlined />} onClick={addNode} />
                <Button size="small" danger icon={<DeleteOutlined />} onClick={deleteNode} disabled={!selectedKeys[0]} />
              </div>
            )}
            <Tree
              treeData={catalog}
              defaultExpandAll
              selectedKeys={selectedKeys}
              draggable={canEdit && docStatus !== 'published'}
              onSelect={selectNode}
              onDrop={onDrop}
            />
          </Card>
        </Col>
        <Col span={19}>
          <Card
            className="editor-card"
            title={
              <div className="header-left">
                <span>{currentNode.label}</span>
                <Tag color={statusColorMap[docStatus]}>{statusLabelMap[docStatus]}</Tag>
                <span className="version-tag">版本 {version}</span>
                {projectId && <span className="version-tag">项目 ID: {projectId}</span>}
              </div>
            }
            extra={
              <div>
                <Button disabled={docStatus === 'published' || !canEdit} onClick={saveDoc}>保存</Button>
                <Button onClick={previewDoc}>预览</Button>
                <Button type="primary" disabled={docStatus === 'published' || !canPublish} onClick={publishDoc}>生成招标文件</Button>
              </div>
            }
          >
            <Descriptions column={3} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="编制人">{role === 'tenderee' ? '张三' : '李四'}</Descriptions.Item>
              <Descriptions.Item label="复核人">{docStatus === 'published' ? '张三' : '待复核'}</Descriptions.Item>
              <Descriptions.Item label="最近更新">{lastUpdate}</Descriptions.Item>
            </Descriptions>

            <Form layout="horizontal" labelCol={{ flex: '100px' }} className="doc-form">
              <Form.Item label="章节标题">
                <Input
                  value={currentNode.label}
                  onChange={(e) => setCurrentNode((prev) => ({ ...prev, label: e.target.value }))}
                  disabled={docStatus === 'published' || !canEdit}
                />
              </Form.Item>
            </Form>

            <div className="editor-toolbar">
              <Button size="small" disabled={docStatus === 'published' || !canEdit}>加粗</Button>
              <Button size="small" disabled={docStatus === 'published' || !canEdit}>标题</Button>
              <Button size="small" disabled={docStatus === 'published' || !canEdit}>插入表格</Button>
              <Button size="small" disabled={docStatus === 'published' || !canEdit}>插入评分项</Button>
              <Button size="small" disabled={docStatus === 'published' || !canEdit}>插入签章位置</Button>
            </div>

            <Input.TextArea
              rows={18}
              placeholder="在此编辑招标文件内容..."
              className="doc-editor"
              value={currentNode.content}
              onChange={(e) => setCurrentNode((prev) => ({ ...prev, content: e.target.value }))}
              disabled={docStatus === 'published' || !canEdit}
            />

            <div className="attach-section">
              <h4>附件清单</h4>
              <Upload.Dragger
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                disabled={docStatus === 'published' || !canEdit}
                multiple
                style={{ width: '100%' }}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">拖拽文件到此处或 <em>点击上传</em></p>
              </Upload.Dragger>
            </div>

            <Divider />

            <div className="history-section">
              <h4>修改记录</h4>
              <Timeline
                items={history.map((item) => ({
                  key: item.id,
                  color: timelineColorMap[item.type],
                  children: (
                    <>
                      <div>{item.content}</div>
                      <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{item.time}</div>
                    </>
                  )
                }))}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="一键导入招标文件模板"
        open={importVisible}
        onOk={importTemplate}
        onCancel={() => { setImportVisible(false); setSelectedTemplate(null) }}
        okText="导入"
        cancelText="取消"
      >
        <p>选择模板后将覆盖当前目录和默认内容，您可在此基础上修改。</p>
        <Select
          placeholder="请选择模板"
          style={{ width: '100%' }}
          value={selectedTemplate}
          onChange={setSelectedTemplate}
          options={templates.map((t) => ({ label: t.name, value: t.name }))}
        />
      </Modal>

      <style>{`
        .tender-doc {
          min-height: calc(100vh - 120px);
        }
        .doc-layout {
          height: 100%;
        }
        .catalog-card {
          height: 100%;
        }
        .card-header {
          font-weight: bold;
        }
        .editor-card {
          min-height: 100%;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .version-tag {
          font-size: 12px;
          color: #909399;
          font-weight: normal;
        }
        .doc-form {
          margin-bottom: 16px;
        }
        .editor-toolbar {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee;
        }
        .doc-editor textarea {
          font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
          font-size: 14px;
          line-height: 1.8;
        }
        .attach-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .attach-section h4 {
          margin-bottom: 12px;
        }
        .history-section h4 {
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  )
}
