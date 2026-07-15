import { useNavigate } from '@tanstack/react-router'
import { Card, Descriptions, Button } from 'antd'
import {
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import PortalHeader from '../components/PortalHeader.jsx'
import { contactInfo } from '../data/portalStore.js'

export default function Contact() {
  const navigate = useNavigate()

  return (
    <div className="public-page">
      <PortalHeader activeKey="contact" />
      <div className="public-page-content">
        <Card
          title={<span style={{ fontSize: 18, fontWeight: 'bold' }}>联系我们</span>}
          extra={
            <Button type="link" icon={<HomeOutlined />} onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        >
          <Descriptions bordered column={1} labelStyle={{ width: 160 }}>
            <Descriptions.Item label={<><PhoneOutlined /> 联系电话</>}>
              {contactInfo.phone}
            </Descriptions.Item>
            <Descriptions.Item label={<><MailOutlined /> 电子邮箱</>}>
              {contactInfo.email}
            </Descriptions.Item>
            <Descriptions.Item label={<><EnvironmentOutlined /> 办公地址</>}>
              {contactInfo.address}
            </Descriptions.Item>
            <Descriptions.Item label={<><ClockCircleOutlined /> 工作时间</>}>
              {contactInfo.workingHours}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
      <style>{`
        .public-page {
          min-height: 100vh;
          background-color: #f5f7fa;
        }
        .public-page-content {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }
      `}</style>
    </div>
  )
}
