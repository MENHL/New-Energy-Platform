<!--
  [报表页面] views/report/ReportList.vue —— 数据分析 / 数据报表
  说明：筛选区 + 报表表格（已生成/生成中状态）+ 生成报表弹窗 + 预览抽屉
-->
<template>
  <div class="report-view">
    <!-- ========== 模块一：页头操作 ========== -->
    <div class="gg-card table-card">
      <div class="gg-card-head">
        <span class="gg-card-title">数据报表</span>
        <div>
          <a-button class="head-btn" @click="exportReportList"><DownloadOutlined /> 导出</a-button>
          <a-button type="primary" @click="openReportModal"><PlusOutlined /> 生成报表</a-button>
        </div>
      </div>

      <!-- ========== 模块二：筛选区 ========== -->
      <div class="filter-bar">
        <a-input v-model:value="query.keyword" style="width: 200px" placeholder="报表名称 / 编号" allowClear />
        <a-select v-model:value="query.type" style="width: 140px" :options="typeOptions" placeholder="全部类型" allowClear />
        <a-button type="primary" @click="searchReportList">查询</a-button>
        <a-button @click="resetFilter">重置</a-button>
      </div>

      <!-- ========== 模块三：报表表格 ========== -->
      <a-table
        :columns="tableColumns"
        :data-source="reportList"
        :loading="listLoading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 报表状态 -->
          <template v-if="column.key === 'status'">
            <a-badge v-if="record.status === '已生成'" status="success" text="已生成" />
            <a-badge v-else status="processing" text="生成中" />
          </template>
          <!-- 操作列：按状态区分（FR-REP-02/03） -->
          <template v-if="column.key === 'action'">
            <a-space>
              <template v-if="record.status === '已生成'">
                <a @click="downloadReport(record)">下载</a>
                <a @click="openReportPreview(record)">预览</a>
                <a class="danger-link" @click="confirmRemoveReport(record)">删除</a>
              </template>
              <template v-else>
                <a @click="openReportPreview(record)">详情</a>
                <a @click="cancelGeneratingReport(record)">取消</a>
              </template>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- ========== 模块四：生成报表弹窗 ========== -->
    <a-modal v-model:open="modalOpen" title="生成报表" :confirm-loading="saveLoading" @ok="submitReport">
      <a-form :model="reportForm" layout="vertical">
        <a-form-item label="报表类型" required>
          <a-select v-model:value="reportForm.type" :options="typeOptions" placeholder="请选择报表类型" />
        </a-form-item>
        <a-form-item label="报表名称" required>
          <a-input v-model:value="reportForm.name" placeholder="请输入报表名称" />
        </a-form-item>
        <a-form-item label="统计时间范围" required>
          <a-range-picker v-model:value="reportForm.range" style="width: 100%" value-format="YYYY-MM-DD" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- ========== 模块五：报表预览抽屉（结构化数据 + 图表） ========== -->
    <a-drawer v-model:open="previewOpen" :title="previewReport?.name || '报表预览'" width="560">
      <template v-if="previewReport">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="报表类型">{{ previewReport.type }}</a-descriptions-item>
          <a-descriptions-item label="创建人">{{ previewReport.creator }}</a-descriptions-item>
          <a-descriptions-item label="状态">{{ previewReport.status }}</a-descriptions-item>
          <a-descriptions-item label="生成时间">{{ previewReport.createdAt }}</a-descriptions-item>
        </a-descriptions>

        <!-- 模拟结构化数据 -->
        <h4 class="detail-subtitle">汇总数据</h4>
        <a-row :gutter="12">
          <a-col :span="8">
            <div class="preview-stat gg-card"><b>2,864</b><span>入库单量</span></div>
          </a-col>
          <a-col :span="8">
            <div class="preview-stat gg-card"><b>2,571</b><span>出库单量</span></div>
          </a-col>
          <a-col :span="8">
            <div class="preview-stat gg-card"><b>12,480</b><span>库存总量</span></div>
          </a-col>
        </a-row>

        <!-- 模拟图表 -->
        <h4 class="detail-subtitle">趋势概览</h4>
        <div ref="previewChartEl" class="preview-chart"></div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
/* [模块] 列表查询 + 生成报表 + 预览抽屉 + 下载/取消/删除 */
import { onMounted, reactive, ref, nextTick } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { fetchReportList, addReport, cancelReport, removeReport } from '@/api/report'
import { useChart } from '@/composables/useChart'
import { getTrendSeries } from '@/mock/data'

/* ---------- 筛选与分页 ---------- */
const listLoading = ref(false)
const reportList = ref<any[]>([])
const query = reactive<Record<string, any>>({ page: 1, pageSize: 10, keyword: '', type: undefined })
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: false, showTotal: (t: number) => `共 ${t} 份报表 · 每页 10 条` })

const typeOptions = ['运营汇总', '库存分析', '设备分析', '物料分析'].map((t) => ({ value: t, label: t }))

/* 表格列定义 */
const tableColumns = [
  { title: '报表类型', dataIndex: 'type', key: 'type', width: 110 },
  { title: '报表名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '生成时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: '创建人', dataIndex: 'creator', key: 'creator', width: 90 },
  { title: '操作', key: 'action', width: 150 }
]

/* ---------- 拉取报表列表 ---------- */
async function loadReportList() {
  listLoading.value = true
  try {
    const data = await fetchReportList({ ...query })
    reportList.value = data.list
    pagination.current = query.page
    pagination.total = data.total
  } finally {
    listLoading.value = false
  }
}

function searchReportList() {
  query.page = 1
  loadReportList()
}

function resetFilter() {
  Object.assign(query, { page: 1, keyword: '', type: undefined })
  loadReportList()
}

function handleTableChange(pager: any) {
  query.page = pager.current
  query.pageSize = pager.pageSize
  loadReportList()
}

/* ---------- 生成报表 ---------- */
const modalOpen = ref(false)
const saveLoading = ref(false)
const reportForm = reactive<Record<string, any>>({ type: undefined, name: '', range: [] })

function openReportModal() {
  Object.assign(reportForm, { type: undefined, name: '', range: [] })
  modalOpen.value = true
}

async function submitReport() {
  if (!reportForm.type || !reportForm.name) {
    message.warning('请完整填写报表类型与名称')
    return
  }
  saveLoading.value = true
  try {
    await addReport({ ...reportForm })
    message.success('报表生成任务已提交，请稍后查看')
    modalOpen.value = false
    loadReportList()
  } finally {
    saveLoading.value = false
  }
}

/* ---------- 预览抽屉（结构化数据 + 模拟图表） ---------- */
const previewOpen = ref(false)
const previewReport = ref<any>(null)
const previewChartEl = ref<HTMLElement>()
const { updateChart: renderPreviewChart } = useChart(previewChartEl)

async function openReportPreview(record: any) {
  previewReport.value = record
  previewOpen.value = true
  await nextTick()
  const trend = getTrendSeries(14)
  renderPreviewChart({
    tooltip: { trigger: 'axis' },
    legend: { data: ['入库', '出库'], top: 0, right: 0 },
    grid: { left: 8, right: 8, top: 32, bottom: 0, containLabel: true },
    xAxis: { type: 'category', data: trend.dates, boundaryGap: false, axisLine: { lineStyle: { color: '#e5e7eb' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: [
      { name: '入库', type: 'bar', barWidth: 8, data: trend.inbound, itemStyle: { color: '#16a34a', borderRadius: [4, 4, 0, 0] } },
      { name: '出库', type: 'bar', barWidth: 8, data: trend.outbound, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } }
    ]
  })
}

/* ---------- 下载 / 取消 / 删除 ---------- */
function downloadReport(record: any) {
  message.success(`「${record.name}」下载任务已创建`)
}

async function cancelGeneratingReport(record: any) {
  await cancelReport(record.id)
  message.success('生成任务已取消')
  loadReportList()
}

function confirmRemoveReport(record: any) {
  Modal.confirm({
    title: '确认删除该报表？',
    content: `「${record.name}」删除后不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    onOk: async () => {
      await removeReport(record.id)
      message.success('报表已删除')
      loadReportList()
    }
  })
}

/* ---------- 模拟导出列表 ---------- */
function exportReportList() {
  message.success('报表清单导出任务已创建')
}

onMounted(loadReportList)
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

/* 预览抽屉 */
.detail-subtitle {
  margin: 20px 0 10px;
  font-size: 14px;
  font-weight: 600;
}

.preview-stat {
  padding: 12px;
  text-align: center;

  b {
    display: block;
    font-size: 20px;
  }

  span {
    font-size: 12px;
    color: $color-text-secondary;
  }
}

.preview-chart {
  width: 100%;
  height: 220px;
}

.danger-link {
  color: $color-danger;
}
</style>
