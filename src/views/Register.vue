<template>
  <div class="register-page">
    <div class="register-container">
      <h2>平台注册</h2>
      <el-tabs v-model="form.role" type="border-card">
        <el-tab-pane label="供应商注册" name="bidder">
          <el-form :model="form" label-position="top">
            <el-form-item label="企业名称" required>
              <el-input v-model="form.companyName" placeholder="请输入企业全称" />
            </el-form-item>
            <el-form-item label="统一社会信用代码" required>
              <el-input v-model="form.creditCode" placeholder="请输入统一社会信用代码" />
            </el-form-item>
            <el-form-item label="联系人" required>
              <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
            </el-form-item>
            <el-form-item label="手机号" required>
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="登录密码" required>
              <el-input v-model="form.password" type="password" placeholder="请设置登录密码" />
            </el-form-item>
            <el-form-item label="资质附件">
              <el-upload action="#" :auto-upload="false" :file-list="fileList" multiple>
                <el-button type="primary">上传营业执照等资质</el-button>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="form.agreed">我已阅读并同意《平台用户协议》</el-checkbox>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="专家注册" name="expert">
          <el-form :model="form" label-position="top">
            <el-form-item label="姓名" required>
              <el-input v-model="form.contactName" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="身份证号" required>
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
            <el-form-item label="专业领域" required>
              <el-input v-model="form.expertField" placeholder="例如：电子信息、机械设备" />
            </el-form-item>
            <el-form-item label="手机号" required>
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="登录密码" required>
              <el-input v-model="form.password" type="password" placeholder="请设置登录密码" />
            </el-form-item>
            <el-form-item label="资质附件">
              <el-upload action="#" :auto-upload="false" :file-list="fileList" multiple>
                <el-button type="primary">上传职称证书等</el-button>
              </el-upload>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div class="actions">
        <el-button type="primary" size="large" style="width: 100%" @click="submit">提交注册</el-button>
        <div class="login-link">
          已有账号？<el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  role: 'bidder',
  companyName: '',
  creditCode: '',
  contactName: '',
  phone: '',
  password: '',
  idCard: '',
  expertField: '',
  agreed: false
})

const fileList = ref([])

const submit = () => {
  alert('注册信息已提交，等待平台审核')
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #001529 0%, #003366 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.register-container {
  width: 520px;
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.register-container h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #001529;
}

.actions {
  margin-top: 24px;
}

.login-link {
  margin-top: 16px;
  text-align: center;
  color: #666;
}
</style>
