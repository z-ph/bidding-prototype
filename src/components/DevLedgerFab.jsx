import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ProfileOutlined } from '@ant-design/icons'

// 评审台账全局悬浮入口（feat-dev-ledger-fab-20260718）：
// 可拖拽移动（位置持久化 localStorage），位移 ≤5px 判定为点击跳转 /admin/dev-ledger。
// 初始定位右下角并避让 react-page-review 的评审按钮（right:24 bottom:96）。
const POS_KEY = 'bidding-dev-ledger-fab-pos'
const SIZE = 56
const MARGIN = 8
const DRAG_THRESHOLD = 5

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function readStoredPos() {
  try {
    const raw = localStorage.getItem(POS_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (Number.isFinite(p?.left) && Number.isFinite(p?.top)) {
      return {
        left: clamp(p.left, MARGIN, window.innerWidth - SIZE - MARGIN),
        top: clamp(p.top, MARGIN, window.innerHeight - SIZE - MARGIN)
      }
    }
  } catch {
    // ignore
  }
  return null
}

export default function DevLedgerFab() {
  const navigate = useNavigate()
  const [pos, setPos] = useState(readStoredPos)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef(null)

  const onPointerDown = (e) => {
    e.preventDefault()
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const rect = el.getBoundingClientRect()
    dragRef.current = {
      id: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
      moved: false
    }
    setDragging(true)
  }

  const onPointerMove = (e) => {
    const d = dragRef.current
    if (!d || d.id !== e.pointerId) return
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) <= DRAG_THRESHOLD) return
    d.moved = true
    setPos({
      left: clamp(e.clientX - d.offsetX, MARGIN, window.innerWidth - SIZE - MARGIN),
      top: clamp(e.clientY - d.offsetY, MARGIN, window.innerHeight - SIZE - MARGIN)
    })
  }

  const onPointerUp = (e) => {
    const d = dragRef.current
    if (!d || d.id !== e.pointerId) return
    dragRef.current = null
    setDragging(false)
    if (d.moved) {
      if (pos) {
        try {
          localStorage.setItem(POS_KEY, JSON.stringify(pos))
        } catch {
          // ignore
        }
      }
      return
    }
    navigate({ to: '/dev-ledger' })
  }

  const positionStyle = pos
    ? { left: pos.left, top: pos.top }
    : { right: 24, bottom: 96 }

  return (
    <div
      role="button"
      aria-label="评审台账"
      title="评审台账（可拖拽）"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'fixed',
        ...positionStyle,
        width: SIZE,
        height: SIZE,
        borderRadius: '50%',
        background: '#1677ff',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        zIndex: 900
      }}
    >
      <ProfileOutlined />
    </div>
  )
}
