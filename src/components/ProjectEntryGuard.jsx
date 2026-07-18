import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button, Result } from 'antd'

// 阶段页面入口守卫：强制从项目上下文进入，无 projectId 时阻断
export default function ProjectEntryGuard({ children }) {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const projectId = searchParams.projectId

  if (!projectId) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 40 }}>
        <Result
          status="warning"
          title="需从项目进入"
          subTitle="本功能属于项目阶段操作，请先从「项目管理」选择一个项目。"
          extra={
            <Button type="primary" onClick={() => navigate({ to: '/admin/projects' })}>
              返回项目列表
            </Button>
          }
        />
      </div>
    )
  }

  return children || null
}
