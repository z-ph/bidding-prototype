import { useState } from 'react'
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
  Modal
} from 'antd'
import { InboxOutlined } from '@ant-design/icons'

export default function TenderDoc() {
  const [docStatus, setDocStatus] = useState('editing') // editing, reviewed, published
  const version = 'V1.0'
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString())

  const catalog = [
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

  const [currentNode, setCurrentNode] = useState({
    label: '招标公告',
    content: '【招标公告正文】\n\n一、招标条件\n本项目已由相关部门批准建设，招标人为 XX单位，资金来源为自筹。\n\n二、项目概况与招标范围\n...'
  })

  const [fileList, setFileList] = useState([
    { uid: '-1', name: '图纸.zip', size: 1024000 },
    { uid: '-2', name: '技术参数表.xlsx', size: 256000 }
  ])

  const [history, setHistory] = useState([
    { id: 1, content: '李四 创建了招标文件 V1.0', time: '2026-07-08 09:00', type: 'primary' },
    { id: 2, content: '李四 编辑了“招标公告”章节', time: '2026-07-08 10:30', type: 'info' }
  ])

  const statusLabelMap = { editing: '编辑中', reviewed: '已复核', published: '已发布' }
  const statusColorMap = { editing: 'default', reviewed: 'warning', published: 'success' }
  const timelineColorMap = { primary: 'blue', info: 'gray', success: 'green', warning: 'orange', danger: 'red' }

  const canPublish = currentNode.content.length > 50 && fileList.length > 0

  const selectNode = (selectedKeys, info) => {
    const node = info.node
    setCurrentNode({
      label: node.title,
      content: node.content || `${node.title} 内容待编辑...`
    })
  }

  const saveDoc = () => {
    const now = new Date().toLocaleString()
    setLastUpdate(now)
    setHistory((prev) => [
      {
        id: Date.now(),
        content: `李四 编辑了“${currentNode.label}”章节`,
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
          >
            <Tree
              treeData={catalog}
              defaultExpandAll
              selectedKeys={[currentNode.label]}
              onSelect={selectNode}
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
              </div>
            }
            extra={
              <div>
                <Button disabled={docStatus === 'published'} onClick={saveDoc}>保存</Button>
                <Button onClick={previewDoc}>预览</Button>
                <Button type="primary" disabled={docStatus === 'published' || !canPublish} onClick={publishDoc}>生成招标文件</Button>
              </div>
            }
          >
            <Descriptions column={3} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="编制人">李四</Descriptions.Item>
              <Descriptions.Item label="复核人">{docStatus === 'published' ? '张三' : '待复核'}</Descriptions.Item>
              <Descriptions.Item label="最近更新">{lastUpdate}</Descriptions.Item>
            </Descriptions>

            <Form layout="horizontal" labelCol={{ flex: '100px' }} className="doc-form">
              <Form.Item label="章节标题">
                <Input
                  value={currentNode.label}
                  onChange={(e) => setCurrentNode((prev) => ({ ...prev, label: e.target.value }))}
                  disabled={docStatus === 'published'}
                />
              </Form.Item>
            </Form>

            <div className="editor-toolbar">
              <Button size="small" disabled={docStatus === 'published'}>加粗</Button>
              <Button size="small" disabled={docStatus === 'published'}>标题</Button>
              <Button size="small" disabled={docStatus === 'published'}>插入表格</Button>
              <Button size="small" disabled={docStatus === 'published'}>插入评分项</Button>
              <Button size="small" disabled={docStatus === 'published'}>插入签章位置</Button>
            </div>

            <Input.TextArea
              rows={18}
              placeholder="在此编辑招标文件内容..."
              className="doc-editor"
              value={currentNode.content}
              onChange={(e) => setCurrentNode((prev) => ({ ...prev, content: e.target.value }))}
              disabled={docStatus === 'published'}
            />

            <div className="attach-section">
              <h4>附件清单</h4>
              <Upload.Dragger
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                disabled={docStatus === 'published'}
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
