<template>
  <div class="opening-hall">
    <el-card>
      <template #header>
        <div class="hall-header">
          <div>
            <h2>开标大厅</h2>
            <p class="subtitle">XX市轨道交通设备采购项目 · 标段一：主设备</p>
          </div>
          <div class="hall-meta">
            <el-tag size="large" type="danger">开标倒计时：00:12:35</el-tag>
            <el-tag size="large" :type="roleTagType">{{ roleName }}</el-tag>
            <el-button type="primary" @click="refresh">刷新状态</el-button>
          </div>
        </div>
      </template>

      <el-steps :active="currentStage" finish-status="success" align-center>
        <el-step title="身份核验" description="招标人/投标人/专家签到" />
        <el-step title="开标启动" description="招标人宣布开标" />
        <el-step title="文件解密" description="投标人CA解密投标文件" />
        <el-step title="唱标公示" description="公开报价与核心信息" />
        <el-step title="开标结束" description="生成开标记录" />
      </el-steps>

      <div class="stage-panel">
        <!-- 阶段1：身份核验 -->
        <div v-if="currentStage === 0" class="stage-content">
          <h3>在线签到</h3>
          <p class="tip">请插入 CA 证书完成身份核验</p>
          <el-alert v-if="!canOperate" type="info" :closable="false" show-icon>
            您当前以 {{ roleName }} 身份进入，仅可查看开标过程。
          </el-alert>
          <el-table :data="attendees" style="width: 100%">
            <el-table-column prop="role" label="角色" width="120" />
            <el-table-column prop="name" label="姓名/企业" />
            <el-table-column prop="status" label="签到状态" width="120">
              <template #default="{ row }">
                <StatusTag :label="row.status" :status="row.status === '已签到' ? 'completed' : 'pending'" />
              </template>
            </el-table-column>
            <el-table-column prop="time" label="签到时间" width="180" />
            <el-table-column v-if="canOperate" label="操作" width="120">
              <template #default="{ row }">
                <el-button v-if="row.status !== '已签到'" type="primary" size="small" @click="checkIn(row)">签到</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="stage-action">
            <el-button v-if="canOperate" type="primary" size="large" :disabled="!allCheckedIn" @click="nextStage">
              {{ allCheckedIn ? '所有人签到完成，进入开标' : '尚有人员未签到' }}
            </el-button>
          </div>
        </div>

        <!-- 阶段2：开标启动 -->
        <div v-if="currentStage === 1" class="stage-content">
          <h3>开标启动</h3>
          <p class="tip">招标人宣读开标纪律并确认投标人名单</p>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="项目名称">XX市轨道交通设备采购项目</el-descriptions-item>
            <el-descriptions-item label="标段">标段一：主设备</el-descriptions-item>
            <el-descriptions-item label="投标人数量">3 家</el-descriptions-item>
            <el-descriptions-item label="开标时间">2026-07-08 15:00</el-descriptions-item>
          </el-descriptions>
          <div class="stage-action">
            <el-button v-if="canOperate" @click="prevStage">返回</el-button>
            <el-button v-if="canOperate" type="primary" size="large" @click="nextStage">启动解密</el-button>
          </div>
        </div>

        <!-- 阶段3：文件解密 -->
        <div v-if="currentStage === 2" class="stage-content">
          <h3>投标文件解密</h3>
          <p class="tip">各投标人使用各自 CA 私钥解密投标文件；解密失败可视为废标</p>
          <el-table :data="bidders" style="width: 100%">
            <el-table-column prop="name" label="投标人" />
            <el-table-column prop="files" label="文件数量" width="100" />
            <el-table-column prop="status" label="解密状态" width="140">
              <template #default="{ row }">
                <StatusTag :label="row.status" :status="row.status === '已解密' ? 'completed' : 'pending'" />
              </template>
            </el-table-column>
            <el-table-column prop="time" label="解密时间" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button v-if="row.status !== '已解密' && canDecrypt(row)" type="primary" size="small" @click="decrypt(row)">解密</el-button>
                <span v-else-if="row.status === '已解密'" class="text-success">已解密</span>
                <span v-else class="text-muted">待解密</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="stage-action">
            <el-button v-if="canOperate" @click="prevStage">返回</el-button>
            <el-button v-if="canOperate" type="primary" size="large" :disabled="!allDecrypted" @click="nextStage">
              {{ allDecrypted ? '解密完成，进入唱标' : '尚有投标文件未解密' }}
            </el-button>
          </div>
        </div>

        <!-- 阶段4：唱标公示 -->
        <div v-if="currentStage === 3" class="stage-content">
          <h3>唱标公示</h3>
          <p class="tip">按递交文件顺序公开投标报价与工期等核心信息</p>
          <el-table :data="bids" style="width: 100%">
            <el-table-column prop="rank" label="序号" width="80" />
            <el-table-column prop="name" label="投标人" />
            <el-table-column prop="price" label="投标报价（万元）" width="160" />
            <el-table-column prop="delivery" label="交货期" width="140" />
            <el-table-column prop="quality" label="质保期" width="120" />
          </el-table>
          <div class="stage-action">
            <el-button v-if="canOperate" @click="prevStage">返回</el-button>
            <el-button v-if="canOperate" type="primary" size="large" @click="finishOpening">唱标结束</el-button>
          </div>
        </div>

        <!-- 阶段5：开标结束 -->
        <div v-if="currentStage === 4" class="stage-content">
          <el-result icon="success" title="开标结束" sub-title="开标记录已生成，可进入评标环节">
            <template #extra>
              <el-button v-if="canOperate" type="primary" @click="goEvaluate">进入评标大厅</el-button>
              <el-button v-if="canOperate" @click="currentStage = 0">重新演示</el-button>
            </template>
          </el-result>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useRole } from '../composables/useRole.js'
import StatusTag from '../components/StatusTag.vue'

const router = useRouter()
const { role, roleName } = useRole()

const currentStage = ref(0)
const openingFinished = ref(false)

// 主持人：招标人/招标代理可操作开标流程；监督人员只读；投标人只能解密
const canOperate = computed(() => ['tenderee', 'agent'].includes(role.value))
const roleTagType = computed(() => canOperate.value ? 'warning' : 'info')

const attendees = ref([
  { role: '招标人', name: '张三', status: '已签到', time: '2026-07-08 14:50' },
  { role: '招标代理', name: '李四', status: '已签到', time: '2026-07-08 14:52' },
  { role: '投标人', name: 'A科技有限公司', status: '未签到', time: '-' },
  { role: '投标人', name: 'B实业有限公司', status: '未签到', time: '-' },
  { role: '监督人', name: '王监督', status: '未签到', time: '-' }
])

const bidders = ref([
  { name: 'A科技有限公司', files: 3, status: '未解密', time: '-' },
  { name: 'B实业有限公司', files: 3, status: '未解密', time: '-' },
  { name: 'C股份有限公司', files: 3, status: '未解密', time: '-' }
])

const bids = ref([
  { rank: 1, name: 'A科技有限公司', price: 820, delivery: '60天', quality: '3年' },
  { rank: 2, name: 'B实业有限公司', price: 845, delivery: '55天', quality: '2年' },
  { rank: 3, name: 'C股份有限公司', price: 798, delivery: '65天', quality: '3年' }
])

const allCheckedIn = computed(() => attendees.value.every(a => a.status === '已签到'))
const allDecrypted = computed(() => bidders.value.every(b => b.status === '已解密'))

function canDecrypt(row) {
  // 演示环境：投标人只能解密自己的；主持人可代演示解密
  if (role.value === 'bidder') {
    return row.name === 'A科技有限公司'
  }
  return canOperate.value
}

const checkIn = (row) => {
  row.status = '已签到'
  row.time = new Date().toLocaleString()
  ElMessage.success(`${row.name} 签到成功`)
}

const decrypt = (row) => {
  row.status = '已解密'
  row.time = new Date().toLocaleString()
  ElMessage.success(`${row.name} 投标文件解密成功`)
}

const nextStage = () => {
  if (currentStage.value < 4) {
    currentStage.value++
  }
}

const prevStage = () => {
  if (currentStage.value > 0) {
    currentStage.value--
  }
}

const finishOpening = () => {
  openingFinished.value = true
  nextStage()
  ElMessage.success('唱标结束，开标记录已生成')
}

const refresh = () => {
  ElMessage.success('状态已刷新')
}

const goEvaluate = () => {
  router.push('/admin/evaluation-hall')
}
</script>

<style scoped>
.opening-hall {
  max-width: 1100px;
  margin: 0 auto;
}

.hall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hall-header h2 {
  margin: 0;
}

.subtitle {
  color: #666;
  margin: 8px 0 0;
}

.hall-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stage-panel {
  margin-top: 30px;
  padding: 20px;
  background: #f9fafc;
  border-radius: 8px;
}

.stage-content h3 {
  margin-bottom: 8px;
}

.tip {
  color: #666;
  margin-bottom: 16px;
}

.stage-action {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.text-success {
  color: #67C23A;
  font-size: 14px;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}
</style>
