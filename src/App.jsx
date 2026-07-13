import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Button } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import PageReview from './components/PageReview/index.jsx'
import router from './router/index.jsx'

function App() {
  const [reviewActive, setReviewActive] = useState(false)

  return (
    <>
      <RouterProvider router={router} />
      <Button
        className="review-fab"
        type="primary"
        shape="circle"
        size="large"
        icon={<EditOutlined />}
        title="页面评审"
        onClick={() => setReviewActive(true)}
      />
      <PageReview active={reviewActive} onActiveChange={setReviewActive} />
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f7fa;
        }

        .review-fab {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  )
}

export default App
