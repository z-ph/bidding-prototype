// @ts-nocheck — TS 渐进迁移基线：解冻本文件时删除本行并修复类型（见 AGENTS.md 技术栈）
import { Result, Button, Descriptions, Tag, message } from 'antd'
import { useNavigate } from '@tanstack/react-router'
import { useRole } from '../hooks/useRole.js'

const HOME_MAP = {
  tenderee: '/admin/dashboard',
  agent: '/admin/dashboard',
  bidder: '/admin/dashboard',
  expert: '/admin/dashboard',
  supervisor: '/admin/supervisor-hall',
  admin: '/admin/dashboard'
}

const ROLE_PERMISSION_HINT = {
  tenderee: '采购单位可查看并管理本单位项目、采购包、开启及评审大厅。',
  agent: '采购代理可协助编制采购文件、组织开启评审。',
  bidder: '响应单位可下载采购文件、上传响应文件及进入开启大厅。',
  expert: '专家可进入评审大厅参与评分。',
  supervisor: '监督人员可进入监督大厅查看开启评审过程。',
  admin: '平台管理员拥有全部页面访问权限。'
}

export default function Forbidden() {
  const navigate = useNavigate()
  const { role, roleName } = useRole()

  function goHome() {
    navigate({ to: HOME_MAP[role] || '/admin/dashboard' })
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
