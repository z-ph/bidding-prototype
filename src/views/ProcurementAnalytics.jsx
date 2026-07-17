// 采购数据分析看板（价格趋势 / 材料比价 / 风险预警 / 预警规则配置）
// 依据：spec/changes/add-procurement-analytics-20260717（2026-07-17 会议概要八）。
// 数据来源口径：数据由 e签宝 提供接口，原型阶段统一走 analyticsStore mock（预留 src/utils/eqianbaoAnalyticsApi.js 切换）。
// 入口可见角色暂定 tenderee / agent / admin，待甲方确认（菜单与权限由基础设施 agent 统一接线）。
import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  message
} from 'antd'
import { BarChartOutlined } from '@ant-design/icons'
import { analyticsStore, WARNING_RULE_LABELS } from '../data/analyticsStore.js'
import PriceTrendChart from '../components/analytics/PriceTrendChart.jsx'

// 项目 id → 名称映射（沿用全局列表页的既有约定，mock 项目未入 projectStore）
const PROJECT_NAMES = {
  '1': 'XX市轨道交通设备采购项目',
  '2': '办公桌椅采购项目',
  '3': '软件开发服务项目',
  '4': '物业服务采购项目',
  '5': '实验室设备采购项目'
}
const projectName = (id) => PROJECT_NAMES[String(id)] || (id ? `项目 ${id}` : '—')

const formatPrice = (v) => Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 2 })

const RULE_ORDER = ['sameLegalPerson', 'parentChild', 'abnormalHighPrice']
const RULE_COLORS = { sameLegalPerson: 'volcano', parentChild: 'geekblue', abnormalHighPrice: 'red' }
const RULE_DESCS = {
  sameLegalPerson: '多家供应商的法定代表人为同一人时生成预警',
  parentChild: '供应商之间存在上下级（母公司 / 分公司等）关系时生成预警',
  abnormalHighPrice: '供应商报价高出同材料历史均价超过设定阈值时生成预警'
}

export default function ProcurementAnalytics() {
  const materials = analyticsStore.getMaterials()
  const suppliers = analyticsStore.getSuppliers()
  const priceCount = analyticsStore.getPrices().length

  // 价格趋势筛选（材料 + 供应商 + 时间范围三维组合）
  const [trendMaterial, setTrendMaterial] = useState(materials[0])
  const [trendSupplier, setTrendSupplier] = useState(undefined)
  const [dateRange, setDateRange] = useState(null)

  // 材料比价
  const [compareMaterial, setCompareMaterial] = useState(materials[0])

  // 预警规则（草稿）与已保存版本号：保存后 bump 版本号，触发 warnings 重算（store 无订阅机制，组件自行重读）
  const [rules, setRules] = useState(() => analyticsStore.getWarningRules())
  const [rulesVersion, setRulesVersion] = useState(0)
  const warnings = useMemo(() => analyticsStore.warnings(), [rulesVersion])
  const savedRules = useMemo(() => analyticsStore.getWarningRules(), [rulesVersion])

  const trendRecords = useMemo(
    () =>
      analyticsStore.trends({
        material: trendMaterial || undefined,
        supplierId: trendSupplier || undefined,
        from: dateRange?.[0]?.format('YYYY-MM-DD'),
        to: dateRange?.[1]?.format('YYYY-MM-DD')
      }),
    [trendMaterial, trendSupplier, dateRange]
  )

  // 按供应商分组为多序列折线
  const trendSeries = useMemo(() => {
    const bySupplier = new Map()
    trendRecords.forEach((r) => {
      if (!bySupplier.has(r.supplierId)) {
        bySupplier.set(r.supplierId, { name: r.supplierName, points: [] })
      }
      bySupplier.get(r.supplierId).points.push({ at: r.at, price: r.price })
    })
    return [...bySupplier.values()]
  }, [trendRecords])

  const compareResult = useMemo(
    () => (compareMaterial ? analyticsStore.compare(compareMaterial) : null),
    [compareMaterial]
  )
  const latests = compareResult ? compareResult.suppliers.map((s) => s.latest) : []
  const minLatest = latests.length ? Math.min(...latests) : null
  const maxLatest = latests.length ? Math.max(...latests) : null

  const resetTrendFilters = () => {
    setTrendMaterial(undefined)
    setTrendSupplier(undefined)
    setDateRange(null)
  }

  const saveRules = () => {
    const threshold = Number(rules.abnormalHighPriceThreshold)
    if (!Number.isFinite(threshold) || threshold < 0) {
      message.warning('请填写有效的阈值（不小于 0 的百分比数字）')
      return
    }
    analyticsStore.saveWarningRules({ ...rules, abnormalHighPriceThreshold: threshold })
    setRules((prev) => ({ ...prev, abnormalHighPriceThreshold: threshold }))
    setRulesVersion((v) => v + 1)
    message.success('预警规则已保存，预警列表已按新规则重新计算')
  }

  const trendColumns = [
    { title: '日期', dataIndex: 'at', width: 110 },
    { title: '材料', dataIndex: 'material', minWidth: 200 },
    { title: '供应商', dataIndex: 'supplierName', width: 200 },
    { title: '价格', dataIndex: 'price', width: 120, align: 'right', render: (v) => formatPrice(v) },
    { title: '项目', dataIndex: 'projectId', width: 200, render: (v) => projectName(v) }
  ]

  const compareColumns = [
    { title: '供应商', dataIndex: 'supplierName', minWidth: 200 },
    { title: '报价次数', dataIndex: 'records', width: 90, align: 'center', render: (records) => records.length },
    {
      title: '最新价',
      dataIndex: 'latest',
      width: 210,
      align: 'right',
      render: (v, row) => {
        const isMax = latests.length > 1 && v === maxLatest
        const isMin = latests.length > 1 && v === minLatest
        return (
          <span style={{ color: isMax ? '#cf1322' : isMin ? '#3f8600' : undefined, fontWeight: isMax || isMin ? 600 : 400 }}>
            {formatPrice(v)}
            {isMax && <Tag color="red" style={{ marginLeft: 8 }}>最高</Tag>}
            {isMin && <Tag color="green" style={{ marginLeft: 8 }}>最低</Tag>}
            <div style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>
              {row.records[row.records.length - 1]?.at}
            </div>
          </span>
        )
      }
    },
    { title: '最低价', dataIndex: 'min', width: 110, align: 'right', render: (v) => formatPrice(v) },
    { title: '最高价', dataIndex: 'max', width: 110, align: 'right', render: (v) => formatPrice(v) },
    { title: '均价', dataIndex: 'avg', width: 110, align: 'right', render: (v) => formatPrice(v) },
    {
      title: '与最低价差',
      key: 'diff',
      width: 130,
      align: 'right',
      render: (_, row) => (minLatest === null ? '—' : formatPrice(Number((row.latest - minLatest).toFixed(2))))
    }
  ]

  const warningColumns = [
    { title: '预警说明', dataIndex: 'message', minWidth: 320 },
    {
      title: '涉及供应商',
      dataIndex: 'suppliers',
      width: 260,
      render: (list) => (list || []).map((n) => <Tag key={n}>{n}</Tag>)
    },
    { title: '材料', dataIndex: 'material', width: 200, render: (v) => v || '—' },
    { title: '项目', dataIndex: 'projectId', width: 190, render: (v) => projectName(v) },
    { title: '时间', dataIndex: 'at', width: 110, render: (v) => v || '—' }
  ]

  const materialOptions = materials.map((m) => ({ label: m, value: m }))
  const supplierOptions = suppliers.map((s) => ({ label: s.name, value: s.id }))

  const tabItems = [
    {
      key: 'trend',
      label: '价格趋势',
      children: (
        <>
          <Space wrap style={{ marginBottom: 16 }}>
            <Select
              placeholder="全部材料"
              allowClear
              style={{ width: 260 }}
              value={trendMaterial}
              onChange={(v) => setTrendMaterial(v)}
              options={materialOptions}
            />
            <Select
              placeholder="全部供应商"
              allowClear
              style={{ width: 220 }}
              value={trendSupplier}
              onChange={(v) => setTrendSupplier(v)}
              options={supplierOptions}
            />
            <DatePicker.RangePicker value={dateRange} onChange={(v) => setDateRange(v)} />
            <Button onClick={resetTrendFilters}>重置</Button>
          </Space>
          {!trendMaterial && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              title="未选择材料：图表按供应商聚合全部材料的价格记录，不同材料量纲不同，趋势仅供概览。"
            />
          )}
          <PriceTrendChart series={trendSeries} />
          <Divider style={{ margin: '16px 0' }} />
          <Table
            columns={trendColumns}
            dataSource={trendRecords}
            rowKey="id"
            size="small"
            bordered
            pagination={false}
            style={{ width: '100%' }}
          />
        </>
      )
    },
    {
      key: 'compare',
      label: '材料比价',
      children: (
        <>
          <Space wrap style={{ marginBottom: 16 }}>
            <Select
              placeholder="选择材料"
              style={{ width: 280 }}
              value={compareMaterial}
              onChange={(v) => setCompareMaterial(v)}
              options={materialOptions}
            />
          </Space>
          {!compareResult || compareResult.suppliers.length === 0 ? (
            <Empty description="该材料暂无供应商报价记录" style={{ padding: '32px 0' }} />
          ) : (
            <>
              <Space size={48} style={{ marginBottom: 16 }}>
                <Statistic title="对比供应商" value={compareResult.suppliers.length} suffix="家" />
                <Statistic
                  title="最新价极差（最高 - 最低）"
                  value={compareResult.spread}
                  valueStyle={{ color: compareResult.spread > 0 ? '#cf1322' : undefined }}
                />
              </Space>
              <Table
                columns={compareColumns}
                dataSource={compareResult.suppliers}
                rowKey="supplierId"
                size="middle"
                bordered
                pagination={false}
                style={{ width: '100%' }}
              />
            </>
          )}
        </>
      )
    },
    {
      key: 'warnings',
      label: `风险预警（${warnings.length}）`,
      children: (
        <>
          {RULE_ORDER.map((key) => {
            const list = warnings.filter((w) => w.rule === key)
            const enabled = savedRules[key]
            return (
              <div key={key} className="warning-group">
                <div className="warning-group-header">
                  <Tag color={RULE_COLORS[key]}>{WARNING_RULE_LABELS[key]}</Tag>
                  <span className="warning-count">{list.length} 条</span>
                  {!enabled && <Tag>规则已关闭</Tag>}
                </div>
                {!enabled ? (
                  <div className="warning-empty">该规则已关闭，不再产生此类预警；可在「预警规则配置」中重新开启。</div>
                ) : list.length === 0 ? (
                  <div className="warning-empty">当前数据未命中该规则。</div>
                ) : (
                  <Table
                    columns={warningColumns}
                    dataSource={list}
                    rowKey="id"
                    size="small"
                    bordered
                    pagination={false}
                    style={{ width: '100%' }}
                  />
                )}
              </div>
            )
          })}
        </>
      )
    },
    {
      key: 'rules',
      label: '预警规则配置',
      children: (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            title="规则保存后立即生效，预警列表按新规则重新计算；关闭某类规则后不再产生该类预警。阈值为报价高出同材料历史均价的百分比。"
          />
          <div className="rules-panel">
            {RULE_ORDER.map((key) => (
              <div className="rule-row" key={key}>
                <div className="rule-info">
                  <div className="rule-name">{WARNING_RULE_LABELS[key]}</div>
                  <div className="rule-desc">{RULE_DESCS[key]}</div>
                </div>
                <Switch
                  checked={!!rules[key]}
                  onChange={(checked) => setRules((prev) => ({ ...prev, [key]: checked }))}
                />
              </div>
            ))}
            <div className="rule-row">
              <div className="rule-info">
                <div className="rule-name">异常高价阈值</div>
                <div className="rule-desc">报价高出同材料历史均价的百分比，达到该值即触发「报价异常高」预警</div>
              </div>
              <InputNumber
                min={0}
                max={500}
                step={5}
                addonAfter="%"
                disabled={!rules.abnormalHighPrice}
                value={rules.abnormalHighPriceThreshold}
                onChange={(value) => setRules((prev) => ({ ...prev, abnormalHighPriceThreshold: value }))}
              />
            </div>
            <div className="rule-actions">
              <Button type="primary" onClick={saveRules}>保存规则</Button>
            </div>
          </div>
        </>
      )
    }
  ]

  return (
    <div className="procurement-analytics">
      <Card
        title={
          <span>
            <BarChartOutlined style={{ marginRight: 8 }} />
            采购数据分析
          </span>
        }
        extra={<Tag color="gold">mock 数据</Tag>}
      >
        {/* 顶部统计卡片 */}
        <Row gutter={16} className="stat-row">
          <Col span={6}>
            <Card><Statistic title="材料种类" value={materials.length} suffix="种" /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="供应商数量" value={suppliers.length} suffix="家" /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="价格记录" value={priceCount} suffix="条" /></Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="当前预警"
                value={warnings.length}
                suffix="条"
                valueStyle={{ color: warnings.length > 0 ? '#cf1322' : undefined }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs type="card" defaultActiveKey="trend" items={tabItems} />

        <Divider style={{ margin: '16px 0 8px' }} />
        <div className="data-source-note">数据由 e签宝 提供接口，原型为 mock 数据</div>
      </Card>

      <style>{`
        .procurement-analytics {
          max-width: 1100px;
          margin: 0 auto;
        }
        .procurement-analytics .stat-row {
          margin-bottom: 20px;
        }
        .procurement-analytics .warning-group {
          margin-bottom: 20px;
        }
        .procurement-analytics .warning-group-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .procurement-analytics .warning-count {
          color: #595959;
          font-size: 13px;
        }
        .procurement-analytics .warning-empty {
          color: #999;
          font-size: 13px;
          padding: 4px 0 4px 2px;
        }
        .procurement-analytics .rule-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          padding: 14px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .procurement-analytics .rule-name {
          font-weight: 600;
        }
        .procurement-analytics .rule-desc {
          color: #999;
          font-size: 12px;
          margin-top: 2px;
        }
        .procurement-analytics .rule-actions {
          margin-top: 16px;
          text-align: right;
        }
        .procurement-analytics .data-source-note {
          color: #999;
          font-size: 12px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
