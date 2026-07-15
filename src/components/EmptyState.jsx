import { Empty, Button, Spin } from 'antd'
import {
  BankOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  InboxOutlined,
  LoadingOutlined,
  WarningOutlined
} from '@ant-design/icons'

const ICON_MAP = {
  Document: FileTextOutlined,
  Folder: FolderOpenOutlined,
  Box: InboxOutlined,
  OfficeBuilding: BankOutlined,
  Loading: LoadingOutlined,
  Warning: WarningOutlined
}

const STATUS_CONFIG = {
  empty: {
    icon: 'Box',
    iconColor: '#C0C4CC',
    defaultDescription: '暂无数据'
  },
  loading: {
    icon: 'Loading',
    iconColor: '#1890ff',
    defaultDescription: '加载中...'
  },
  error: {
    icon: 'Warning',
    iconColor: '#ff4d4f',
    defaultDescription: '加载失败'
  }
}

export default function EmptyState({
  status = 'empty',
  description,
  icon,
  iconColor,
  actionText = '',
  actionType = 'primary',
  children,
  onAction,
  reason = '',
  retryText = '重新加载',
  onRetry
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.empty
  const IconComponent = ICON_MAP[icon || config.icon] || FileTextOutlined
  const resolvedIconColor = iconColor || config.iconColor
  const resolvedDescription = description || config.defaultDescription

  const extra = children || (actionText || reason || onRetry ? (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      {reason && (
        <p style={{ color: '#666', fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>
          {reason}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        {onRetry && (
          <Button type="default" onClick={onRetry}>
            {retryText}
          </Button>
        )}
        {actionText && (
          <Button type={actionType} onClick={onAction}>
            {actionText}
          </Button>
        )}
      </div>
    </div>
  ) : null)

  return (
    <div className="empty-state" style={{ padding: '40px 0' }}>
      {status === 'loading' ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin indicator={<IconComponent style={{ fontSize: 48, color: resolvedIconColor }} spin />} />
          <p style={{ color: '#666', marginTop: 16 }}>{resolvedDescription}</p>
        </div>
      ) : (
        <Empty
          description={resolvedDescription}
          image={<IconComponent style={{ fontSize: 64, color: resolvedIconColor }} />}
        >
          {extra}
        </Empty>
      )}
    </div>
  )
}
