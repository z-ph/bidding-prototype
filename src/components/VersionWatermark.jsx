import { Watermark } from 'antd'
import appInfo from '../../package.json'

/**
 * 全局版本号水印：把 package.json 的 version 平铺显示在页面上，
 * 使截图/录屏/评审导出都能对应到具体版本。
 * 版本号维护要求见 AGENTS.md「版本信息维护」。
 */
export default function VersionWatermark({ children }) {
  return (
    <Watermark
      content={`v${appInfo.version}`}
      font={{ color: 'rgba(0, 0, 0, 0.08)', fontSize: 14 }}
      style={{ minHeight: '100vh' }}
    >
      {children}
    </Watermark>
  )
}
