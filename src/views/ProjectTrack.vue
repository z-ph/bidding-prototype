<template>
  <div class="project-track">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目跟踪</span>
          <el-select v-model="projectId" placeholder="选择项目" style="width: 260px">
            <el-option label="XX市轨道交通设备采购项目" value="1" />
            <el-option label="办公桌椅采购项目" value="2" />
          </el-select>
        </div>
      </template>
      <el-alert
        title="按角色查看项目当前节点和下一步操作，掌握项目进度。绿色节点为已完成，蓝色节点为进行中，灰色节点为待进行。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-timeline>
        <el-timeline-item
          v-for="(node, idx) in nodes"
          :key="idx"
          :type="node.type"
          :icon="node.icon"
          :timestamp="node.time"
        >
          <h4>{{ node.title }}</h4>
          <p>{{ node.desc }}</p>
          <el-button v-if="node.action" type="primary" size="small" @click="go(node.path)">{{ node.action }}</el-button>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Select, EditPen, Upload, VideoPlay, Star, Medal, DocumentChecked } from '@element-plus/icons-vue'

const router = useRouter()
const projectId = ref('1')

const nodes = ref([
  { title: '创建采购需求', desc: '招标人创建需求并提交审核', time: '2026-07-01 10:00', type: 'success', icon: Select },
  { title: '编制招标文件', desc: '代理机构编制招标文件、配置评标办法', time: '2026-07-02 14:00', type: 'success', icon: EditPen },
  { title: '发布招标公告', desc: '招标公告已发布至门户，供应商可报名', time: '2026-07-03 09:00', type: 'success', icon: Select },
  { title: '投标报名与缴费', desc: '供应商报名并通过审核、缴纳费用', time: '2026-07-05 16:00', type: 'success', icon: Select },
  { title: '上传投标文件', desc: '供应商上传加密投标文件并报价', time: '进行中', type: 'primary', icon: Upload, action: '去上传', path: '/admin/bid-upload' },
  { title: '线上开标', desc: '开标大厅完成签到、解密、唱标', time: '待进行', type: 'info', icon: VideoPlay },
  { title: '线上评标', desc: '专家评分、生成评标报告', time: '待进行', type: 'info', icon: Star },
  { title: '定标公示', desc: '确认中标人并发布结果公示', time: '待进行', type: 'info', icon: Medal },
  { title: '合同归档', desc: '上传合同，项目结束', time: '待进行', type: 'info', icon: DocumentChecked },
])

const go = (path) => router.push(path)
</script>

<style scoped>
.project-track {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
