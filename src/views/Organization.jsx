import { useState } from 'react'
import { Button, Card, Col, Descriptions, Row, Tree, message } from 'antd'
import EmptyState from '../components/EmptyState.jsx'

const treeData = [
  {
    name: 'XX集团',
    code: 'ROOT',
    leader: '张总',
    members: 120,
    children: [
      { name: '采购部', code: 'CG', leader: '张三', members: 8 },
      { name: '招标代理部', code: 'ZB', leader: '李四', members: 12 },
      { name: '法务部', code: 'FW', leader: '王五', members: 5 }
    ]
  }
]

export default function Organization() {
  const [selectedDept, setSelectedDept] = useState(null)

  const selectDept = (_, info) => {
    setSelectedDept(info.node)
  }

  const addDepartment = () => {
    message.success('打开新增部门弹窗（演示）')
  }

  return (
    <div className="organization">
      <Card
        title={
          <div className="card-header">
            <span>组织机构</span>
            <Button type="primary" onClick={addDepartment}>新增部门</Button>
          </div>
        }
      >
        <Row gutter={20}>
          <Col span={8}>
            <Tree
              treeData={treeData}
              fieldNames={{ title: 'name', key: 'code', children: 'children' }}
              defaultExpandAll
              onSelect={selectDept}
            />
          </Col>
          <Col span={16}>
            {selectedDept ? (
              <Descriptions column={2} bordered title="部门信息">
                <Descriptions.Item label="部门名称">{selectedDept.name}</Descriptions.Item>
                <Descriptions.Item label="部门编码">{selectedDept.code}</Descriptions.Item>
                <Descriptions.Item label="负责人">{selectedDept.leader}</Descriptions.Item>
                <Descriptions.Item label="成员数">{selectedDept.members} 人</Descriptions.Item>
              </Descriptions>
            ) : (
              <EmptyState description="请选择左侧部门查看详情" icon="OfficeBuilding" />
            )}
          </Col>
        </Row>
      </Card>

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
