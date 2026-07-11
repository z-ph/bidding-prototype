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
        <div style="text-align: right; margin-bottom: 12px">
          <el-button link :icon="QuestionFilled" @click="startTour">查看登录引导</el-button>
        </div>
        <el-tabs id="login-tabs" v-model="activeTab" type="border-card">
          <el-tab-pane label="账号登录" name="account">
            <el-form :model="form" label-position="top">
              <el-form-item id="login-role" label="角色">
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
                <el-button id="login-submit" type="primary" style="width: 100%" @click="login">登录</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="CA 登录" name="ca">
            <div id="login-ca-panel" class="ca-login">
              <el-icon :size="60" color="#409EFF"><Lock /></el-icon>
              <p>请插入 CA 数字证书 UKey</p>
              <el-button id="login-ca-btn" type="primary" @click="caLogin">检测证书并登录</el-button>
              <div class="ca-tips">
                <el-link type="primary">下载 CA 驱动</el-link>
                <span>|</span>
                <el-link type="primary">CA 证书申请</el-link>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="手机登录" name="phone">
            <el-form id="login-phone-panel" :model="phoneForm" label-position="top">
              <el-form-item label="手机号">
                <el-input v-model="phoneForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="验证码">
                <el-input v-model="phoneForm.code" placeholder="请输入验证码">
                  <template #append>
                    <el-button id="login-phone-code" @click="sendCode">获取验证码</el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button id="login-phone-submit" type="primary" style="width: 100%" @click="login">登录</el-button>
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
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { Check, Lock, QuestionFilled } from '@element-plus/icons-vue'
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

const startTour = () => {
  activeTab.value = 'account'
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    overlayColor: 'rgba(0, 21, 41, 0.75)',
    steps: [
      {
        element: '#login-tabs',
        popover: {
          title: '选择登录方式',
          description: '平台支持账号密码、CA 数字证书、手机验证码三种登录方式，点击标签切换。',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#login-role',
        popover: {
          title: '选择您的角色',
          description: '平台支持招标人、招标代理、投标人、评标专家、监督人员、平台管理员六种角色，登录后进入对应工作台。',
          side: 'right',
          align: 'center'
        },
        onHighlighted: () => { activeTab.value = 'account' }
      },
      {
        element: '#login-submit',
        popover: {
          title: '账号密码登录',
          description: '选择角色并输入账号密码后，点击登录进入工作台。',
          side: 'top',
          align: 'center'
        },
        onHighlighted: () => { activeTab.value = 'account' }
      },
      {
        element: '#login-ca-panel',
        popover: {
          title: 'CA 数字证书登录',
          description: '插入 CA UKey 后，点击“检测证书并登录”完成高安全身份认证。首次使用请下载 CA 驱动或申请证书。',
          side: 'left',
          align: 'center'
        },
        onHighlighted: () => { activeTab.value = 'ca' }
      },
      {
        element: '#login-phone-panel',
        popover: {
          title: '手机验证码登录',
          description: '输入手机号，点击“获取验证码”，输入收到的短信验证码后登录。',
          side: 'left',
          align: 'center'
        },
        onHighlighted: () => { activeTab.value = 'phone' }
      },
      {
        element: '#login-phone-code',
        popover: {
          title: '获取验证码',
          description: '系统会向您的手机发送一条短信验证码，演示环境固定为 123456。',
          side: 'top',
          align: 'center'
        },
        onHighlighted: () => { activeTab.value = 'phone' }
      }
    ]
  })
  driverObj.drive()
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
