import { Button, Tabs } from 'antd'
import { useNavigate, useSearch } from '@tanstack/react-router'
import ReviewChangeList from './ReviewChangeList.jsx'
import Changelog from './Changelog.jsx'

// 评审台账合并页（feat-dev-ledger-fab-20260718 / fix-dev-ledger-public-access-20260718）：
// 开发阶段产物的统一入口，Tab 切换评审变更列表 / 变更时间线；
// activeKey 由 URL search ?tab= 驱动，支持深链；公开路由（无需登录），入口为全局悬浮按钮。
export default function DevLedger() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const tab = search?.tab === 'changelog' ? 'changelog' : 'review'

  return (
    <div className="dev-ledger" style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>评审台账</h3>
        <Button onClick={() => window.history.back()}>返回</Button>
      </div>
      <Tabs
        activeKey={tab}
        onChange={(key) => navigate({ to: '/dev-ledger', search: { tab: key }, replace: true })}
        items={[
          { key: 'review', label: '评审变更列表', children: <ReviewChangeList embedded /> },
          { key: 'changelog', label: '变更时间线', children: <Changelog embedded /> }
        ]}
      />
    </div>
  )
}
