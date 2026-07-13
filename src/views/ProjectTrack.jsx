import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Select, Alert, Timeline, Button } from 'antd'
import {
  CheckCircleOutlined,
  EditOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  CheckSquareOutlined
} from '@ant-design/icons'

export default function ProjectTrack() {
  const navigate = useNavigate()
  const [projectId, setProjectId] = useState('1')

  const iconMap = {
    CheckCircleOutlined,
    EditOutlined,
    UploadOutlined,
    PlayCircleOutlined,
    StarOutlined,
    TrophyOutlined,
    CheckSquareOutlined
  }

  const [nodes] = useState([
    { title: '创建采购需求', desc: '招标人创建需求并提交审核', time: '2026-07-01 10:00', color: 'green', icon: 'CheckCircleOutlined' },
    { title: '编制招标文件', desc: '代理机构编制招标文件、配置评标办法', time: '2026-07-02 14:00', color: 'green', icon: 'EditOutlined' },
    { title: '发布招标公告', desc: '招标公告已发布至门户，供应商可报名', time: '2026-07-03 09:00', color: 'green', icon: 'CheckCircleOutlined' },
    { title: '投标报名与缴费', desc: '供应商报名并通过审核、缴纳费用', time: '2026-07-05 16:00', color: 'green', icon: 'CheckCircleOutlined' },
    { title: '上传投标文件', desc: '供应商上传加密投标文件并报价', time: '进行中', color: 'blue', icon: 'UploadOutlined', action: '去上传', path: '/admin/bid-upload' },
    { title: '线上开标', desc: '开标大厅完成签到、解密、唱标', time: '待进行', color: 'gray', icon: 'PlayCircleOutlined' },
    { title: '线上评标', desc: '专家评分、生成评标报告', time: '待进行', color: 'gray', icon: 'StarOutlined' },
    { title: '定标公示', desc: '确认中标人并发布结果公示', time: '待进行', color: 'gray', icon: 'TrophyOutlined' },
    { title: '合同归档', desc: '上传合同，项目结束', time: '待进行', color: 'gray', icon: 'CheckSquareOutlined' }
  ])

  const go = (path) => navigate(path)

  return (
    <div className="project-track">
      <Card
        title={
          <div className="card-header">
            <span>项目跟踪</span>
            <Select
              placeholder="选择项目"
              style={{ width: 260 }}
              value={projectId}
              onChange={(value) => setProjectId(value)}
              options={[
                { label: 'XX市轨道交通设备采购项目', value: '1' },
                { label: '办公桌椅采购项目', value: '2' }
              ]}
            />
          </div>
        }
      >
        <Alert
          message="按角色查看项目当前节点和下一步操作，掌握项目进度。绿色节点为已完成，蓝色节点为进行中，灰色节点为待进行。"
          type="info"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
        />
        <Timeline
          items={nodes.map((node, idx) => {
            const Icon = iconMap[node.icon]
            return {
              key: idx,
              color: node.color,
              dot: Icon ? <Icon /> : null,
              children: (
                <>
                  <h4>{node.title}</h4>
                  <p>{node.desc}</p>
                  {node.action && (
                    <Button type="primary" size="small" onClick={() => go(node.path)}>
                      {node.action}
                    </Button>
                  )}
                  <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{node.time}</p>
                </>
              )
            }
          })}
        />
      </Card>

      <style>{`
        .project-track {
          max-width: 1000px;
          margin: 0 auto;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
