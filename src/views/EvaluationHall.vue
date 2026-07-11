<template>
  <div class="evaluation-hall">
    <el-card>
      <template #header>
        <div class="hall-header">
          <div>
            <h2>评标大厅</h2>
            <p class="subtitle">XX市轨道交通设备采购项目 · 标段一：主设备</p>
          </div>
          <div class="hall-meta">
            <el-tag size="large" type="success">评标中</el-tag>
            <el-button type="primary" @click="submitResult">提交评标结果</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="评分汇总" name="summary">
          <el-table :data="scoreSummary" style="width: 100%" border>
            <el-table-column prop="rank" label="排名" width="80" />
            <el-table-column prop="name" label="投标人" min-width="200" />
            <el-table-column prop="business" label="商务标（30）" width="120" />
            <el-table-column prop="tech" label="技术标（40）" width="120" />
            <el-table-column prop="price" label="价格标（30）" width="120" />
            <el-table-column prop="total" label="总分" width="100">
              <template #default="{ row }">
                <strong style="color: #409EFF">{{ row.total }}</strong>
              </template>
            </el-table-column>
            <el-table-column prop="recommend" label="推荐意见" width="120">
              <template #default="{ row }">
                <el-tag :type="row.recommend === '推荐中标' ? 'success' : 'info'">{{ row.recommend }}</el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="chart-mock">
            <h4>得分对比</h4>
            <div class="bars">
              <div v-for="item in scoreSummary" :key="item.name" class="bar-item">
                <span class="bar-name">{{ item.name }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: item.total + '%' }"></div>
                </div>
                <span class="bar-value">{{ item.total }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="专家评审" name="expert">
          <el-table :data="expertScores" style="width: 100%" border>
            <el-table-column prop="expert" label="专家" width="120" />
            <el-table-column prop="bidder" label="投标人" />
            <el-table-column prop="business" label="商务" width="100" />
            <el-table-column prop="tech" label="技术" width="100" />
            <el-table-column prop="price" label="价格" width="100" />
            <el-table-column prop="comment" label="评审意见" min-width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已提交' ? 'success' : 'warning'">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="否决投标" name="reject">
          <el-empty v-if="rejected.length === 0" description="暂无否决投标" />
          <el-alert
            v-for="(item, idx) in rejected"
            :key="idx"
            :title="`${item.name}：${item.reason}`"
            type="error"
            :closable="false"
            style="margin-bottom: 12px"
          />
        </el-tab-pane>

        <el-tab-pane label="评标报告" name="report">
          <el-form :model="reportForm" label-position="top">
            <el-form-item label="评标委员会意见">
              <el-input v-model="reportForm.opinion" type="textarea" :rows="6" placeholder="汇总评标委员会整体意见..." />
            </el-form-item>
            <el-form-item label="推荐中标候选人">
              <el-radio-group v-model="reportForm.recommend">
                <el-radio v-for="item in scoreSummary" :key="item.name" :label="item.name">{{ item.name }}（{{ item.total }}分）</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveReport">保存报告</el-button>
              <el-button @click="exportReport">导出 PDF</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('summary')

const scoreSummary = ref([
  { rank: 1, name: 'C股份有限公司', business: 28, tech: 36, price: 29, total: 93, recommend: '推荐中标' },
  { rank: 2, name: 'A科技有限公司', business: 27, tech: 34, price: 28, total: 89, recommend: '备选' },
  { rank: 3, name: 'B实业有限公司', business: 26, tech: 31, price: 27, total: 84, recommend: '备选' },
])

const expertScores = ref([
  { expert: '专家甲', bidder: 'C股份有限公司', business: 28, tech: 36, price: 29, comment: '技术方案完善，价格合理', status: '已提交' },
  { expert: '专家乙', bidder: 'A科技有限公司', business: 27, tech: 34, price: 28, comment: '资质优良，报价略高', status: '已提交' },
  { expert: '专家丙', bidder: 'B实业有限公司', business: 26, tech: 31, price: 27, comment: '方案基本满足要求', status: '待提交' },
])

const rejected = ref([
  { name: 'D有限公司', reason: '未按要求加盖电子签章，投标文件无效。' },
])

const reportForm = reactive({
  opinion: '经评标委员会评审，C股份有限公司综合得分最高，技术方案满足招标文件要求，报价合理，推荐为中标候选人。',
  recommend: 'C股份有限公司',
})

const saveReport = () => {
  ElMessage.success('评标报告已保存')
}

const exportReport = () => {
  ElMessage.success('评标报告 PDF 导出中...')
}

const submitResult = () => {
  ElMessage.success('评标结果已提交，进入中标公示流程')
}
</script>

<style scoped>
.evaluation-hall {
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

.chart-mock {
  margin-top: 24px;
  padding: 20px;
  background: #f9fafc;
  border-radius: 8px;
}

.chart-mock h4 {
  margin-bottom: 16px;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-name {
  width: 160px;
  font-size: 14px;
  color: #333;
}

.bar-track {
  flex: 1;
  height: 20px;
  background: #e4e7ed;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 10px;
  transition: width 0.5s;
}

.bar-value {
  width: 40px;
  text-align: right;
  font-weight: bold;
}
</style>
