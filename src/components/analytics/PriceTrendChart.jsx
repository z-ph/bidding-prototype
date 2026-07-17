import { Empty } from 'antd'

// 自绘 SVG 折线图（无图表库依赖）：按供应商分组展示价格趋势，支持多序列对比。
// series: [{ name, points: [{ at: 'YYYY-MM-DD', price: number }] }]，points 需按时间升序。

const PALETTE = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#f5222d', '#a0d911']
const VIEW_W = 760
const VIEW_H = 340
const PAD = { top: 24, right: 24, bottom: 46, left: 76 }

const formatY = (v) => {
  if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString('zh-CN')
  return Number(v.toFixed(2)).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

export default function PriceTrendChart({ series = [] }) {
  const allPoints = series.flatMap((s) => s.points)
  if (allPoints.length === 0) {
    return <Empty description="当前筛选条件下暂无价格记录" style={{ padding: '32px 0' }} />
  }

  const dates = [...new Set(allPoints.map((p) => p.at))].sort()
  const values = allPoints.map((p) => p.price)
  let min = Math.min(...values)
  let max = Math.max(...values)
  if (min === max) {
    min = min > 0 ? min * 0.9 : min - 1
    max = max > 0 ? max * 1.1 : max + 1
  } else {
    const pad = (max - min) * 0.12
    min -= pad
    max += pad
    if (min < 0 && Math.min(...values) >= 0) min = 0
  }

  const innerW = VIEW_W - PAD.left - PAD.right
  const innerH = VIEW_H - PAD.top - PAD.bottom
  const xOf = (date) =>
    dates.length === 1
      ? PAD.left + innerW / 2
      : PAD.left + (dates.indexOf(date) / (dates.length - 1)) * innerW
  const yOf = (price) => PAD.top + (1 - (price - min) / (max - min)) * innerH

  const yTicks = Array.from({ length: 5 }, (_, i) => min + ((max - min) * i) / 4)
  const labelStep = Math.max(1, Math.ceil(dates.length / 7))
  const showValueLabel = allPoints.length <= 20

  return (
    <div className="price-trend-chart">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
      >
        {/* 横向网格线与 Y 轴刻度 */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={VIEW_W - PAD.right} y1={yOf(tick)} y2={yOf(tick)} stroke="#f0f0f0" />
            <text x={PAD.left - 8} y={yOf(tick) + 4} textAnchor="end" fontSize="11" fill="#8c8c8c">
              {formatY(tick)}
            </text>
          </g>
        ))}
        {/* 坐标轴 */}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={VIEW_H - PAD.bottom} stroke="#d9d9d9" />
        <line x1={PAD.left} x2={VIEW_W - PAD.right} y1={VIEW_H - PAD.bottom} y2={VIEW_H - PAD.bottom} stroke="#d9d9d9" />
        {/* X 轴日期标签（过密时抽稀） */}
        {dates.map((date, i) =>
          i % labelStep === 0 || i === dates.length - 1 ? (
            <text key={date} x={xOf(date)} y={VIEW_H - PAD.bottom + 20} textAnchor="middle" fontSize="11" fill="#8c8c8c">
              {date}
            </text>
          ) : null
        )}
        {/* 各供应商折线与数据点 */}
        {series.map((s, idx) => {
          const color = PALETTE[idx % PALETTE.length]
          const pts = s.points.map((p) => `${xOf(p.at)},${yOf(p.price)}`).join(' ')
          return (
            <g key={s.name}>
              {s.points.length > 1 && <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />}
              {s.points.map((p) => (
                <g key={`${s.name}-${p.at}-${p.price}`}>
                  <circle cx={xOf(p.at)} cy={yOf(p.price)} r="3.5" fill="#fff" stroke={color} strokeWidth="2">
                    <title>{`${s.name} ${p.at}：${formatY(p.price)}`}</title>
                  </circle>
                  {showValueLabel && (
                    <text x={xOf(p.at)} y={yOf(p.price) - 8} textAnchor="middle" fontSize="10" fill={color}>
                      {formatY(p.price)}
                    </text>
                  )}
                </g>
              ))}
            </g>
          )
        })}
      </svg>
      {/* 图例 */}
      <div className="chart-legend">
        {series.map((s, idx) => (
          <span key={s.name} className="legend-item">
            <span className="legend-dot" style={{ background: PALETTE[idx % PALETTE.length] }} />
            {s.name}
          </span>
        ))}
      </div>
      <style>{`
        .price-trend-chart .chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
          margin-top: 8px;
        }
        .price-trend-chart .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #595959;
        }
        .price-trend-chart .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
      `}</style>
    </div>
  )
}
