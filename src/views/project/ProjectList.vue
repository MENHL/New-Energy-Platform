<!--
  [业务页面] views/project/ProjectList.vue —— 项目管理 / 项目列表
  说明：筛选区 + 表格（分页）+ 新增/编辑弹窗 + 详情抽屉 + 删除二次确认
-->
<template>
  <div class="project-view">
    <!-- ========== 模块一：页头操作 ========== -->
    <div class="gg-card table-card">
      <div class="gg-card-head">
        <span class="gg-card-title">项目列表</span>
        <div>
          <a-button class="head-btn" @click="exportProjectList"><DownloadOutlined /> 导出</a-button>
          <a-button type="primary" @click="openProjectModal()"><PlusOutlined /> 新增项目</a-button>
        </div>
      </div>

      <!-- ========== 模块二：搜索筛选区 ========== -->
      <div class="filter-bar">
        <a-input v-model:value="query.keyword" style="width: 200px" placeholder="项目名称 / 编号" allowClear />
        <a-select v-model:value="query.status" style="width: 130px" :options="statusOptions" placeholder="全部状态" allowClear />
        <a-select v-model:value="query.region" style="width: 130px" :options="regionOptions" placeholder="全部区域" allowClear />
        <a-button type="primary" @click="searchProjectList">查询</a-button>
        <a-button @click="resetFilter">重置</a-button>
      </div>

      <!-- ========== 模块三：项目表格 ========== -->
      <a-table
        :columns="tableColumns"
        :data-source="projectList"
        :loading="listLoading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 状态标签 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColors[record.status]">{{ record.status }}</a-tag>
          </template>
          <!-- 进度条 -->
          <template v-if="column.key === 'progress'">
            <a-progress :percent="record.progress" size="small" stroke-color="#16a34a" style="width: 120px" />
          </template>
          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="openProjectDetail(record.id)">详情</a>
              <a @click="openProjectModal(record)">编辑</a>
              <a class="danger-link" @click="confirmRemoveProject(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- ========== 模块四：新增 / 编辑弹窗 ========== -->
    <a-modal
      v-model:open="modalOpen"
      :title="editingProject ? '编辑项目' : '新增项目'"
      :confirm-loading="saveLoading"
      @ok="submitProject"
    >
      <a-form ref="formElRef" :model="projectForm" :rules="projectRules" layout="vertical">
        <a-form-item label="项目名称" name="name">
          <a-input v-model:value="projectForm.name" placeholder="请输入项目名称" />
        </a-form-item>
        <a-form-item label="项目编号" name="projectCode">
          <a-input v-model:value="projectForm.projectCode" placeholder="如 PRJ-2026-021" />
        </a-form-item>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="所属区域" name="region">
              <a-select v-model:value="projectForm.region" :options="regionOptions" placeholder="请选择区域" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="负责人" name="manager">
              <a-input v-model:value="projectForm.manager" placeholder="请输入负责人" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="项目状态" name="status">
              <a-select v-model:value="projectForm.status" :options="statusOptions" placeholder="请选择状态" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="当前进度" name="progress">
              <a-input-number v-model:value="projectForm.progress" :min="0" :max="100" style="width: 100%" addon-after="%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="计划周期" name="dateRange">
          <a-range-picker v-model:value="projectForm.dateRange" style="width: 100%" value-format="YYYY-MM-DD" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- ========== 模块五：项目详情抽屉 ========== -->
    <a-drawer v-model:open="detailOpen" title="项目详情" width="480">
      <template v-if="projectDetail">
        <!-- 基础信息 -->
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="项目编号">{{ projectDetail.projectCode }}</a-descriptions-item>
          <a-descriptions-item label="项目名称">{{ projectDetail.name }}</a-descriptions-item>
          <a-descriptions-item label="所属区域">{{ projectDetail.region }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ projectDetail.manager }}</a-descriptions-item>
          <a-descriptions-item label="项目状态">
            <a-tag :color="statusColors[projectDetail.status]">{{ projectDetail.status }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="计划周期">{{ projectDetail.startDate }} ~ {{ projectDetail.endDate }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ projectDetail.updatedAt }}</a-descriptions-item>
        </a-descriptions>

        <!-- 项目进度 -->
        <h4 class="detail-subtitle">项目进度</h4>
        <a-progress :percent="projectDetail.progress" stroke-color="#16a34a" />

        <!-- 关联设备 -->
        <h4 class="detail-subtitle">关联设备（{{ projectDetail.devices.length }}）</h4>
        <ul class="device-mini-list">
          <li v-for="device in projectDetail.devices" :key="device.id">
            <span>{{ device.deviceCode }} · {{ device.name }}</span>
            <a-tag :color="deviceStatusColors[device.status]">{{ device.status }}</a-tag>
          </li>
          <li v-if="!projectDetail.devices.length" class="empty-tip">暂无关联设备</li>
        </ul>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
/* [模块] 列表查询 + 弹窗表单 + 详情抽屉 + 删除确认 */
import { onMounted, reactive, ref } from 'vue'
import { message, Modal, type FormInstance } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { fetchProjectDetail, fetchProjectList, addProject, updateProject, removeProject } from '@/api/project'

/* ---------- 筛选与分页状态 ---------- */
const listLoading = ref(false)
const projectList = ref<any[]>([])
const query = reactive<Record<string, any>>({ page: 1, pageSize: 10, keyword: '', status: undefined, region: undefined })
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: false, showTotal: (t: number) => `共 ${t} 条记录 · 每页 10 条` })

const statusOptions = [
  { value: '进行中', label: '进行中' },
  { value: '已暂停', label: '已暂停' },
  { value: '已完成', label: '已完成' }
]
const regionOptions = ['华东', '华北', '华南', '华中', '西北', '西南', '东北'].map((r) => ({ value: r, label: r }))

const statusColors: Record<string, string> = { 进行中: 'green', 已暂停: 'orange', 已完成: 'blue' }
const deviceStatusColors: Record<string, string> = { 在线: 'green', 离线: 'default', 故障: 'red', 维护中: 'orange' }

/* 表格列定义 */
const tableColumns = [
  { title: '项目编号', dataIndex: 'projectCode', key: 'projectCode', width: 140 },
  { title: '项目名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '区域', dataIndex: 'region', key: 'region', width: 80 },
  { title: '负责人', dataIndex: 'manager', key: 'manager', width: 90 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '进度', dataIndex: 'progress', key: 'progress', width: 150 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 150 },
  { title: '操作', key: 'action', width: 150 }
]

/* ---------- 拉取项目列表 ---------- */
async function loadProjectList() {
  listLoading.value = true
  try {
    const data = await fetchProjectList({ ...query })
    projectList.value = data.list
    pagination.current = query.page
    pagination.total = data.total
  } finally {
    listLoading.value = false
  }
}

/* 查询：重置页码后加载 */
function searchProjectList() {
  query.page = 1
  loadProjectList()
}

/* 重置筛选条件 */
function resetFilter() {
  Object.assign(query, { page: 1, keyword: '', status: undefined, region: undefined })
  loadProjectList()
}

/* 表格翻页 */
function handleTableChange(pager: any) {
  query.page = pager.current
  query.pageSize = pager.pageSize
  loadProjectList()
}

/* ---------- 新增 / 编辑弹窗 ---------- */
const formElRef = ref<FormInstance>()
const modalOpen = ref(false)
const saveLoading = ref(false)
const editingProject = ref<any>(null)

const projectForm = reactive<Record<string, any>>({
  name: '',
  projectCode: '',
  region: undefined,
  manager: '',
  status: undefined,
  progress: 0,
  dateRange: []
})

const projectRules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  projectCode: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
  region: [{ required: true, message: '请选择所属区域' }],
  manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  status: [{ required: true, message: '请选择项目状态' }]
}

/* 打开弹窗（传入记录则为编辑） */
function openProjectModal(record?: any) {
  editingProject.value = record || null
  if (record) {
    Object.assign(projectForm, record, { dateRange: [record.startDate, record.endDate] })
  } else {
    Object.assign(projectForm, { name: '', projectCode: '', region: undefined, manager: '', status: undefined, progress: 0, dateRange: [] })
  }
  modalOpen.value = true
}

/* 提交新增 / 编辑 */
async function submitProject() {
  try {
    await formElRef.value?.validate()
  } catch {
    return
  }
  saveLoading.value = true
  try {
    const { dateRange, ...rest } = projectForm
    const payload = { ...rest, startDate: dateRange?.[0] || '', endDate: dateRange?.[1] || '' }
    if (editingProject.value) {
      await updateProject(editingProject.value.id, payload)
      message.success('项目已更新')
    } else {
      await addProject(payload)
      message.success('项目创建成功')
    }
    modalOpen.value = false
    loadProjectList()
  } finally {
    saveLoading.value = false
  }
}

/* ---------- 详情抽屉 ---------- */
const detailOpen = ref(false)
const projectDetail = ref<any>(null)

async function openProjectDetail(id: number) {
  detailOpen.value = true
  projectDetail.value = await fetchProjectDetail(id)
}

/* ---------- 删除二次确认（有关联数据提示风险，FR-PROJ-06） ---------- */
function confirmRemoveProject(record: any) {
  Modal.confirm({
    title: '确认删除该项目？',
    content: `「${record.name}」可能关联设备与出入库数据，删除后不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    onOk: async () => {
      await removeProject(record.id)
      message.success('项目已删除')
      loadProjectList()
    }
  })
}

/* ---------- 模拟导出（CSV） ---------- */
function exportProjectList() {
  message.success('导出任务已创建，稍后可在下载列表查看')
}

onMounted(loadProjectList)
</script>

<style lang="scss" scoped>
/* 表格卡片 */
.table-card {
  .head-btn {
    margin-right: 12px;
  }
}

/* 筛选区 */
.filter-bar {
  display: -webkit-flex;
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
}

/* 详情抽屉小标题 */
.detail-subtitle {
  margin: 20px 0 10px;
  font-size: 14px;
  font-weight: 600;
}

.device-mini-list {
  li {
    @include flex-between;
    padding: 8px 0;
    border-bottom: 1px dashed $color-border;
    font-size: 13px;

    &:last-child {
      border-bottom: none;
    }
  }

  .empty-tip {
    justify-content: center;
    color: $color-text-weak;
    border-bottom: none;
  }
}

.danger-link {
  color: $color-danger;
}
</style>
