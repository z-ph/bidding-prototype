<template>
  <div class="supervisor-hall">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>监督大厅</span>
          <div class="header-tags">
            <el-tag type="danger" effect="dark" size="large">监督模式：只读</el-tag>
            <el-tag type="info">监督人员：王监督</el-tag>
          </div>
        </div>
      </template>

      <el-alert
        title="您当前以监督人员身份进入，可查看开标、评标全过程及操作日志，但不可修改任何业务数据。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="开标监督" name="opening">
          <el-steps :active="4" finish-status="success" simple>
            <el-step title="签到" />
            <el-step title="启动" />
            <el-step title="解密" />
            <el-step title="唱标" />
            <el-step title="结束" />
          </el-steps>
          <h3>签到情况</h3>
          <el-table :data="openingAttendees" style="width: 100%" border>
            <el-table-column prop="role" label="角色" />
            <el-table-column prop="name" label="姓名/企业" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <StatusTag :label="row.status" :status="row.status === '已签到' ? 'completed' : 'pending'" />
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" />
          </el-table>
          <h3>唱标结果</h3>
          <el-table :data="openingBids" style="width: 100%" border>
            <el-table-column prop="name" label="投标人" />
            <el-table-column prop="price" label="投标报价（万元）" />
            <el-table-column prop="delivery" label="交货期" />
            <el-table-column prop="quality" label="质保期" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="评标监督" name="evaluation">
          <h3>评标委员会</h3>
          <el-table :data="evaluationExperts" style="width: 100%" border>
            <el-table-column prop="name" label="专家" />
            <el-table-column prop="field" label="专业" />
            <el-table-column prop="status" label="签到状态">
              <template #default="{ row }">
                <StatusTag :label="row.status" :status="row.status === '已签到' ? 'completed' : 'pending'" />
              </template>
            </el-table-column>
            <el-table-column prop="scoreStatus" label="评分状态">
              <template #default="{ row }">
                <StatusTag :label="row.scoreStatus" :status="row.scoreStatus === '已提交' ? 'completed' : 'processing'" />
              </template>
            </el-table-column>
          </el-table>
          <h3>评分汇总</h3>
          <el-table :data="evaluationScores" style="width: 100%" border>
            <el-table-column prop="name" label="投标人" />
            <el-table-column prop="business" label="商务" />
            <el-table-column prop="tech" label="技术" />
            <el-table-column prop="price" label="价格" />
            <el-table-column prop="total" label="总分" />
            <el-table-column prop="recommend" label="推荐意见" />
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <el-divider />

      <div class="supervisor-actions">
        <el-card shadow="never" class="action-card">
          <template #header>
            <span>监督专属操作</span>
          </template>
          <el-form :model="superviseForm" label-position="top">
            <el-form-item label="异常/意见记录">
              <el-input
                v-model="superviseForm.comment"
                type="textarea"
                :rows="3"
                placeholder="如发现异常情况，请在此记录监督意见"
              />
            </el-form-item>
          </el-form>
          <div class="action-btns">
            <el-button type="warning" @click="recordAbnormal">记录异常</el-button>
            <el-button type="primary" @click="submitComment">提交监督意见</el-button>
            <el-button @click="$router.push('/admin/supervisor-logs')">查看完整操作日志</el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import StatusTag from '../components/StatusTag.vue'

const activeTab = ref('opening')

const superviseForm = ref({
  comment: ''
})

const openingAttendees = ref([
  { role: '招标人', name: '张三', status: '已签到', time: '2026-07-08 14:50' },
  { role: '招标代理', name: '李四', status: '已签到', time: '2026-07-08 14:52' },
  { role: '投标人', name: 'A科技有限公司', status: '已签到', time: '2026-07-08 14:55' },
  { role: '监督人', name: '王监督', status: '已签到', time: '2026-07-08 14:53' }
])

const openingBids = ref([
  { name: 'A科技有限公司', price: 820, delivery: '60天', quality: '3年' },
  { name: 'B实业有限公司', price: 845, delivery: '55天', quality: '2年' },
  { name: 'C股份有限公司', price: 798, delivery: '65天', quality: '3年' }
])

const evaluationExperts = ref([
  { name: '专家甲', field: '电子信息', status: '已签到', scoreStatus: '已提交' },
  { name: '专家乙', field: '机械设备', status: '已签到', scoreStatus: '已提交' },
  { name: '专家丙', field: '工程造价', status: '已签到', scoreStatus: '待提交' }
])

const evaluationScores = ref([
  { name: 'C股份有限公司', business: 28, tech: 36, price: 29, total: 93, recommend: '推荐中标' },
  { name: 'A科技有限公司', business: 27, tech: 34, price: 28, total: 89, recommend: '备选' },
  { name: 'B实业有限公司', business: 26, tech: 31, price: 27, total: 84, recommend: '备选' }
])

const recordAbnormal = () => {
  if (!superviseForm.value.comment.trim()) {
    ElMessage.warning('请先填写异常描述')
    return
  }
  ElMessage.warning('异常记录已保存，将同步至日志')
  superviseForm.value.comment = ''
}

const submitComment = () => {
  if (!superviseForm.value.comment.trim()) {
    ElMessage.warning('请先填写监督意见')
    return
  }
  ElMessage.success('监督意见已提交')
  superviseForm.value.comment = ''
}
</script>

<style scoped>
.supervisor-hall {
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.header-tags {
  display: flex;
  gap: 12px;
}

.supervisor-actions {
  margin-top: 10px;
}

.action-card {
  background: #fafafa;
}

.action-btns {
  display: flex;
  justify-content: center;
  gap: 16px;
}

h3 {
  margin: 20px 0 12px;
  font-size: 16px;
}
</style>
