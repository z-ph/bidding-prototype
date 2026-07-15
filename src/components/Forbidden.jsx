import { Result, Button, Descriptions, Tag, message } from 'antd'
import { useNavigate } from '@tanstack/react-router'
import { useRole } from '../hooks/useRole.js'

const HOME_MAP = {
  tenderee: '/admin/dashboard',
  agent: '/admin/dashboard',
  bidder: '/admin/dashboard',
  expert: '/admin/dashboard',
  supervisor: '/admin/supervisor-hall',
  admin: '/admin/admin-dashboard'
}

const ROLE_PERMISSION_HINT = {
  tenderee: '招标人可查看并管理本单位项目、标段、开标及评标大厅。',
  agent: '招标代理可协助编制招标文件、组织开标评标。',
  bidder: '投标人可报名、缴费、上传投标文件及进入开标大厅。',
  expert: '专家可进入评标大厅参与评分。',
  supervisor: '监督人员可进入监督大厅查看开标评标过程。',
  admin: '平台管理员拥有全部页面访问权限。'
}

export default function Forbidden() {
  const navigate = useNavigate()
  const { role, roleName } = useRole()

  function goHome() {
    navigate(HOME_MAP[role] || '/admin/dashboard')
  }

  function applyPermission() {
    message?.info?.('请联系管理员申请对应角色权限')
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
        subTitle={`当前身份：${roleName}，您没有权限查看该页面。`}
        extra={
          <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'left' }}>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="当前角色">
                <Tag color="default">{roleName || '未登录'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="权限说明">
                {ROLE_PERMISSION_HINT[role] || '请联系管理员了解当前角色权限范围。'}
              </Descriptions.Item>
              <Descriptions.Item label="可申请权限">
                如需访问本页面，请联系平台管理员或切换为具备权限的角色。
              </Descriptions.Item>
            </Descriptions>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Button type="primary" onClick={goHome}>
                返回我的工作台
              </Button>
              <Button onClick={applyPermission}>
                申请权限
              </Button>
            </div>
          </div>
        }
      />
    </div>
  )
}
