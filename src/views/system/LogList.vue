<!--
  [系统页面] views/system/LogList.vue —— 系统管理 / 操作日志
  说明：筛选区（关键字/模块/类型）+ 日志表格 + 详情抽屉
-->
<template>
  <div class="log-view">
    <!-- ========== 模块一：页头操作 ========== -->
    <div class="gg-card table-card">
      <div class="gg-card-head">
        <span class="gg-card-title">操作日志</span>
        <a-button @click="exportLogList"><DownloadOutlined /> 导出日志</a-button>
      </div>

      <!-- ========== 模块二：筛选区 ========== -->
      <div class="filter-bar">
        <a-input v-model:value="query.keyword" style="width: 220px" placeholder="操作人 / 内容关键字" allowClear />
        <a-select v-model:value="query.module" style="width: 140px" :options="moduleOptions" placeholder="全部模块" allowClear />
        <a-select v-model:value="query.action" style="width: 130px" :options="actionOptions" placeholder="全部类型" allowClear />
        <a-button type="primary" @click="searchLogList">查询</a-button>
        <a-button @click="resetFilter">重置</a-button>
      </div>

      <!-- ========== 模块三：日志表格 ========== -->
      <a-table
        :columns="tableColumns"
        :data-source="logList"
        :loading="listLoading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 操作类型标签（FR-SYS-03） -->
          <template v-if="column.key === 'action'">
            <a-tag :color="actionColors[record.action]">{{ record.action }}</a-tag>
          </template>
          <!-- 操作人 · 模块 -->
          <template v-if="column.key === 'operator'">
            <span>{{ record.operator }} · {{ record.module }}</span>
          </template>
          <!-- 操作列：详情 -->
          <template v-if="column.key === 'op'">
            <a @click="openLogDetail(record)">详情</a>
          </template>
        </template>
      </a-table>
    </div>

    <!-- ========== 模块四：日志详情抽屉 ========== -->
    <a-drawer v-model:open="detailOpen" title="日志详情" width="420">
      <a-descriptions v-if="currentLog" :column="1" bordered size="small">
        <a-descriptions-item label="操作时间">{{ currentLog.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="操作人">{{ currentLog.operator }}</a-descriptions-item>
        <a-descriptions-item label="所属模块">{{ currentLog.module }}</a-descriptions-item>
        <a-descriptions-item label="操作类型">
          <a-tag :color="actionColors[currentLog.action]">{{ currentLog.action }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="来源 IP">{{ currentLog.ip }}</a-descriptions-item>
        <a-descriptions-item label="操作内容">{{ currentLog.content }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
/* [模块] 日志列表 + 筛选 + 详情抽屉 */
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { fetchLogList } from '@/api/system'

/* ---------- 筛选与分页 ---------- */
const listLoading = ref(false)
const logList = ref<any[]>([])
const query = reactive<Record<string, any>>({ page: 1, pageSize: 10, keyword: '', module: undefined, action: undefined })
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: false, showTotal: (t: number) => `共 ${t} 条记录 · 每页 10 条` })

const moduleOptions = ['项目管理', '设备管理', '物料管理', '仓储管理', '系统管理'].map((m) => ({ value: m, label: m }))
const actionOptions = ['新增', '更新', '删除', '维护', '登录'].map((a) => ({ value: a, label: a }))
const actionColors: Record<string, string> = {
  新增: 'green',
  更新: 'blue',
  删除: 'red',
  维护: 'orange',
  登录: 'default'
}

/* 表格列定义 */
const tableColumns = [
  { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 140 },
  { title: '操作内容', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '操作类型', dataIndex: 'action', key: 'action', width: 100 },
  { title: '操作人 / 模块', dataIndex: 'operator', key: 'operator', width: 160 },
  { title: '来源 IP', dataIndex: 'ip', key: 'ip', width: 130 },
  { title: '操作', key: 'op', width: 80 }
]

/* ---------- 拉取日志列表 ---------- */
async function loadLogList() {
  listLoading.value = true
  try {
    const data = await fetchLogList({ ...query })
    logList.value = data.list
    pagination.current = query.page
    pagination.total = data.total
  } finally {
    listLoading.value = false
  }
}

function searchLogList() {
  query.page = 1
  loadLogList()
}

function resetFilter() {
  Object.assign(query, { page: 1, keyword: '', module: undefined, action: undefined })
  loadLogList()
}

function handleTableChange(pager: any) {
  query.page = pager.current
  query.pageSize = pager.pageSize
  loadLogList()
}

/* ---------- 详情抽屉 ---------- */
const detailOpen = ref(false)
const currentLog = ref<any>(null)

function openLogDetail(record: any) {
  currentLog.value = record
  detailOpen.value = true
}

/* ---------- 模拟导出日志 ---------- */
function exportLogList() {
  message.success('日志导出任务已创建，稍后可在下载列表查看')
}

onMounted(loadLogList)
</script>

<style lang="scss" scoped>
.table-card {
  .head-btn {
    margin-right: 12px;
  }
}

.filter-bar {
  display: -webkit-flex;
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
}
</style>
