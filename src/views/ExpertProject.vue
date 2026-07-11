<template>
  <div class="expert-project">
    <el-card>
      <template #header>
        <div class="hall-header">
          <div>
            <h2>评标项目</h2>
            <p class="subtitle">XX市轨道交通设备采购项目 · 标段一：主设备</p>
          </div>
          <div class="hall-meta">
            <el-tag type="success">评标中</el-tag>
            <el-button type="primary" @click="submitAll">提交我的评分</el-button>
          </div>
        </div>
      </template>

      <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 24px">
        <el-step title="专家签到" />
        <el-step title="推选组长" />
        <el-step title="查阅资料" />
        <el-step title="在线评分" />
        <el-step title="电子签名" />
      </el-steps>

      <div class="step-panel">
        <div v-if="activeStep === 0" class="step-content">
          <h3>专家签到</h3>
          <p class="tip">请确认身份信息并完成在线签到，评标开始前需全部专家签到完毕。</p>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="项目名称">XX市轨道交通设备采购项目</el-descriptions-item>
            <el-descriptions-item label="评标地点">线上评标大厅</el-descriptions-item>
            <el-descriptions-item label="专家姓名">专家甲</el-descriptions-item>
            <el-descriptions-item label="专业领域">电子信息</el-descriptions-item>
          </el-descriptions>
          <div class="stage-action">
            <el-button type="primary" size="large" @click="activeStep++">完成签到</el-button>
          </div>
        </div>

        <div v-if="activeStep === 1" class="step-content">
          <h3>推选评标组长</h3>
          <p class="tip">评标委员会成员可自荐或推选组长，组长负责汇总评分和生成报告。</p>
          <el-table :data="experts" style="width: 100%">
            <el-table-column prop="name" label="专家姓名" />
            <el-table-column prop="field" label="专业领域" />
            <el-table-column prop="status" label="签到状态" />
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="voteLeader(row)">推选为组长</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="stage-action">
            <el-button @click="activeStep--">返回</el-button>
            <el-button type="primary" size="large" @click="activeStep++">下一步：查阅资料</el-button>
          </div>
        </div>

        <div v-if="activeStep === 2" class="step-content">
          <h3>查阅投标资料</h3>
          <p class="tip">请仔细查阅招标文件、投标文件、开标记录和报价一览表，为评分做准备。</p>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover" class="doc-card" @click="viewDoc('招标文件')">
                <el-icon :size="32" color="#409EFF"><Document /></el-icon>
                <p>招标文件</p>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="doc-card" @click="viewDoc('投标文件')">
                <el-icon :size="32" color="#67C23A"><Document /></el-icon>
                <p>投标文件</p>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="doc-card" @click="viewDoc('开标记录')">
                <el-icon :size="32" color="#E6A23C"><Document /></el-icon>
                <p>开标记录</p>
              </el-card>
            </el-col>
          </el-row>
          <div class="stage-action">
            <el-button @click="activeStep--">返回</el-button>
            <el-button type="primary" size="large" @click="activeStep++">我已查阅，开始评分</el-button>
          </div>
        </div>

        <div v-if="activeStep === 3" class="step-content">
          <h3>在线评分</h3>
          <p class="tip">请按评分项独立打分，每个投标人满分 100 分（商务 30 + 技术 40 + 价格 30）。</p>
          <el-tabs type="border-card">
            <el-tab-pane v-for="b in bidders" :key="b.name" :label="b.name">
              <el-form :model="b" label-width="120px">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="商务标">
                      <el-input-number v-model="b.business" :min="0" :max="30" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="技术标">
                      <el-input-number v-model="b.tech" :min="0" :max="40" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="价格标">
                      <el-input-number v-model="b.price" :min="0" :max="30" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="评审意见">
                  <el-input v-model="b.comment" type="textarea" :rows="3" placeholder="请填写评审意见" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
          <div class="stage-action">
            <el-button @click="activeStep--">返回</el-button>
            <el-button type="primary" size="large" @click="activeStep++">提交评分并签名</el-button>
          </div>
        </div>

        <div v-if="activeStep === 4" class="step-content">
          <h3>电子签名确认</h3>
          <p class="tip">请使用 CA 证书对评分结果和评标报告进行电子签名，签名后不可修改。</p>
          <el-card class="sign-area" shadow="never">
            <div class="sign-placeholder">
              <el-icon :size="48" color="#409EFF"><Edit-Pen /></el-icon>
              <p>点击此处进行电子签名</p>
            </div>
          </el-card>
          <div class="stage-action">
            <el-button @click="activeStep--">返回修改</el-button>
            <el-button type="primary" size="large" @click="finish">完成签名并提交</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Document, EditPen } from '@element-plus/icons-vue'

const activeStep = ref(0)

const experts = ref([
  { name: '专家甲', field: '电子信息', status: '已签到' },
  { name: '专家乙', field: '机械设备', status: '已签到' },
  { name: '专家丙', field: '工程造价', status: '已签到' },
])

const bidders = reactive([
  { name: 'A科技有限公司', business: 25, tech: 32, price: 26, comment: '' },
  { name: 'B实业有限公司', business: 24, tech: 30, price: 25, comment: '' },
  { name: 'C股份有限公司', business: 27, tech: 35, price: 28, comment: '' },
])

const voteLeader = (row) => {
  alert(`已推选 ${row.name} 为评标组长`)
}

const viewDoc = (name) => {
  alert(`在线查阅：${name}`)
}

const submitAll = () => {
  alert('评分已提交')
}

const finish = () => {
  alert('电子签名完成，评标结果已提交')
}
</script>

<style scoped>
.expert-project {
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

.step-content h3 {
  margin-bottom: 8px;
}

.tip {
  color: #666;
  margin-bottom: 16px;
}

.doc-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.doc-card:hover {
  transform: translateY(-4px);
}

.doc-card p {
  margin-top: 8px;
}

.sign-area {
  background: #f9fafc;
}

.sign-placeholder {
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
}

.stage-action {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
