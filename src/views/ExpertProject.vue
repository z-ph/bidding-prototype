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
            <StatusTag :label="submitLocked ? '已提交锁定' : '评标中'" :status="submitLocked ? 'completed' : 'processing'" />
            <el-button v-if="!submitLocked" type="primary" plain :icon="QuestionFilled" @click="startTour">评标引导</el-button>
            <el-button v-if="!submitLocked" type="primary" @click="submitAll">提交我的评分</el-button>
            <el-button v-else type="success" disabled>已提交</el-button>
          </div>
        </div>
      </template>

      <el-steps id="expert-steps" :active="activeStep" finish-status="success" simple style="margin-bottom: 24px">
        <el-step title="回避声明" />
        <el-step title="专家签到" />
        <el-step title="推选组长" />
        <el-step title="查阅资料" />
        <el-step title="在线评分" />
        <el-step title="电子签名" />
      </el-steps>

      <div class="step-panel">
        <!-- 步骤0：回避声明 -->
        <div v-if="activeStep === 0" class="step-content">
          <h3>回避声明与评标纪律</h3>
          <p class="tip">请确认与投标人不存在利害关系，并承诺遵守评标纪律。</p>
          <el-card shadow="never" class="declare-card">
            <p>1. 本人与本次招标项目的投标人及其利害关系人不存在任何利害关系；</p>
            <p>2. 本人将严格按照招标文件和评标办法独立、客观、公正地进行评审；</p>
            <p>3. 本人不会泄露评标过程中的任何商业秘密和投标人的保密信息。</p>
          </el-card>
          <el-checkbox v-model="declared" style="margin-top: 16px">我已阅读并遵守上述回避声明和评标纪律</el-checkbox>
          <div class="stage-action">
            <el-button type="primary" size="large" :disabled="!declared" @click="activeStep++">
              {{ declared ? '下一步：专家签到' : '请先勾选回避声明' }}
            </el-button>
          </div>
        </div>

        <!-- 步骤1：专家签到 -->
        <div v-if="activeStep === 1" class="step-content">
          <h3>专家签到</h3>
          <p class="tip">请确认身份信息并完成在线签到，评标开始前需全部专家签到完毕。</p>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="项目名称">XX市轨道交通设备采购项目</el-descriptions-item>
            <el-descriptions-item label="评标地点">线上评标大厅</el-descriptions-item>
            <el-descriptions-item label="专家姓名">专家甲</el-descriptions-item>
            <el-descriptions-item label="专业领域">电子信息</el-descriptions-item>
          </el-descriptions>
          <div class="stage-action">
            <el-button @click="activeStep--">返回</el-button>
            <el-button type="primary" size="large" @click="checkIn">完成签到</el-button>
          </div>
        </div>

        <!-- 步骤2：推选组长 -->
        <div v-if="activeStep === 2" class="step-content">
          <h3>推选评标组长</h3>
          <p class="tip">评标委员会成员可自荐或推选组长，组长负责汇总评分和生成报告。</p>
          <el-table :data="experts" style="width: 100%">
            <el-table-column prop="name" label="专家姓名" />
            <el-table-column prop="field" label="专业领域" />
            <el-table-column prop="status" label="签到状态" />
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button type="primary" size="small" :disabled="row.isLeader" @click="voteLeader(row)">
                  {{ row.isLeader ? '已当选组长' : '推选为组长' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="stage-action">
            <el-button @click="activeStep--">返回</el-button>
            <el-button type="primary" size="large" :disabled="!hasLeader" @click="activeStep++">
              {{ hasLeader ? '下一步：查阅资料' : '请先推选组长' }}
            </el-button>
          </div>
        </div>

        <!-- 步骤3：查阅资料 -->
        <div v-if="activeStep === 3" class="step-content">
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
            <el-checkbox v-model="docsRead" style="margin-right: 12px">我已查阅全部投标资料</el-checkbox>
            <el-button type="primary" size="large" :disabled="!docsRead" @click="activeStep++">我已查阅，开始评分</el-button>
          </div>
        </div>

        <!-- 步骤4：在线评分 -->
        <div v-if="activeStep === 4" class="step-content">
          <h3>在线评分</h3>
          <p class="tip">请按评分项独立打分，每个投标人满分 100 分（商务 30 + 技术 40 + 价格 30）。</p>
          <el-tabs type="border-card">
            <el-tab-pane v-for="b in bidders" :key="b.name" :label="b.name">
              <el-form :model="b" label-width="120px">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="商务标">
                      <el-input-number v-model="b.business" :min="0" :max="30" :disabled="submitLocked" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="技术标">
                      <el-input-number v-model="b.tech" :min="0" :max="40" :disabled="submitLocked" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="价格标">
                      <el-input-number v-model="b.price" :min="0" :max="30" :disabled="submitLocked" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="评审意见">
                  <el-input v-model="b.comment" type="textarea" :rows="3" placeholder="请填写评审意见" :disabled="submitLocked" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
          <div class="stage-action">
            <el-button @click="activeStep--">返回</el-button>
            <el-button type="primary" size="large" :disabled="!allScored || submitLocked" @click="activeStep++">
              {{ submitLocked ? '已锁定' : (allScored ? '提交评分并签名' : '请完成所有评分') }}
            </el-button>
          </div>
        </div>

        <!-- 步骤5：电子签名 -->
        <div v-if="activeStep === 5" class="step-content">
          <h3>电子签名确认</h3>
          <p class="tip">请使用 CA 证书对评分结果和评标报告进行电子签名，签名后不可修改。</p>
          <el-card class="sign-area" shadow="never" :class="{ signed: signed }">
            <div class="sign-placeholder" @click="doSign">
              <el-icon :size="48" :color="signed ? '#67C23A' : '#409EFF'"><EditPen /></el-icon>
              <p>{{ signed ? '电子签名已完成' : '点击此处进行电子签名' }}</p>
              <p v-if="signed" class="sign-time">签名时间：{{ signTime }}</p>
            </div>
          </el-card>
          <div class="stage-action">
            <el-button @click="activeStep--" :disabled="submitLocked">返回修改</el-button>
            <el-button type="primary" size="large" :disabled="!signed || submitLocked" @click="finish">
              {{ submitLocked ? '已完成提交' : '完成签名并提交' }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { Document, EditPen, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusTag from '../components/StatusTag.vue'

const activeStep = ref(0)
const declared = ref(false)
const docsRead = ref(false)
const signed = ref(false)
const signTime = ref('')
const submitLocked = ref(false)

const experts = ref([
  { name: '专家甲', field: '电子信息', status: '已签到', isLeader: false },
  { name: '专家乙', field: '机械设备', status: '已签到', isLeader: false },
  { name: '专家丙', field: '工程造价', status: '已签到', isLeader: false }
])

const hasLeader = computed(() => experts.value.some(e => e.isLeader))

const bidders = reactive([
  { name: 'A科技有限公司', business: 25, tech: 32, price: 26, comment: '' },
  { name: 'B实业有限公司', business: 24, tech: 30, price: 25, comment: '' },
  { name: 'C股份有限公司', business: 27, tech: 35, price: 28, comment: '' }
])

const allScored = computed(() => {
  return bidders.every(b =>
    b.business !== null && b.business !== undefined &&
    b.tech !== null && b.tech !== undefined &&
    b.price !== null && b.price !== undefined &&
    b.comment.trim() !== ''
  )
})

const checkIn = () => {
  ElMessage.success('签到成功')
  activeStep.value++
}

const voteLeader = (row) => {
  experts.value.forEach(e => { e.isLeader = false })
  row.isLeader = true
  ElMessage.success(`已推选 ${row.name} 为评标组长`)
}

const viewDoc = (name) => {
  ElMessage.success(`在线查阅：${name}`)
}

const doSign = () => {
  if (submitLocked.value) return
  signed.value = true
  signTime.value = new Date().toLocaleString()
  ElMessage.success('电子签名完成')
}

const submitAll = () => {
  if (!allScored.value) {
    ElMessage.warning('请完成所有投标人的评分和评审意见')
    return
  }
  if (!signed.value) {
    ElMessage.warning('请先完成电子签名')
    return
  }
  ElMessageBox.confirm('提交后评分结果将锁定，无法修改，是否继续？', '确认提交', {
    confirmButtonText: '确认提交',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    submitLocked.value = true
    ElMessage.success('评分已提交，结果已锁定')
  })
}

const finish = () => {
  if (!signed.value) {
    ElMessage.warning('请先完成电子签名')
    return
  }
  submitAll()
}

const startTour = () => {
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    overlayColor: 'rgba(0, 21, 41, 0.75)',
    steps: [
      {
        element: '#expert-steps',
        popover: {
          title: '评标流程',
          description: '评标共分为 6 步：回避声明 → 专家签到 → 推选组长 → 查阅资料 → 在线评分 → 电子签名。',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.step-content',
        popover: {
          title: '当前步骤',
          description: '按提示完成当前步骤操作，完成后点击底部按钮进入下一步。',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.hall-meta .el-button--primary:not(.is-plain)',
        popover: {
          title: '提交评分',
          description: '所有专家评分并签名后，点击此处提交评标结果。',
          side: 'bottom',
          align: 'center'
        }
      }
    ]
  })
  driverObj.drive()
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

.declare-card p {
  margin: 8px 0;
  line-height: 1.6;
  color: #333;
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

.sign-area.signed {
  background: #f0f9eb;
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

.sign-area.signed .sign-placeholder {
  border-color: #67C23A;
}

.sign-time {
  color: #67C23A;
  font-size: 12px;
  margin-top: 8px;
}

.stage-action {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
