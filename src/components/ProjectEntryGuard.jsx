import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button, Result } from 'antd'
import { useRole } from '../hooks/useRole.js'

// 阶段页面入口守卫：强制从项目上下文进入，无 projectId 时阻断。
// 未显式传 backTo/backLabel 时按当前角色给出可达的返回目标，避免把用户送进 403 死胡同。
const ROLE_BACK_MAP = {
  tenderee: ['/admin/projects', '返回项目列表'],
  agent: ['/admin/projects', '返回项目列表'],
  bidder: ['/admin/bidder-projects', '返回项目中心'],
  expert: ['/admin/expert-tasks', '返回我的评标任务'],
  supervisor: ['/admin/supervisor-hall', '返回监督大厅'],
  admin: ['/admin/dashboard', '返回工作台']
}

export default function ProjectEntryGuard({ children, backTo, backLabel }) {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false })
  const { role } = useRole()
  const projectId = searchParams.projectId

  if (!projectId) {
    const [defaultTo, defaultLabel] = ROLE_BACK_MAP[role] || ['/admin/dashboard', '返回工作台']
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 40 }}>
        <Result
          status="warning"
          title="需从项目进入"
          subTitle="本功能属于项目阶段操作，请先从项目列表/项目中心选择一个项目进入。"
          extra={
            <Button type="primary" onClick={() => navigate({ to: backTo || defaultTo })}>
              {backLabel || defaultLabel}
            </Button>
          }
        />
      </div>
    )
  }

  return children || null
}
