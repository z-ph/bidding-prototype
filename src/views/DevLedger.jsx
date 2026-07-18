import { Tabs } from 'antd'
import { useNavigate, useSearch } from '@tanstack/react-router'
import ReviewChangeList from './ReviewChangeList.jsx'
import Changelog from './Changelog.jsx'

// 评审台账合并页（feat-dev-ledger-fab-20260718）：
// 开发阶段产物的统一入口，Tab 切换评审变更列表 / 变更时间线；
// activeKey 由 URL search ?tab= 驱动，支持深链；入口为全局悬浮按钮，不进业务主导航。
export default function DevLedger() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const tab = search?.tab === 'changelog' ? 'changelog' : 'review'

  return (
    <div className="dev-ledger">
      <Tabs
        activeKey={tab}
        onChange={(key) => navigate({ to: '/admin/dev-ledger', search: { tab: key }, replace: true })}
        items={[
          { key: 'review', label: '评审变更列表', children: <ReviewChangeList embedded /> },
          { key: 'changelog', label: '变更时间线', children: <Changelog embedded /> }
        ]}
      />
    </div>
  )
}
