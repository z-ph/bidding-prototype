import { useEffect, useMemo, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
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
  Select,
  Table
} from 'antd'
import { InboxOutlined, PlusOutlined, DeleteOutlined, ImportOutlined } from '@ant-design/icons'
import { useRole } from '../hooks/useRole.js'
import { tenderDocStore } from '../data/tenderDocStore.js'
import { tenderDocTemplates } from '../data/tenderDocCatalog.js'

// 模拟项目结构化招标数据：项目基本信息 + 标段/包件结构化字段
const projectMetaMap = {
  '1': {
    id: '1',
    name: 'XX市轨道交通设备采购项目',
    code: 'ZB20260701001',
    purchaseMode: '公开招标',
    bidOpenTime: '2026-07-21 09:30',
    bidCloseTime: '2026-07-20 17:00',
    registerStart: '2026-07-01 09:00',
    registerEnd: '2026-07-20 17:00',
    evalLocation: '线上评标大厅',
    budget: 850,
    evaluationMethod: '综合评分法',
    quoteFields: [
      { key: 'totalPrice', label: '投标总价', unit: '万元', required: true },
      { key: 'unitPrice', label: '单价', unit: '元', required: true },
      { key: 'deliveryDays', label: '交货期', unit: '天', required: true },
      { key: 'warrantyYears', label: '质保期', unit: '年', required: false }
    ],
    bidSummaryColumns: [
      { title: '序号', dataIndex: 'seq', width: 80 },
      { title: '标段', dataIndex: 'packageName', width: 200 },
      { title: '投标单位', dataIndex: 'bidder', minWidth: 200 },
      { title: '投标总价（万元）', dataIndex: 'totalPrice', width: 160 },
      { title: '交货期（天）', dataIndex: 'deliveryDays', width: 120 },
      { title: '备注', dataIndex: 'remark', minWidth: 160 }
    ],
    packages: [
      {
        code: 'B1',
        name: '第一标段：主设备',
        budget: 600,
        bidFee: 500,
        deposit: 120000,
        depositReturn: '中标公示结束后 5 个工作日内原路退还',
        content: '主设备采购',
        delivery: '合同签订后 90 天内'
      },
      {
        code: 'B2',
        name: '第二标段：辅材',
        budget: 250,
        bidFee: 300,
        deposit: 50000,
        depositReturn: '中标公示结束后 5 个工作日内原路退还',
        content: '辅助材料',
        delivery: '合同签订后 60 天内'
      }
    ]
  },
  '3': {
    id: '3',
    name: '软件开发服务项目',
    code: 'ZB20260703003',
    purchaseMode: '邀请招标',
    bidOpenTime: '2026-07-15 09:00',
    bidCloseTime: '2026-07-14 17:00',
    registerStart: '2026-07-03 09:00',
    registerEnd: '2026-07-14 17:00',
    evalLocation: '线上评标大厅',
    budget: 120,
    evaluationMethod: '综合评分法',
    quoteFields: [
      { key: 'totalPrice', label: '投标总价', unit: '万元', required: true },
      { key: 'devCycle', label: '开发周期', unit: '月', required: true },
      { key: 'maintainYears', label: '运维期', unit: '年', required: true }
    ],
    bidSummaryColumns: [
      { title: '序号', dataIndex: 'seq', width: 80 },
      { title: '标段', dataIndex: 'packageName', width: 200 },
      { title: '投标单位', dataIndex: 'bidder', minWidth: 200 },
      { title: '投标总价（万元）', dataIndex: 'totalPrice', width: 160 },
      { title: '开发周期（月）', dataIndex: 'devCycle', width: 140 },
      { title: '备注', dataIndex: 'remark', minWidth: 160 }
    ],
    packages: [
      {
        code: 'B1',
        name: '软件开发服务',
        budget: 120,
        bidFee: 0,
        deposit: 20000,
        depositReturn: '合同签订后 10 个工作日内退还',
        content: '定制化软件开发及一年运维',
        delivery: '合同签订后 6 个月内上线'
      }
    ]
  }
}

const defaultProjectMeta = {
  id: '',
  name: '未关联项目',
  code: '-',
  purchaseMode: '-',
  bidOpenTime: '-',
  bidCloseTime: '-',
  registerStart: '-',
  registerEnd: '-',
  evalLocation: '-',
  budget: 0,
  evaluationMethod: '-',
  quoteFields: [],
  bidSummaryColumns: [],
  packages: []
}

function getProjectMeta(projectId) {
  if (!projectId) return defaultProjectMeta
  return projectMetaMap[projectId] || defaultProjectMeta
}

const statusLabelMap = {
  editing: '编辑中',
  previewing: '预览中',
  pendingConfirm: '待确认',
  confirmed: '已确认',
  published: '已发布'
}
const statusColorMap = {
  editing: 'default',
  previewing: 'processing',
  pendingConfirm: 'warning',
  confirmed: 'blue',
  published: 'success'
}
const timelineColorMap = { primary: 'blue', info: 'gray', success: 'green', warning: 'orange', danger: 'red' }

function findNode(nodes, key) {
  for (const node of nodes) {
    if (node.key === key) return node
    if (node.children) {
      const found = findNode(node.children, key)
      if (found) return found
    }
  }
  return null
}

function updateNodeContent(nodes, key, title, content) {
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

export default function TenderDoc() {
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId
  const { role, userName } = useRole()
  const canEdit = role === 'tenderee' || role === 'agent'
  const creatorName = role === 'tenderee' ? '张三' : '李四'

  const projectMeta = useMemo(() => getProjectMeta(projectId), [projectId])

  const [versions, setVersions] = useState(() => tenderDocStore.getProjectVersions(projectId))
  const [selectedVersionId, setSelectedVersionId] = useState(() => {
    const list = tenderDocStore.getProjectVersions(projectId)
    return list[list.length - 1]?.id
  })

  const selectedVersion = useMemo(
    () => versions.find((v) => v.id === selectedVersionId) || versions[versions.length - 1],
    [versions, selectedVersionId]
  )
  const latestVersion = useMemo(() => versions[versions.length - 1], [versions])
  const isHistoryVersion = selectedVersion?.id !== latestVersion?.id

  const editable = useMemo(
    () =>
      canEdit &&
      selectedVersion?.id === latestVersion?.id &&
      ['editing', 'previewing'].includes(selectedVersion?.status),
    [canEdit, selectedVersion, latestVersion]
  )

  const [selectedKeys, setSelectedKeys] = useState(['招标公告'])
  const [currentNode, setCurrentNode] = useState({ label: '招标公告', content: '' })
  const [newNodeName, setNewNodeName] = useState('')
  const [importVisible, setImportVisible] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(() => {
    const node = findNode(selectedVersion?.catalog || [], selectedKeys[0]) || findNode(selectedVersion?.catalog || [], '招标公告')
    if (node) {
      setSelectedKeys([node.key])
      setCurrentNode({
        label: node.title,
        content: node.content || `${node.title} 内容待编辑...`
      })
    }
  }, [selectedVersion, selectedKeys[0]])

  const setSelectedVersionAndSync = (id) => {
    setSelectedVersionId(id)
    const version = versions.find((v) => v.id === id)
    if (version) {
      const node = findNode(version.catalog, '招标公告')
      if (node) {
        setSelectedKeys([node.key])
        setCurrentNode({ label: node.title, content: node.content || `${node.title} 内容待编辑...` })
      }
    }
  }

  const refreshVersions = () => {
    const next = tenderDocStore.getProjectVersions(projectId)
    setVersions(next)
  }

  const updateSelectedVersion = (patch) => {
    const next = tenderDocStore.updateVersion(projectId, selectedVersion.id, patch)
    if (next) refreshVersions()
    return next
  }

  const pushHistory = (content, type = 'info') => {
    const now = new Date().toLocaleString()
    const nextHistory = [
      { id: Date.now(), content, time: now, type },
      ...(selectedVersion.history || [])
    ]
    updateSelectedVersion({ history: nextHistory, updatedAt: now })
  }

  const canPublish = currentNode.content.length > 50 && (selectedVersion?.fileList?.length || 0) > 0

  const selectNode = (keys, info) => {
    const key = keys[0] || info.node.key
    setSelectedKeys([key])
    const node = findNode(selectedVersion.catalog, key)
    if (node) {
      setCurrentNode({
        label: node.title,
        content: node.content || `${node.title} 内容待编辑...`
      })
    }
  }

  const addNode = () => {
    if (!newNodeName.trim()) {
      message.warning('请输入目录名称')
      return
    }
    const key = `${newNodeName}-${Date.now()}`
    const newCatalog = [...(selectedVersion.catalog || []), { key, title: newNodeName, content: '' }]
    updateSelectedVersion({ catalog: newCatalog })
    setNewNodeName('')
    pushHistory(`新增目录节点“${newNodeName}”`, 'info')
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
        const newCatalog = remove(selectedVersion.catalog)
        updateSelectedVersion({ catalog: newCatalog })
        setSelectedKeys(['招标公告'])
        setCurrentNode({ label: '招标公告', content: '招标公告内容...' })
        pushHistory(`删除目录节点“${key}”`, 'warning')
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

    const data = JSON.parse(JSON.stringify(selectedVersion.catalog))
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
    updateSelectedVersion({ catalog: data })
    pushHistory(`调整目录节点“${dragKey}”顺序`, 'info')
  }

  const saveDoc = () => {
    const now = new Date().toLocaleString()
    const newCatalog = updateNodeContent(selectedVersion.catalog, selectedKeys[0], currentNode.label, currentNode.content)
    updateSelectedVersion({ catalog: newCatalog, updatedAt: now })
    pushHistory(`${creatorName} 编辑了“${currentNode.label}”章节`, 'info')
    message.success('招标文件已保存')
  }

  const previewDoc = () => {
    updateSelectedVersion({ status: 'previewing' })
    message.success('当前版本已进入预览状态')
  }

  const submitConfirm = () => {
    updateSelectedVersion({ status: 'pendingConfirm' })
    pushHistory(`${creatorName} 提交版本 ${selectedVersion.versionNo} 待确认`, 'warning')
    message.success('已提交确认')
  }

  const confirmDoc = () => {
    const now = new Date().toLocaleString()
    updateSelectedVersion({ status: 'confirmed', confirmer: userName || '张三', updatedAt: now })
    pushHistory(`${userName || '张三'} 确认了版本 ${selectedVersion.versionNo}`, 'success')
    message.success('确认完成，可执行发布前检查并发布')
  }

  const publishDoc = () => {
    Modal.confirm({
      title: '发布确认',
      content: '发布前检查：章节内容、附件清单是否完整？发布后将不可直接修改，是否继续？',
      okText: '确认发布',
      cancelText: '取消',
      onOk: () => {
        if (!canPublish) {
          message.error('发布前检查未通过：正文内容过短或附件清单为空')
          return
        }
        const now = new Date().toLocaleString()
        tenderDocStore.publishVersion(projectId, selectedVersion.id, {
          updatedAt: now,
          catalog: selectedVersion.catalog,
          fileList: selectedVersion.fileList
        })
        refreshVersions()
        message.success('招标文件已发布，当前版本生效')
      }
    })
  }

  const createNewVersion = () => {
    const next = tenderDocStore.addVersion(projectId, selectedVersion, creatorName)
    refreshVersions()
    setSelectedVersionId(next.id)
    message.success(`已创建新版本 ${next.versionNo}`)
  }

  const importTemplate = () => {
    if (!selectedTemplate) {
      message.warning('请选择要导入的模板')
      return
    }
    const tpl = tenderDocTemplates.find((t) => t.name === selectedTemplate)
    if (tpl) {
      updateSelectedVersion({ catalog: JSON.parse(JSON.stringify(tpl.catalog)) })
      setSelectedKeys(['招标公告'])
      setCurrentNode({ label: '招标公告', content: '招标公告内容...' })
      pushHistory(`一键导入模板“${tpl.name}”`, 'success')
      message.success(`已导入模板：${tpl.name}`)
    }
    setImportVisible(false)
    setSelectedTemplate(null)
  }

  const packageColumns = [
    { title: '标段编号', dataIndex: 'code', width: 100 },
    { title: '标段名称', dataIndex: 'name', minWidth: 200 },
    { title: '采购内容', dataIndex: 'content', minWidth: 160 },
    { title: '预算（万元）', dataIndex: 'budget', width: 120, render: (v) => `${v} 万元` },
    { title: '文件费（元）', dataIndex: 'bidFee', width: 120, render: (v) => (v ? `¥${v}` : '免费') },
    { title: '保证金（元）', dataIndex: 'deposit', width: 130, render: (v) => `¥${v.toLocaleString()}` },
    { title: '保证金退还', dataIndex: 'depositReturn', minWidth: 220 },
    { title: '交货/服务期', dataIndex: 'delivery', minWidth: 180 }
  ]

  return (
    <div className="tender-doc">
      {selectedVersion?.status === 'published' && (
        <Alert
          message="当前招标文件已发布，如需修改请先创建新版本。"
          type="warning"
          showIcon
          closable={false}
          style={{ marginBottom: 16 }}
        />
      )}
      {isHistoryVersion && latestVersion && (
        <Alert
          message={`当前查看的是历史版本 ${selectedVersion.versionNo}，当前有效版本为 ${latestVersion.versionNo}。`}
          type="info"
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
              editable && (
                <Button size="small" icon={<ImportOutlined />} onClick={() => setImportVisible(true)}>导入模板</Button>
              )
            }
          >
            {editable && (
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
              treeData={selectedVersion?.catalog || []}
              defaultExpandAll
              selectedKeys={selectedKeys}
              draggable={editable}
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
                <Tag color={statusColorMap[selectedVersion?.status]}>{statusLabelMap[selectedVersion?.status]}</Tag>
                <span className="version-tag">版本 {selectedVersion?.versionNo}</span>
                <Select
                  size="small"
                  style={{ width: 180 }}
                  value={selectedVersion?.id}
                  onChange={setSelectedVersionAndSync}
                  options={versions.map((v) => ({
                    label: `${v.versionNo} · ${statusLabelMap[v.status]}`,
                    value: v.id
                  }))}
                />
                {projectId && <span className="version-tag">项目 ID: {projectId}</span>}
              </div>
            }
            extra={
              <div style={{ display: 'flex', gap: 8 }}>
                {editable && (
                  <Button onClick={saveDoc}>保存</Button>
                )}
                {['editing', 'previewing'].includes(selectedVersion?.status) && editable && (
                  <Button onClick={previewDoc}>预览</Button>
                )}
                {['editing', 'previewing'].includes(selectedVersion?.status) && editable && (
                  <Button type="primary" ghost onClick={submitConfirm}>提交确认</Button>
                )}
                {selectedVersion?.status === 'pendingConfirm' && (
                  <Button type="primary" ghost onClick={confirmDoc}>确认</Button>
                )}
                {selectedVersion?.status === 'confirmed' && (
                  <Button type="primary" onClick={publishDoc}>发布</Button>
                )}
                {selectedVersion?.status === 'published' && canEdit && (
                  <Button type="primary" onClick={createNewVersion}>创建新版本</Button>
                )}
              </div>
            }
          >
            <Card size="small" title="项目结构化信息" style={{ marginBottom: 16 }}>
              <Descriptions column={3} bordered size="small">
                <Descriptions.Item label="项目名称">{projectMeta.name}</Descriptions.Item>
                <Descriptions.Item label="项目编号">{projectMeta.code}</Descriptions.Item>
                <Descriptions.Item label="采购方式">{projectMeta.purchaseMode}</Descriptions.Item>
                <Descriptions.Item label="报名开始">{projectMeta.registerStart}</Descriptions.Item>
                <Descriptions.Item label="报名截止">{projectMeta.registerEnd}</Descriptions.Item>
                <Descriptions.Item label="开标时间">{projectMeta.bidOpenTime}</Descriptions.Item>
                <Descriptions.Item label="投标截止">{projectMeta.bidCloseTime}</Descriptions.Item>
                <Descriptions.Item label="评标地点">{projectMeta.evalLocation}</Descriptions.Item>
                <Descriptions.Item label="评标方法">{projectMeta.evaluationMethod}</Descriptions.Item>
              </Descriptions>

              <Divider orientation="left" style={{ marginTop: 16 }}>标段/包件信息</Divider>
              <Table
                rowKey="code"
                dataSource={projectMeta.packages}
                columns={packageColumns}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 'max-content' }}
              />

              <Divider orientation="left">报价字段配置</Divider>
              <div className="quote-fields">
                {projectMeta.quoteFields.map((field) => (
                  <Tag key={field.key} color={field.required ? 'blue' : 'default'}>
                    {field.label} ({field.unit}) {field.required ? '*' : ''}
                  </Tag>
                ))}
                {projectMeta.quoteFields.length === 0 && <span>-</span>}
              </div>

              <Divider orientation="left">开标一览表模板</Divider>
              <Table
                rowKey="title"
                dataSource={projectMeta.bidSummaryColumns}
                columns={[
                  { title: '列名', dataIndex: 'title' },
                  { title: '字段键', dataIndex: 'dataIndex' },
                  { title: '宽度', dataIndex: 'width', render: (v) => v || '自适应' }
                ]}
                pagination={false}
                size="small"
                bordered
              />
            </Card>

            <Descriptions column={3} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="编制人">{selectedVersion?.creator || creatorName}</Descriptions.Item>
              <Descriptions.Item label="确认人">{selectedVersion?.confirmer || '-'}</Descriptions.Item>
              <Descriptions.Item label="最近更新">{selectedVersion?.updatedAt || '-'}</Descriptions.Item>
            </Descriptions>

            <Form layout="horizontal" labelCol={{ flex: '100px' }} className="doc-form">
              <Form.Item label="章节标题">
                <Input
                  value={currentNode.label}
                  onChange={(e) => setCurrentNode((prev) => ({ ...prev, label: e.target.value }))}
                  disabled={!editable}
                />
              </Form.Item>
            </Form>

            <div className="editor-toolbar">
              <Button size="small" disabled={!editable}>加粗</Button>
              <Button size="small" disabled={!editable}>标题</Button>
              <Button size="small" disabled={!editable}>插入表格</Button>
              <Button size="small" disabled={!editable}>插入评分项</Button>
              <Button size="small" disabled={!editable}>插入签章位置</Button>
            </div>

            <Input.TextArea
              rows={18}
              placeholder="在此编辑招标文件内容..."
              className="doc-editor"
              value={currentNode.content}
              onChange={(e) => setCurrentNode((prev) => ({ ...prev, content: e.target.value }))}
              disabled={!editable}
            />

            <div className="attach-section">
              <h4>附件清单</h4>
              <Upload.Dragger
                fileList={selectedVersion?.fileList || []}
                onChange={({ fileList }) => updateSelectedVersion({ fileList })}
                beforeUpload={() => false}
                disabled={!editable}
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
                items={(selectedVersion?.history || []).map((item) => ({
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
          options={tenderDocTemplates.map((t) => ({ label: t.name, value: t.name }))}
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
          flex-wrap: wrap;
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
        .quote-fields {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      `}</style>
    </div>
  )
}
