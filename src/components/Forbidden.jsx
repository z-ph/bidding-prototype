import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../hooks/useRole.js'

const HOME_MAP = {
  tenderee: '/admin/dashboard',
  agent: '/admin/dashboard',
  bidder: '/admin/dashboard',
  expert: '/admin/dashboard',
  supervisor: '/admin/supervisor-hall',
  admin: '/admin/admin-dashboard'
}

export default function Forbidden() {
  const navigate = useNavigate()
  const { role, roleName } = useRole()

  const subtitle = `当前身份：${roleName}，您没有权限查看该页面。`

  function goHome() {
    navigate(HOME_MAP[role] || '/admin/dashboard')
  }

  return (
    <div className="forbidden-page" style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Result
        status="403"
        title="无权限访问"
        subTitle={subtitle}
        extra={
          <Button type="primary" onClick={goHome}>
            返回我的工作台
          </Button>
        }
      />
    </div>
  )
}
