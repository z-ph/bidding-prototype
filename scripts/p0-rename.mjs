#!/usr/bin/env node
// P0 全局用词整改脚本 — 使用原生 fs（无外部依赖）
// 替换顺序：长→短，避免短词吃掉长词的前缀

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const REPLACEMENTS = [
  // 第 1 层：最长复合词
  ['招标代理有限公司', '采购代理有限公司'],
  ['招标代理部', '采购代理部'],
  ['招标文件编制', '采购文件编制'],
  ['招标文件', '采购文件'],
  ['招标公告', '采购公告'],
  ['公开招标', '公开采购'],
  ['邀请招标', '邀请采购'],
  ['公开询比价', '公开询比'],
  ['邀请询比价', '邀请询比'],
  ['投标截止', '采购截止'],
  ['投标文件组成', '响应文件组成'],
  ['投标文件', '响应文件'],
  ['投标人须知', '响应单位须知'],
  ['投标人/供应商', '响应单位/供应商'],
  ['投标人', '响应单位'],
  ['中标通知书', '中选通知书'],
  ['中标通知', '中选通知'],
  ['中标公告', '中选通知'],
  ['中标候选人', '中选候选人'],
  ['候选人公示', '采购结果公告'],
  ['本月招标', '本月采购事项'],
  ['招标人/招标代理', '采购单位/采购代理'],
  ['招标人/代理', '采购单位/代理'],
  ['招标代理', '采购代理'],
  ['招标人', '采购单位'],
  ['评标委员会', '评审委员会'],
  ['评标专家', '评审专家'],
  ['评标报告', '评审报告'],
  ['评标大厅', '评审大厅'],
  ['评标办法', '评审办法'],
  ['评标中', '评审中'],
  ['评标完成', '评审完成'],
  ['评标截止', '评审截止'],
  ['定标审批', '成交审批'],
  ['定标报告', '成交报告'],
  ['定标流程', '成交流程'],
  ['定标结束', '成交结束'],
  ['进入定标', '进入成交确认'],
  ['前往定标', '前往成交确认'],
  ['到达定标', '到达成交确认'],
  ['开标大厅', '开启大厅'],
  ['开标时间', '开启时间'],
  ['开标准备', '开启准备'],
  ['开标结束', '开启结束'],
  ['开标启动', '开启启动'],
  ['开标记录', '开启记录'],
  ['开标一览表', '开启一览表'],
  ['开标信息', '开启信息'],
  ['开标现场', '开启现场'],
  ['开标环节', '开启环节'],
  ['开标项目', '开启项目'],
  ['开标阶段', '开启阶段'],
  ['进入开标', '进入开启'],
  ['唱标公示', '唱价公示'],
  ['唱标内容', '唱价内容'],
  ['唱标结果', '唱价结果'],
  ['唱标一览表', '唱价一览表'],
  ['唱标结束', '唱价结束'],
  ['唱标', '唱价'],
  ['投标报价', '响应报价'],
  ['投标情况', '响应情况'],
  ['投标邀请书', '响应邀请书'],
  ['投标回执', '响应回执'],
  ['投标部', '响应部'],
  ['投标', '响应'],
  ['发标', '发布采购'],
  ['标段', '采购包'],
  ['标书', '采购文件'],
  ['招标中', '采购中'],
  ['招标族', '采购族'],
  ['招标方式', '采购方式'],
  ['招标项目', '采购项目'],
  ['招投标平台', '采购平台'],
  // 第 2 层：双字词（必须最后）
  ['开标', '开启'],
  ['评标', '评审'],
  ['定标', '成交确认'],
  ['中标', '中选'],
]

const SKIP_FILES = new Set([
  'src/data/changelog.js',
  'src/views/ReviewChangeList.jsx',
])

function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') results.push(...walk(p))
    } else if (['.jsx', '.js'].includes(extname(entry.name))) {
      results.push(p)
    }
  }
  return results
}

function replaceInFile(filePath) {
  if (SKIP_FILES.has(filePath)) return 0
  let content = readFileSync(filePath, 'utf-8')
  let count = 0

  for (const [from, to] of REPLACEMENTS) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'g')
    const before = content.length
    content = content.replace(regex, to)
    const after = content.length
    if (before !== after) {
      const occurrences = (before - after) / (from.length - to.length)
      count += occurrences
    }
  }

  if (count > 0) {
    writeFileSync(filePath, content, 'utf-8')
    console.log(`✓ ${filePath} (${count} replacements)`)
  }
  return count
}

const files = walk('src')
let totalReplacements = 0
let changedFiles = 0

for (const f of files) {
  const n = replaceInFile(f)
  if (n > 0) { changedFiles++; totalReplacements += n }
}

console.log(`\nDone: ${changedFiles} files modified, ${totalReplacements} total replacements`)
