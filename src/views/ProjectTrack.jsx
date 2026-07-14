import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Select, Alert, Timeline, Button } from 'antd'
import {
  CheckCircleOutlined,
  EditOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  CheckSquareOutlined,
  WalletOutlined
} from '@ant-design/icons'

export default function ProjectTrack() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryProjectId = searchParams.get('projectId')
  const [projectId, setProjectId] = useState(queryProjectId || '1')
  const [paid, setPaid] = useState(false)

  const iconMap = {
    CheckCircleOutlined,
    EditOutlined,
    UploadOutlined,
    PlayCircleOutlined,
    StarOutlined,
    TrophyOutlined,
    CheckSquareOutlined,
    WalletOutlined
  }

  const nodes = [
    { title: '创建采购需求', desc: '招标人创建需求并提交审核', time: '2026-07-01 10:00', color: 'green', icon: 'CheckCircleOutlined' },
    { title: '编制招标文件', desc: '代理机构编制招标文件、配置评标办法', time: '2026-07-02 14:00', color: 'green', icon: 'EditOutlined' },
    { title: '发布招标公告', desc: '招标公告已发布至门户，供应商可报名', time: '2026-07-03 09:00', color: 'green', icon: 'CheckCircleOutlined' },
    { title: '投标报名与缴费', desc: paid ? '供应商报名并通过审核、已缴纳费用' : '供应商报名并通过审核、等待缴纳费用', time: paid ? '2026-07-05 16:00' : '进行中', color: paid ? 'green' : 'blue', icon: 'WalletOutlined', action: paid ? undefined : '去缴纳', path: `/admin/bid-payment?projectId=${projectId}` },
    { title: '上传投标文件', desc: '供应商上传加密投标文件并报价', time: paid ? '进行中' : '待进行', color: paid ? 'blue' : 'gray', icon: 'UploadOutlined', action: paid ? '去上传' : undefined, path: `/admin/bid-upload?projectId=${projectId}` },
    { title: '线上开标', desc: '开标大厅完成签到、解密、唱标', time: '待进行', color: 'gray', icon: 'PlayCircleOutlined' },
    { title: '线上评标', desc: '专家评分、生成评标报告', time: '待进行', color: 'gray', icon: 'StarOutlined' },
    { title: '定标公示', desc: '确认中标人并发布结果公示', time: '待进行', color: 'gray', icon: 'TrophyOutlined' },
    { title: '合同归档', desc: '上传合同，项目结束', time: '待进行', color: 'gray', icon: 'CheckSquareOutlined' }
  ]

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

        <Alert
          message="演示：点击“去缴纳”模拟完成文件费缴纳，缴纳后流程节点动态更新。"
          type="warning"
          showIcon
          closable={false}
          style={{ marginBottom: 20 }}
          action={
            <Button size="small" onClick={() => setPaid((p) => !p)}>
              {paid ? '重置缴费状态' : '模拟已缴费'}
            </Button>
          }
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
