import { Tag } from 'antd'
import { STATUS_COLORS } from '../config/permissions.js'

const COLOR_MAP = {
  info: 'default',
  warning: 'warning',
  primary: 'processing',
  success: 'success',
  danger: 'error'
}

export default function StatusTag({ status = '', label = '', size = 'default' }) {
  const key = String(status || label || '')
  const mapped = STATUS_COLORS[key] || 'info'
  const color = COLOR_MAP[mapped] || 'default'

  // Ant Design Tag does not expose a `size` prop; accept it to keep the same
  // public API as the Vue version, but do not forward it to the DOM.
  void size

  return (
    <Tag color={color}>
      {label || status}
    </Tag>
  )
}
