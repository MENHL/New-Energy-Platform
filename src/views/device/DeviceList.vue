<!--
  [业务页面] views/device/DeviceList.vue —— 设备管理 / 设备列表
  说明：状态统计 + 筛选区 + 设备表格（分页）+ 详情抽屉（含监控指标趋势）
-->
<template>
  <div class="device-view">
    <!-- ========== 模块一：状态统计卡片（在线/离线/故障/维护中） ========== -->
    <a-row :gutter="16" class="stat-row">
      <a-col v-for="stat in statusStats" :key="stat.label" :xs="12" :md="6">
        <div class="stat-card gg-card">
          <span class="stat-dot" :style="{ background: stat.color }"></span>
          <div>
            <div class="stat-value">{{ stat.value }} <span class="stat-unit">台</span></div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- ========== 模块二：筛选 + 表格 ========== -->
    <div class="gg-card table-card">
      <div class="gg-card-head">
        <span class="gg-card-title">设备管理</span>
        <a-button><DownloadOutlined /> 导出</a-button>
      </div>

      <!-- 筛选：关键字 / 类型 / 状态 -->
      <div class="filter-bar">
        <a-input v-model:value="query.keyword" style="width: 200px" placeholder="设备编号 / 名称" allowClear />
        <a-select v-model:value="query.type" style="width: 140px" :options="typeOptions" placeholder="全部类型" allowClear />
        <a-select v-model:value="query.status" style="width: 130px" :options="statusOptions" placeholder="全部状态" allowClear />
        <a-button type="primary" @click="searchDeviceList">查询</a-button>
        <a-button @click="resetFilter">重置</a-button>
      </div>

      <a-table
        :columns="tableColumns"
        :data-source="deviceList"
        :loading="listLoading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 运行状态标签 -->
          <template v-if="column.key === 'status'">
            <a-badge :status="statusBadge[record.status]" :text="record.status" />
          </template>
          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="openDeviceDetail(record.id)">详情</a>
              <a @click="handleMaintainDevice(record)">维护</a>
              <a class="danger-link" @click="confirmRemoveDevice(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- ========== 模块三：设备详情抽屉（信息 + 监控趋势） ========== -->
    <a-drawer v-model:open="detailOpen" title="设备详情 / 监控" width="520">
      <template v-if="deviceDetail">
        <!-- 基础信息 -->
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="设备编号">{{ deviceDetail.deviceCode }}</a-descriptions-item>
          <a-descriptions-item label="设备类型">{{ deviceDetail.type }}</a-descriptions-item>
          <a-descriptions-item label="设备名称" :span="2">{{ deviceDetail.name }}</a-descriptions-item>
          <a-descriptions-item label="所属项目" :span="2">{{ deviceDetail.projectName }}</a-descriptions-item>
          <a-descriptions-item label="运行状态">
            <a-badge :status="statusBadge[deviceDetail.status]" :text="deviceDetail.status" />
          </a-descriptions-item>
          <a-descriptions-item label="安装日期">{{ deviceDetail.installDate }}</a-descriptions-item>
        </a-descriptions>

        <!-- 模拟监控指标趋势（FR-DEV-04） -->
        <h4 class="detail-subtitle">运行负载趋势（近 24h）</h4>
        <div ref="loadChartEl" class="detail-chart"></div>
        <h4 class="detail-subtitle">设备温度趋势（近 24h）</h4>
        <div ref="tempChartEl" class="detail-chart"></div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
/* [模块] 状态统计 + 列表查询 + 详情抽屉图表 + 维护/删除操作 */
import { computed, onMounted, reactive, ref, nextTick } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { fetchDeviceDetail, fetchDeviceList, removeDevice, updateDeviceStatus } from '@/api/device'
import { useChart } from '@/composables/useChart'

/* ---------- 筛选与分页 ---------- */
const listLoading = ref(false)
const deviceList = ref<any[]>([])
const query = reactive<Record<string, any>>({ page: 1, pageSize: 10, keyword: '', type: undefined, status: undefined })
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: false, showTotal: (t: number) => `共 ${t} 条记录 · 每页 10 条` })

const typeOptions = ['逆变器', '风电机组', '储能系统', '光伏阵列', '输配电'].map((t) => ({ value: t, label: t }))
const statusOptions = ['在线', '离线', '故障', '维护中'].map((s) => ({ value: s, label: s }))
const statusBadge: Record<string, string> = { 在线: 'success', 离线: 'default', 故障: 'error', 维护中: 'warning' }

/* 表格列定义 */
const tableColumns = [
  { title: '设备编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 120 },
  { title: '设备名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '类型', dataIndex: 'type', key: 'type', width: 110 },
  { title: '所属项目', dataIndex: 'projectName', key: 'projectName', ellipsis: true },
  { title: '运行状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '安装日期', dataIndex: 'installDate', key: 'installDate', width: 120 },
  { title: '操作', key: 'action', width: 150 }
]

/* ---------- 状态统计（基于全量数据汇总） ---------- */
const statusStats = computed(() => {
  const count = (s: string) => deviceList.value.filter((d) => d.status === s).length
  return [
    { label: '在线', value: count('在线'), color: '#16a34a' },
    { label: '离线', value: count('离线'), color: '#9ca3af' },
    { label: '故障', value: count('故障'), color: '#ef4444' },
    { label: '维护中', value: count('维护中'), color: '#f59e0b' }
  ]
})

/* ---------- 拉取设备列表 ---------- */
async function loadDeviceList() {
  listLoading.value = true
  try {
    const data = await fetchDeviceList({ ...query })
    deviceList.value = data.list
    pagination.current = query.page
    pagination.total = data.total
  } finally {
    listLoading.value = false
  }
}

function searchDeviceList() {
  query.page = 1
  loadDeviceList()
}

function resetFilter() {
  Object.assign(query, { page: 1, keyword: '', type: undefined, status: undefined })
  loadDeviceList()
}

function handleTableChange(pager: any) {
  query.page = pager.current
  query.pageSize = pager.pageSize
  loadDeviceList()
}

/* ---------- 详情抽屉：信息 + 指标趋势图 ---------- */
const detailOpen = ref(false)
const deviceDetail = ref<any>(null)
const loadChartEl = ref<HTMLElement>()
const tempChartEl = ref<HTMLElement>()
const { updateChart: renderLoadChart } = useChart(loadChartEl)
const { updateChart: renderTempChart } = useChart(tempChartEl)

async function openDeviceDetail(id: number) {
  detailOpen.value = true
  deviceDetail.value = await fetchDeviceDetail(id)
  /* 等抽屉渲染完成后初始化图表 */
  await nextTick()
  const { times, load, temp } = deviceDetail.value.metrics
  const buildOption = (name: string, data: number[], color: string) => ({
    tooltip: { trigger: 'axis' },
    grid: { left: 8, right: 8, top: 24, bottom: 0, containLabel: true },
    xAxis: { type: 'category', data: times, axisLine: { lineStyle: { color: '#e5e7eb' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: [{ name, type: 'line', smooth: true, showSymbol: false, data, itemStyle: { color }, areaStyle: { color: `${color}20` } }]
  })
  renderLoadChart(buildOption('负载 (%)', load, '#16a34a'))
  renderTempChart(buildOption('温度 (℃)', temp, '#f59e0b'))
}

/* ---------- 维护操作：置为维护中 ---------- */
async function handleMaintainDevice(record: any) {
  await updateDeviceStatus(record.id, '维护中')
  message.success(`设备 ${record.deviceCode} 已提交维护工单`)
  loadDeviceList()
}

/* ---------- 删除确认 ---------- */
function confirmRemoveDevice(record: any) {
  Modal.confirm({
    title: '确认删除该设备？',
    content: `设备 ${record.deviceCode}（${record.name}）删除后不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    onOk: async () => {
      await removeDevice(record.id)
      message.success('设备已删除')
      loadDeviceList()
    }
  })
}

onMounted(loadDeviceList)
</script>

<style lang="scss" scoped>
/* 状态统计卡片 */
.stat-row {
  margin-bottom: 16px;

  .a-col,
  .ant-col {
    margin-bottom: 16px;
  }
}

.stat-card {
  @include flex-between;
  -webkit-box-pack: start;
  -webkit-justify-content: flex-start;
  justify-content: flex-start;
  padding: 16px 20px;

  .stat-dot {
    width: 10px;
    height: 10px;
    margin-right: 12px;
    border-radius: 50%;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;

    .stat-unit {
      font-size: 12px;
      font-weight: 400;
      color: $color-text-secondary;
    }
  }

  .stat-label {
    font-size: 12px;
    color: $color-text-secondary;
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

/* 详情抽屉图表 */
.detail-subtitle {
  margin: 20px 0 10px;
  font-size: 14px;
  font-weight: 600;
}

.detail-chart {
  width: 100%;
  height: 180px;
}

.danger-link {
  color: $color-danger;
}
</style>
