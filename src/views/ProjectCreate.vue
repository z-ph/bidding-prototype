<template>
  <div class="project-create">
    <el-steps :active="activeStep" finish-status="success" simple>
      <el-step title="基本信息" />
      <el-step title="标段设置" />
      <el-step title="供应商要求" />
      <el-step title="提交审核" />
    </el-steps>

    <el-card class="form-card">
      <!-- 步骤1：基本信息 -->
      <div v-if="activeStep === 0">
        <h3>项目基本信息</h3>
        <el-form :model="form" label-width="120px" class="project-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="项目名称" required>
                <el-input v-model="form.name" placeholder="请输入项目名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目编号">
                <el-input v-model="form.code" placeholder="系统自动生成" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="采购方式" required>
                <el-select v-model="form.purchaseMode" placeholder="请选择" style="width: 100%">
                  <el-option label="公开招标" value="open" />
                  <el-option label="邀请招标" value="invitation" />
                  <el-option label="公开询比价" value="inquiry" />
                  <el-option label="单一来源" value="single" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目预算" required>
                <el-input v-model="form.budget" placeholder="请输入预算金额">
                  <template #append>万元</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="报名开始" required>
                <el-date-picker v-model="form.registerStart" type="datetime" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报名截止" required>
                <el-date-picker v-model="form.registerEnd" type="datetime" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开标时间" required>
                <el-date-picker v-model="form.openTime" type="datetime" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="评标地点">
                <el-input v-model="form.evalLocation" placeholder="线上评标/线下地点" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="项目简介">
            <el-input v-model="form.intro" type="textarea" :rows="4" placeholder="描述项目背景、范围、目标等" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2：标段设置 -->
      <div v-if="activeStep === 1">
        <div class="section-header">
          <h3>标段/包件设置</h3>
          <el-button type="primary" @click="addPackage">添加标段</el-button>
        </div>
        <el-empty v-if="form.packages.length === 0" description="暂无标段，请添加" />
        <el-card v-for="(pkg, idx) in form.packages" :key="idx" class="package-card" shadow="never">
          <template #header>
            <div class="package-header">
              <span>标段 {{ idx + 1 }}：{{ pkg.name || '未命名标段' }}</span>
              <el-button link type="danger" @click="removePackage(idx)">删除</el-button>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="标段名称">
                <el-input v-model="pkg.name" placeholder="例如：第一标段" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="标段编号">
                <el-input v-model="pkg.code" placeholder="例如：B1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="预算金额">
                <el-input v-model="pkg.budget" placeholder="万元" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="标段内容">
            <el-input v-model="pkg.content" type="textarea" :rows="2" placeholder="描述本标段采购内容" />
          </el-form-item>
        </el-card>
      </div>

      <!-- 步骤3：供应商要求 -->
      <div v-if="activeStep === 2">
        <h3>供应商资格要求</h3>
        <el-form :model="form" label-width="120px">
          <el-form-item label="资质要求">
            <el-checkbox-group v-model="form.qualifications">
              <el-checkbox label="营业执照" />
              <el-checkbox label="税务登记证" />
              <el-checkbox label="组织机构代码证" />
              <el-checkbox label="ISO9001认证" />
              <el-checkbox label="安全生产许可证" />
              <el-checkbox label="特定行业资质" />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="业绩要求">
            <el-input v-model="form.performance" type="textarea" :rows="3" placeholder="近3年类似项目业绩要求" />
          </el-form-item>
          <el-form-item label="财务要求">
            <el-input v-model="form.financial" placeholder="例如：注册资本不低于100万" />
          </el-form-item>
          <el-form-item label="信誉要求">
            <el-input v-model="form.credit" type="textarea" :rows="2" placeholder="无重大违法记录、未被列入失信名单等" />
          </el-form-item>
          <el-form-item label="是否允许联合体">
            <el-radio-group v-model="form.allowConsortium">
              <el-radio :label="true">允许</el-radio>
              <el-radio :label="false">不允许</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤4：提交审核 -->
      <div v-if="activeStep === 3">
        <el-result icon="success" title="项目信息填写完成" sub-title="请确认以下信息无误后提交审核">
          <template #extra>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="项目名称">{{ form.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="采购方式">{{ form.purchaseMode || '-' }}</el-descriptions-item>
              <el-descriptions-item label="项目预算">{{ form.budget || '-' }} 万元</el-descriptions-item>
              <el-descriptions-item label="开标时间">{{ formatTime(form.openTime) }}</el-descriptions-item>
              <el-descriptions-item label="标段数量">{{ form.packages.length }} 个</el-descriptions-item>
              <el-descriptions-item label="资质要求">{{ form.qualifications.join('、') || '-' }}</el-descriptions-item>
            </el-descriptions>
            <div style="margin-top: 20px">
              <el-button type="primary" @click="submit">提交审核</el-button>
              <el-button @click="activeStep = 0">返回修改</el-button>
            </div>
          </template>
        </el-result>
      </div>

      <div class="step-actions" v-if="activeStep < 3">
        <el-button v-if="activeStep > 0" @click="activeStep--">上一步</el-button>
        <el-button type="primary" @click="activeStep++">下一步</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeStep = ref(0)

const form = reactive({
  name: '',
  code: 'ZB20260708001',
  purchaseMode: 'open',
  budget: '',
  registerStart: '',
  registerEnd: '',
  openTime: '',
  evalLocation: '线上评标大厅',
  intro: '',
  packages: [],
  qualifications: ['营业执照'],
  performance: '',
  financial: '',
  credit: '',
  allowConsortium: false,
})

const addPackage = () => {
  form.packages.push({
    name: '',
    code: `B${form.packages.length + 1}`,
    budget: '',
    content: ''
  })
}

const removePackage = (idx) => {
  form.packages.splice(idx, 1)
}

const formatTime = (t) => {
  if (!t) return '-'
  return new Date(t).toLocaleString()
}

const submit = () => {
  ElMessage.success('项目已提交审核，即将跳转项目列表')
  router.push('/admin/projects')
}
</script>

<style scoped>
.project-create {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card {
  min-height: 500px;
}

.project-form {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.package-card {
  margin-bottom: 16px;
  background: #fafafa;
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}
</style>
