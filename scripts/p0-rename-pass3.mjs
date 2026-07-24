#!/usr/bin/env node
// Third pass — hammer through all remaining patterns with explicit per-file edits

import { readFileSync, writeFileSync } from 'fs'

const FILES = [
  // Routes — staticData title
  { path: 'src/routes/admin.evaluation-hall.jsx', fixes: [['评审大厅', '评审大厅'], ['评标大厅', '评审大厅']] },
  { path: 'src/routes/admin.opening-hall.jsx', fixes: [['开启大厅', '开启大厅'], ['开标大厅', '开启大厅']] },
  { path: 'src/routes/admin.award-notice.jsx', fixes: [['中选通知书', '中选通知书'], ['中标通知书', '中选通知书']] },
  { path: 'src/routes/admin.tender-doc.jsx', fixes: [['采购文件', '采购文件'], ['招标文件', '采购文件']] },
  { path: 'src/routes/admin.bid-upload.jsx', fixes: [['上传响应文件', '上传响应文件'], ['上传投标文件', '上传响应文件']] },
  { path: 'src/routes/admin.expert-project.jsx', fixes: [['评审任务', '评审任务'], ['评标任务', '评审任务'], ['评标大厅', '评审大厅']] },
  { path: 'src/routes/admin.award-confirm.jsx', fixes: [['确认中选单位', '确认中选单位'], ['确认中标人', '确认中选单位']] },

  // UI text / data
  { path: 'src/views/AdminLogs.jsx', fixes: [['发布采购公告', '发布采购公告'], ['发布招标公告', '发布采购公告'], ['评标通知短信', '评审通知短信'], ['发评审通知短信', '发评审通知短信']] },
  { path: 'src/views/SystemSettings.jsx', fixes: [['开启提醒', '开启提醒'], ['开标提醒', '开启提醒'], ['招投标采购平台', '采购平台']] },
  { path: 'src/views/Downloads.jsx', fixes: [['投标工具', '响应工具']] },
  { path: 'src/views/Dashboard.jsx', fixes: [['招标流程', '采购流程'], ['组织开评审', '组织开启/评审']] },
  { path: 'src/views/Organization.jsx', fixes: [['招标代理部', '采购代理部']] },
  { path: 'src/views/ProjectDetail.jsx', fixes: [['自行招标', '自行采购'], ['中机国际招标有限公司', '中机国际采购有限公司']] },
  { path: 'src/views/ProjectCreate.jsx', fixes: [['自行招标', '自行采购'], ['中机国际招标有限公司', '中机国际采购有限公司']] },
  { path: 'src/views/ProjectList.jsx', fixes: [['自行招标', '自行采购']] },
  { path: 'src/views/TenderDoc.jsx', fixes: [['自行招标', '自行采购'], ['委托代理招标', '委托代理采购']] },
  { path: 'src/views/ProjectTrack.jsx', fixes: [['招标方视角', '采购方视角'], ['招标方在', '采购方在']] },
  { path: 'src/views/ExpertProject.jsx', fixes: [['招标/响应文件', '采购/响应文件']] },
  { path: 'src/components/ProjectEntryGuard.jsx', fixes: [['我的评标任务', '我的评审任务']] },
  { path: 'src/utils/roleStore.js', fixes: [['XX招标代理有限公司', 'XX采购代理有限公司'], ['招标代理部', '采购代理部'], ['投标部', '响应部']] },
  { path: 'src/data/notices.js', fixes: [['招标条件', '采购条件']] },
  { path: 'src/data/clauseStore.js', fixes: [['投标函', '响应函'], ['供评标', '供评审']] },
]

for (const { path, fixes } of FILES) {
  let content = readFileSync(path, 'utf-8')
  let changed = 0
  for (const [from, to] of fixes) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const newContent = content.replace(new RegExp(escaped, 'g'), to)
    if (newContent !== content) {
      changed++
      content = newContent
    }
  }
  if (changed > 0) {
    writeFileSync(path, content, 'utf-8')
    console.log(`✓ ${path}`)
  }
}
console.log('\nThird pass done')
