import { Empty, Button } from 'antd'
import {
  BankOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  InboxOutlined
} from '@ant-design/icons'

const ICON_MAP = {
  Document: FileTextOutlined,
  Folder: FolderOpenOutlined,
  Box: InboxOutlined,
  OfficeBuilding: BankOutlined
}

export default function EmptyState({
  description = '暂无数据',
  icon = 'Document',
  iconColor = '#C0C4CC',
  actionText = '',
  actionType = 'primary',
  children,
  onAction
}) {
  const IconComponent = ICON_MAP[icon] || FileTextOutlined

  const extra = children || (actionText ? (
    <Button type={actionType} onClick={onAction}>
      {actionText}
    </Button>
  ) : null)

  return (
    <div className="empty-state" style={{ padding: '40px 0' }}>
      <Empty
        description={description}
        image={<IconComponent style={{ fontSize: 64, color: iconColor }} />}
      >
        {extra}
      </Empty>
    </div>
  )
}
