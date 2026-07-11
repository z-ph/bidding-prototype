<template>
  <div class="award-confirm">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>确认中标人</span>
          <el-tag type="warning">项目：XX市轨道交通设备采购项目</el-tag>
        </div>
      </template>
      <el-steps :active="2" finish-status="success" simple style="margin-bottom: 24px">
        <el-step title="评标结束" />
        <el-step title="候选人公示" />
        <el-step title="确认中标人" />
        <el-step title="结果公示" />
        <el-step title="发送通知书" />
      </el-steps>
      <el-alert
        title="公示期结束后，招标人在此处确认最终中标人。确认后将进入中标结果公示和中标通知书发送环节。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <h3>中标候选人排名</h3>
      <el-table :data="candidates" style="width: 100%" border>
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="name" label="投标人" min-width="200" />
        <el-table-column prop="total" label="综合得分" width="120" />
        <el-table-column prop="price" label="投标报价（万元）" width="160" />
        <el-table-column prop="recommend" label="评标委员会推荐意见" min-width="200" />
        <el-table-column label="选择" width="120">
          <template #default="{ row }">
            <el-radio v-model="selected" :label="row.name">选择</el-radio>
          </template>
        </el-table-column>
      </el-table>
      <el-form :model="form" label-position="top" style="margin-top: 20px">
        <el-form-item label="定标意见">
          <el-input v-model="form.opinion" type="textarea" :rows="4" placeholder="请填写定标意见..." />
        </el-form-item>
      </el-form>
      <div class="actions">
        <el-button type="primary" size="large" @click="confirm">确认中标人</el-button>
        <el-button size="large" @click="$router.push('/admin/award-notice')">下一步：发送中标通知书</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selected = ref('')

const candidates = ref([
  { rank: 1, name: 'C股份有限公司', total: 93, price: 798, recommend: '综合得分最高，推荐为第一中标候选人' },
  { rank: 2, name: 'A科技有限公司', total: 89, price: 820, recommend: '推荐为第二中标候选人' },
  { rank: 3, name: 'B实业有限公司', total: 84, price: 845, recommend: '推荐为第三中标候选人' },
])

const form = reactive({
  opinion: '经公示无异议，确定第一中标候选人 C股份有限公司 为中标人。'
})

const confirm = () => {
  if (!selected.value) {
    alert('请先选择中标人')
    return
  }
  alert(`已确认中标人：${selected.value}`)
  router.push('/admin/award-notice')
}
</script>

<style scoped>
.award-confirm {
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
