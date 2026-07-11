<template>
  <div class="bid-download">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>招标文件下载</span>
          <el-tag type="success">项目：XX市轨道交通设备采购项目</el-tag>
        </div>
      </template>
      <el-steps :active="2" finish-status="success" simple style="margin-bottom: 24px">
        <el-step title="报名通过" />
        <el-step title="缴纳文件费" />
        <el-step title="下载招标文件" />
        <el-step title="编制投标文件" />
        <el-step title="上传投标文件" />
      </el-steps>
      <el-alert
        title="下载后请使用投标文件制作工具离线编制，开标前务必完成签章和加密。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-table :data="files" style="width: 100%">
        <el-table-column prop="name" label="文件名称" min-width="300" />
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="preview(row)">预览</el-button>
            <el-button type="primary" size="small" @click="download(row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="next-step">
        <span>文件已获取？</span>
        <el-button type="primary" @click="$router.push('/admin/bid-quote')">去填写报价</el-button>
        <el-button @click="$router.push('/admin/bid-upload')">去上传投标文件</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const files = ref([
  { name: 'XX市轨道交通设备采购项目-招标文件.pdf', version: 'V1.0', updateTime: '2026-07-01 10:00', size: '5.2 MB' },
  { name: 'XX市轨道交通设备采购项目-澄清说明（一）.pdf', version: 'V1.1', updateTime: '2026-07-05 16:30', size: '0.8 MB' },
  { name: '图纸及技术参数.zip', version: '-', updateTime: '2026-07-01 10:00', size: '120 MB' },
])

const preview = (row) => {
  ElMessage.success(`在线预览：${row.name}`)
}

const download = (row) => {
  ElMessage.success(`开始下载：${row.name}`)
}
</script>

<style scoped>
.bid-download {
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.next-step {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
