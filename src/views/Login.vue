<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <h1>招投标采购平台</h1>
        <p>全流程电子化 · 多角色协同 · 安全合规</p>
        <div class="features">
          <div class="feature"><el-icon><Check /></el-icon> 在线招标发标</div>
          <div class="feature"><el-icon><Check /></el-icon> 电子投标加密</div>
          <div class="feature"><el-icon><Check /></el-icon> 线上开标评标</div>
          <div class="feature"><el-icon><Check /></el-icon> 合同归档管理</div>
        </div>
      </div>
      <div class="login-right">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="账号登录" name="account">
            <el-form :model="form" label-position="top">
              <el-form-item label="角色">
                <el-select v-model="form.role" placeholder="选择角色" style="width: 100%">
                  <el-option label="招标人" value="tenderee" />
                  <el-option label="招标代理" value="agent" />
                  <el-option label="投标人/供应商" value="bidder" />
                  <el-option label="评标专家" value="expert" />
                  <el-option label="监督人员" value="supervisor" />
                  <el-option label="平台管理员" value="admin" />
                </el-select>
              </el-form-item>
              <el-form-item label="账号">
                <el-input v-model="form.account" placeholder="请输入账号" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="form.password" type="password" placeholder="请输入密码" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" style="width: 100%" @click="login">登录</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="CA 登录" name="ca">
            <div class="ca-login">
              <el-icon :size="60" color="#409EFF"><Lock /></el-icon>
              <p>请插入 CA 数字证书 UKey</p>
              <el-button type="primary" @click="caLogin">检测证书并登录</el-button>
              <div class="ca-tips">
                <el-link type="primary">下载 CA 驱动</el-link>
                <span>|</span>
                <el-link type="primary">CA 证书申请</el-link>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="手机登录" name="phone">
            <el-form :model="phoneForm" label-position="top">
              <el-form-item label="手机号">
                <el-input v-model="phoneForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="验证码">
                <el-input v-model="phoneForm.code" placeholder="请输入验证码">
                  <template #append>
                    <el-button @click="sendCode">获取验证码</el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" style="width: 100%" @click="login">登录</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <div class="register-link">
          还没有账号？<el-link type="primary">立即注册</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref('account')

const roleNames = {
  tenderee: '招标人',
  agent: '招标代理',
  bidder: '投标人/供应商',
  expert: '评标专家',
  supervisor: '监督人员',
  admin: '平台管理员'
}

const dashboardMap = {
  tenderee: '/admin/dashboard',
  agent: '/admin/dashboard',
  bidder: '/admin/dashboard',
  expert: '/admin/dashboard',
  supervisor: '/admin/supervisor-hall',
  admin: '/admin/admin-dashboard'
}

const form = ref({
  role: 'tenderee',
  account: 'admin',
  password: '123456'
})

const phoneForm = ref({
  phone: '',
  code: ''
})

const login = () => {
  const role = form.value.role
  localStorage.setItem('bidding-role', role)
  ElMessage.success(`以 ${roleNames[role]} 身份登录成功`)
  router.push(dashboardMap[role])
}

const caLogin = () => {
  const role = form.value.role
  localStorage.setItem('bidding-role', role)
  ElMessage.success('检测到 CA 证书，正在验证...\n（演示环境跳过真实 CA 验证）')
  router.push(dashboardMap[role])
}

const sendCode = () => {
  ElMessage.success('验证码已发送：123456')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #001529 0%, #003366 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 900px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.login-left {
  width: 400px;
  background: #001529;
  color: #fff;
  padding: 60px 40px;
}

.login-left h1 {
  font-size: 32px;
  margin-bottom: 16px;
}

.login-left p {
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 40px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.login-right {
  flex: 1;
  padding: 40px;
}

.ca-login {
  text-align: center;
  padding: 40px 20px;
}

.ca-login p {
  margin: 20px 0;
  color: #666;
}

.ca-tips {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
  color: #ccc;
}

.register-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
}
</style>
