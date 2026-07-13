import { useState } from 'react'
import { Alert, Button, Card, Empty, Form, Input, Radio, Table, Tabs, Tag, message } from 'antd'

export default function EvaluationHall() {
  const [activeTab, setActiveTab] = useState('summary')

  const scoreSummary = [
    { rank: 1, name: 'C股份有限公司', business: 28, tech: 36, price: 29, total: 93, recommend: '推荐中标' },
    { rank: 2, name: 'A科技有限公司', business: 27, tech: 34, price: 28, total: 89, recommend: '备选' },
    { rank: 3, name: 'B实业有限公司', business: 26, tech: 31, price: 27, total: 84, recommend: '备选' }
  ]

  const expertScores = [
    { expert: '专家甲', bidder: 'C股份有限公司', business: 28, tech: 36, price: 29, comment: '技术方案完善，价格合理', status: '已提交' },
    { expert: '专家乙', bidder: 'A科技有限公司', business: 27, tech: 34, price: 28, comment: '资质优良，报价略高', status: '已提交' },
    { expert: '专家丙', bidder: 'B实业有限公司', business: 26, tech: 31, price: 27, comment: '方案基本满足要求', status: '待提交' }
  ]

  const rejected = [
    { name: 'D有限公司', reason: '未按要求加盖电子签章，投标文件无效。' }
  ]

  const [reportForm, setReportForm] = useState({
    opinion: '经评标委员会评审，C股份有限公司综合得分最高，技术方案满足招标文件要求，报价合理，推荐为中标候选人。',
    recommend: 'C股份有限公司'
  })

  const saveReport = () => {
    message.success('评标报告已保存')
  }

  const exportReport = () => {
    message.success('评标报告 PDF 导出中...')
  }

  const submitResult = () => {
    message.success('评标结果已提交，进入中标公示流程')
  }

  const summaryColumns = [
    { title: '排名', dataIndex: 'rank', width: 80 },
    { title: '投标人', dataIndex: 'name', minWidth: 200 },
    { title: '商务标（30）', dataIndex: 'business', width: 120 },
    { title: '技术标（40）', dataIndex: 'tech', width: 120 },
    { title: '价格标（30）', dataIndex: 'price', width: 120 },
    {
      title: '总分',
      dataIndex: 'total',
      width: 100,
      render: (total) => <strong style={{ color: '#409EFF' }}>{total}</strong>
    },
    {
      title: '推荐意见',
      dataIndex: 'recommend',
      width: 120,
      render: (recommend) => (
        <Tag color={recommend === '推荐中标' ? 'success' : 'default'}>{recommend}</Tag>
      )
    }
  ]

  const expertColumns = [
    { title: '专家', dataIndex: 'expert', width: 120 },
    { title: '投标人', dataIndex: 'bidder' },
    { title: '商务', dataIndex: 'business', width: 100 },
    { title: '技术', dataIndex: 'tech', width: 100 },
    { title: '价格', dataIndex: 'price', width: 100 },
    { title: '评审意见', dataIndex: 'comment', minWidth: 200 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '已提交' ? 'success' : 'warning'}>{status}</Tag>
      )
    }
  ]

  const tabItems = [
    {
      key: 'summary',
      label: '评分汇总',
      children: (
        <>
          <Table
            columns={summaryColumns}
            dataSource={scoreSummary}
            rowKey="name"
            bordered
            pagination={false}
            style={{ width: '100%' }}
          />
          <div className="chart-mock">
            <h4>得分对比</h4>
            <div className="bars">
              {scoreSummary.map((item) => (
                <div key={item.name} className="bar-item">
                  <span className="bar-name">{item.name}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${item.total}%` }} />
                  </div>
                  <span className="bar-value">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )
    },
    {
      key: 'expert',
      label: '专家评审',
      children: (
        <Table
          columns={expertColumns}
          dataSource={expertScores}
          rowKey={(row) => `${row.expert}-${row.bidder}`}
          bordered
          pagination={false}
          style={{ width: '100%' }}
        />
      )
    },
    {
      key: 'reject',
      label: '否决投标',
      children:
        rejected.length === 0 ? (
          <Empty description="暂无否决投标" />
        ) : (
          rejected.map((item, idx) => (
            <Alert
              key={idx}
              message={`${item.name}：${item.reason}`}
              type="error"
              closable={false}
              style={{ marginBottom: 12 }}
            />
          ))
        )
    },
    {
      key: 'report',
      label: '评标报告',
      children: (
        <Form layout="vertical">
          <Form.Item label="评标委员会意见">
            <Input.TextArea
              rows={6}
              placeholder="汇总评标委员会整体意见..."
              value={reportForm.opinion}
              onChange={(e) => setReportForm((prev) => ({ ...prev, opinion: e.target.value }))}
            />
          </Form.Item>
          <Form.Item label="推荐中标候选人">
            <Radio.Group
              value={reportForm.recommend}
              onChange={(e) => setReportForm((prev) => ({ ...prev, recommend: e.target.value }))}
            >
              {scoreSummary.map((item) => (
                <Radio key={item.name} value={item.name}>
                  {item.name}（{item.total}分）
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={saveReport}>
              保存报告
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={exportReport}>
              导出 PDF
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ]

  return (
    <div className="evaluation-hall">
      <Card
        title={
          <div className="hall-header">
            <div>
              <h2>评标大厅</h2>
              <p className="subtitle">XX市轨道交通设备采购项目 · 标段一：主设备</p>
            </div>
            <div className="hall-meta">
              <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
                评标中
              </Tag>
              <Button type="primary" onClick={submitResult}>
                提交评标结果
              </Button>
            </div>
          </div>
        }
      >
        <Tabs
          type="card"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <style>{`
        .evaluation-hall {
          max-width: 1100px;
          margin: 0 auto;
        }
        .evaluation-hall .hall-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .evaluation-hall .hall-header h2 {
          margin: 0;
        }
        .evaluation-hall .subtitle {
          color: #666;
          margin: 8px 0 0;
        }
        .evaluation-hall .hall-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .evaluation-hall .chart-mock {
          margin-top: 24px;
          padding: 20px;
          background: #f9fafc;
          border-radius: 8px;
        }
        .evaluation-hall .chart-mock h4 {
          margin-bottom: 16px;
        }
        .evaluation-hall .bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .evaluation-hall .bar-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .evaluation-hall .bar-name {
          width: 160px;
          font-size: 14px;
          color: #333;
        }
        .evaluation-hall .bar-track {
          flex: 1;
          height: 20px;
          background: #e4e7ed;
          border-radius: 10px;
          overflow: hidden;
        }
        .evaluation-hall .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #409EFF, #67C23A);
          border-radius: 10px;
          transition: width 0.5s;
        }
        .evaluation-hall .bar-value {
          width: 40px;
          text-align: right;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
