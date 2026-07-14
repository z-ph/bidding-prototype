// 资质类型与项目资质要求配置（演示环境持久化在 localStorage）

export const QUALIFICATION_TYPES = [
  { key: 'business-license', label: '营业执照', required: true },
  { key: 'iso9001', label: 'ISO9001认证', required: false },
  { key: 'safety-license', label: '安全生产许可证', required: false },
  { key: 'credit-rating', label: '信用评级证书', required: false },
  { key: 'tax-registration', label: '税务登记证', required: false }
]

// 项目 ID -> 报名资质要求
export const PROJECT_QUALIFICATION_REQUIREMENTS = {
  1: ['business-license', 'iso9001'],
  2: ['business-license'],
  3: ['business-license', 'safety-license'],
  4: ['business-license'],
  5: ['business-license', 'iso9001']
}

export function getProjectRequiredQualifications(projectId) {
  const id = Number(projectId)
  return PROJECT_QUALIFICATION_REQUIREMENTS[id] || ['business-license']
}

export function getQualificationLabel(key) {
  return QUALIFICATION_TYPES.find((q) => q.key === key)?.label || key
}
