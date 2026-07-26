// p0 敏感词整改第四轮（2026-07-26，台账 0726-007）：清理 0724 整改后的残留
// 范围：src/ 产品代码（用户可见文案 + 同步注释），排除 ReviewChangeList.jsx / changelog.js 台账历史条目
// 映射：公开询比→阳光询比、询比价→询比、公开项目→开放项目、商务标/技术标→商务文件/技术文件（BidUpload）
//       或 商务/技术（评分项）、价格标→价格、报价标→报价文件、已废标→已作废、已流标→已终止、
//       串标→串通报价、采购意向公开→采购意向公示、招标族→采购族、公开唱价→集中唱价等
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = new URL('../src', import.meta.url).pathname
const EXCLUDE = new Set(['ReviewChangeList.jsx', 'changelog.js', 'routeTree.gen.ts'])

// 全量规则（按序执行，长串优先）
const GLOBAL_RULES = [
  ['公开询比', '阳光询比'],
  ['询比价', '询比'],
  ['招标族', '采购族'],
  ['当前为招标项目', '当前为采购项目'],
  ['公开唱价并公示报价', '集中唱价并公示报价'],
  ['公开报价与核心信息', '公布报价与核心信息'],
  ['顺序公开响应报价', '顺序公布响应报价'],
  ['投标人须以电子签章', '响应单位须以电子签章'],
  ['避免废标', '缺失将导致响应无效'],
  ['已废标', '已作废'],
  ['已流标', '已终止'],
  ['疑似串标预警', '疑似串通报价预警'],
  ['该项目为邀请/非公开项目', '该项目为邀请类项目'],
  ['公开项目·可自行下载', '开放项目·可自行下载'],
  ['非公开项目·需授权', '邀请项目·需授权'],
  ['公开项目可直接下载', '开放项目可直接下载'],
  ['2 个公开项目', '2 个开放项目'],
  ['公开项目供应商可自行下载采购文件，非公开项目仅授权名单内供应商可下载', '开放项目供应商可自行下载采购文件，邀请类项目仅授权名单内供应商可下载'],
  ['采购意向公开', '采购意向公示']
]

// 文件级规则（同一源词在不同文件目标不同）
const FILE_RULES = {
  'BidUpload.jsx': [
    ['商务标', '商务文件'],
    ['技术标', '技术文件'],
    ['报价标', '报价文件']
  ],
  'tenderDocStore.js': [
    ['商务标', '商务'],
    ['技术标', '技术'],
    ['价格标', '价格']
  ],
  'EvaluationHall.jsx': [
    ['商务标', '商务'],
    ['技术标', '技术'],
    ['价格标', '价格']
  ]
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(jsx?|tsx?)$/.test(name) && !EXCLUDE.has(name)) out.push(p)
  }
  return out
}

let totalFiles = 0
let totalRepl = 0
for (const file of walk(SRC)) {
  const base = file.split('/').pop()
  let text = readFileSync(file, 'utf8')
  let count = 0
  const rules = [...(FILE_RULES[base] || []), ...GLOBAL_RULES]
  for (const [from, to] of rules) {
    const hits = text.split(from).length - 1
    if (hits > 0) {
      text = text.split(from).join(to)
      count += hits
    }
  }
  if (count > 0) {
    writeFileSync(file, text)
    totalFiles++
    totalRepl += count
    console.log(`${file.replace(SRC, 'src')}: ${count} 处`)
  }
}
console.log(`\n共 ${totalFiles} 个文件、${totalRepl} 处替换`)
