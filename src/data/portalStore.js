// 门户级 mock 数据存储
// 使用 localStorage 持久化，刷新后数据保持一致

import { noticeStore } from './notices.js'

const NEWS_KEY = 'portal-news'
const STATS_KEY = 'portal-stats'
const DOWNLOADS_KEY = 'portal-downloads'

const defaultNews = [
  { id: 1, title: '关于平台上线试运行的通知', category: '平台公告', content: '平台已正式上线试运行，欢迎各供应商、招标人注册使用。试运行期间如有问题，请联系技术支持。', publishTime: '2026-07-10', status: 'published', attachments: [] },
  { id: 2, title: '2026年政府采购电子化招投标培训计划', category: '培训通知', content: '为提升平台使用效率，拟于2026年8月举办政府采购电子化招投标培训班，详情请下载附件。', publishTime: '2026-07-09', status: 'published', attachments: [{ name: '培训计划.pdf', size: '1.2MB' }] },
  { id: 3, title: 'CA数字证书办理指南更新说明', category: '办事指南', content: 'CA数字证书办理流程已更新，请供应商按照最新指南办理。', publishTime: '2026-07-08', status: 'published', attachments: [] },
  { id: 4, title: '关于加强供应商诚信管理的公告', category: '政策法规', content: '为进一步规范招投标市场秩序，加强供应商诚信管理，本公告自发布之日起执行。', publishTime: '2026-07-07', status: 'published', attachments: [] },
  { id: 5, title: '平台系统维护公告（7月12日凌晨）', category: '平台公告', content: '平台将于7月12日凌晨2:00-4:00进行系统维护，维护期间部分功能可能无法使用。', publishTime: '2026-07-06', status: 'offline', attachments: [] },
  { id: 6, title: '新版投标文件编制工具发布', category: '产品更新', content: '新版投标文件编制工具已发布，支持一键签章、自动检查功能。', publishTime: '2026-07-05', status: 'published', attachments: [{ name: '工具更新说明.pdf', size: '800KB' }] },
  { id: 7, title: '2026年第三季度招标采购意向公开', category: '采购信息', content: '现将2026年第三季度招标采购意向公开，欢迎符合条件的供应商关注。', publishTime: '2026-07-04', status: 'published', attachments: [] },
  { id: 8, title: '投标人常见问题汇总（2026年7月版）', category: '常见问题', content: '汇总了近期投标人咨询频率较高的问题及解答，供参考。', publishTime: '2026-07-03', status: 'published', attachments: [] },
  { id: 9, title: '监督投诉渠道及处理流程公示', category: '政策法规', content: '公示平台监督投诉渠道及处理流程，接受社会各界监督。', publishTime: '2026-07-02', status: 'published', attachments: [] },
  { id: 10, title: '平台用户隐私政策更新公告', category: '平台公告', content: '用户隐私政策已更新，请广大用户及时查阅并确认。', publishTime: '2026-07-01', status: 'published', attachments: [] }
]

const defaultStats = {
  totalProjects: 1256,
  totalSuppliers: 3890,
  monthlyOpenings: 528
}

const defaultDownloads = [
  { id: 1, name: 'CA数字证书驱动程序', version: 'V3.2.1', updateTime: '2026-07-10', desc: '支持主流CA机构USBKey，适配Windows 10/11', category: '驱动工具', content: 'CA驱动程序安装包（演示内容）\n版本：V3.2.1\n更新日期：2026-07-10' },
  { id: 2, name: '投标文件编制工具', version: 'V2.5.0', updateTime: '2026-07-08', desc: '离线编制投标文件、自动生成清单与签章', category: '投标工具', content: '投标文件编制工具安装说明（演示内容）\n版本：V2.5.0\n更新日期：2026-07-08' },
  { id: 3, name: '供应商操作手册', version: 'V2026.07', updateTime: '2026-07-06', desc: '供应商注册、报名、投标、开标全流程图文说明', category: '操作手册', content: '供应商操作手册（演示内容）\n版本：V2026.07\n更新日期：2026-07-06' },
  { id: 4, name: '招标人操作手册', version: 'V2026.07', updateTime: '2026-07-06', desc: '项目创建、公告发布、评标定标、合同归档说明', category: '操作手册', content: '招标人操作手册（演示内容）\n版本：V2026.07\n更新日期：2026-07-06' },
  { id: 5, name: '招标代理操作手册', version: 'V2026.06', updateTime: '2026-06-28', desc: '代理项目执行、专家抽取、异常处理指南', category: '操作手册', content: '招标代理操作手册（演示内容）\n版本：V2026.06\n更新日期：2026-06-28' },
  { id: 6, name: '评标专家操作手册', version: 'V2026.06', updateTime: '2026-06-28', desc: '在线评标、打分、出具评标报告操作指南', category: '操作手册', content: '评标专家操作手册（演示内容）\n版本：V2026.06\n更新日期：2026-06-28' }
]

function load(key, defaults) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaults
  } catch {
    return defaults
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

export const portalStore = {
  getNews() {
    return load(NEWS_KEY, defaultNews)
  },
  saveNews(news) {
    save(NEWS_KEY, news)
  },
  getPublishedNews() {
    return this.getNews().filter((n) => n.status === 'published')
  },
  getNotices() {
    // 门户仅展示已发布公告
    return noticeStore.getNotices().filter((n) => n.status === 'published')
  },
  saveNotices(notices) {
    noticeStore.saveNotices(notices)
  },
  getNoticeById(id) {
    return this.getNotices().find((n) => String(n.id) === String(id))
  },
  getStats() {
    return load(STATS_KEY, defaultStats)
  },
  saveStats(stats) {
    save(STATS_KEY, stats)
  },
  getDownloads() {
    return load(DOWNLOADS_KEY, defaultDownloads)
  },
  saveDownloads(downloads) {
    save(DOWNLOADS_KEY, downloads)
  },
  getDownloadById(id) {
    return this.getDownloads().find((d) => d.id === id)
  }
}

export const contactInfo = {
  phone: '400-123-4567',
  email: 'support@bidding-platform.example.com',
  address: 'XX市XX区公共资源交易中心 3 楼电子招投标服务窗口',
  workingHours: '工作日 9:00-18:00'
}
