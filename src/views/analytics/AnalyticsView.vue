<!--
  [分析页面] views/analytics/AnalyticsView.vue —— 数据分析 / 运营分析
  说明：顶部统一筛选（时间范围/项目/分类）+ 入出库趋势 +
       库存结构占比 + 物料入库量排行 Top5
-->
<template>
  <div class="analytics-view">
    <!-- ========== 模块一：页头 + 统一筛选 ========== -->
    <div class="gg-card head-card">
      <div class="gg-card-head">
        <span class="gg-card-title">运营分析</span>
        <a-button @click="exportAnalyticsReport"><DownloadOutlined /> 导出报表</a-button>
      </div>
      <!-- 筛选：时间范围 / 项目 / 物料分类 -->
      <div class="filter-bar">
        <a-radio-group v-model:value="filters.range" button-style="solid" @change="loadAnalytics">
          <a-radio-button :value="7">近7日</a-radio-button>
          <a-radio-button :value="30">近30日</a-radio-button>
          <a-radio-button :value="90">近90日</a-radio-button>
        </a-radio-group>
        <a-select v-model:value="filters.projectId" style="width: 180px" :options="projectOptions" placeholder="全部项目" allowClear />
        <a-select v-model:value="filters.category" style="width: 160px" :options="categoryOptions" placeholder="全部物料分类" allowClear />
        <a-button type="primary" @click="loadAnalytics">查询</a-button>
      </div>
    </div>

    <!-- ========== 模块二：入库 / 出库趋势 ========== -->
    <a-row :gutter="16" class="section-row">
      <a-col :xs="24" :xl="12">
        <div class="gg-card">
          <div class="gg-card-head">
            <span class="gg-card-title">入库趋势（近{{ filters.range }}日）</span>
            <a-tag color="green" class="rate-tag">环比 {{ analytics.inboundRate }}</a-tag>
          </div>
          <div ref="inboundEl" class="chart-box"></div>
        </div>
      </a-col>
      <a-col :xs="24" :xl="12">
        <div class="gg-card">
          <div class="gg-card-head">
            <span class="gg-card-title">出库趋势（近{{ filters.range }}日）</span>
            <a-tag :color="analytics.outboundRate.startsWith('+') ? 'green' : 'red'" class="rate-tag">
              环比 {{ analytics.outboundRate }}
            </a-tag>
          </div>
          <div ref="outboundEl" class="chart-box"></div>
        </div>
      </a-col>
    </a-row>

    <!-- ========== 模块三：库存结构占比 + 物料入库量排行 ========== -->
    <a-row :gutter="16" class="section-row">
      <!-- 库存结构占比（环形图） -->
      <a-col :xs="24" :xl="10">
        <div class="gg-card">
          <div class="gg-card-head"><span class="gg-card-title">库存结构占比</span></div>
          <div class="stock-body">
            <div ref="stockEl" class="chart-box chart-pie"></div>
            <div class="stock-total">
              <div class="total-num">{{ analytics.stockTotal.toLocaleString() }}</div>
              <div class="total-label">库存总件数</div>
            </div>
          </div>
          <!-- 结构明细图例 -->
          <ul class="stock-legend">
            <li v-for="item in analytics.stockItems" :key="item.name">
              <i :style="{ background: stockColors[item.name] }"></i>
              <span class="legend-name">{{ item.name }}</span>
              <span class="legend-percent">{{ getStockPercent(item.value) }}%</span>
            </li>
          </ul>
        </div>
      </a-col>

      <!-- 物料入库量排行 Top5（横向条形图） -->
      <a-col :xs="24" :xl="14">
        <div class="gg-card">
          <div class="gg-card-head">
            <span class="gg-card-title">物料入库量排行 Top5</span>
            <a class="gg-card-extra">查看完整排行</a>
          </div>
          <div ref="rankEl" class="chart-box"></div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
/* [模块] 筛选状态 + 分析数据加载 + 三类图表渲染 */
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { fetchAnalyticsSummary } from '@/api/dashboard'
import { useChart } from '@/composables/useChart'

/* ---------- 筛选状态 ---------- */
const filters = reactive<{ range: number; projectId?: string; category?: string }>({ range: 30 })

const projectOptions = [
  { value: '华东储能基地一期', label: '华东储能基地一期' },
  { value: '西北光伏组件仓扩建', label: '西北光伏组件仓扩建' },
  { value: '华北氢能示范站', label: '华北氢能示范站' }
]
const categoryOptions = ['电芯电池', '光伏组件', '电气元件', '结构件辅材'].map((c) => ({ value: c, label: c }))

/* ---------- 数据状态 ---------- */
const analytics = reactive({
  inboundRate: '',
  outboundRate: '',
  inboundTrend: { dates: [] as string[], inbound: [] as number[], outbound: [] as number[] },
  outboundTrend: { dates: [] as string[], inbound: [] as number[], outbound: [] as number[] },
  stockTotal: 0,
  stockItems: [] as { name: string; value: number }[]
})

/* 库存分类配色 */
const stockColors: Record<string, string> = {
  电芯电池: '#16a34a',
  光伏组件: '#3b82f6',
  电气元件: '#f59e0b',
  结构件辅材: '#9ca3af'
}

/* ---------- 拉取分析数据 ---------- */
async function loadAnalytics() {
  const data: any = await fetchAnalyticsSummary({ range: filters.range, projectId: filters.projectId, category: filters.category })
  analytics.inboundRate = data.inboundRate
  analytics.outboundRate = data.outboundRate
  analytics.inboundTrend = data.inboundTrend
  analytics.outboundTrend = data.outboundTrend
  analytics.stockTotal = data.stockStructure.total
  analytics.stockItems = data.stockStructure.items
  renderTrendChart(inboundChart, data.inboundTrend, '#16a34a')
  renderTrendChart(outboundChart, data.outboundTrend, '#3b82f6')
  renderStockChart()
  renderRankChart(data.materialRank)
}

/* 获取库存分类占比 */
function getStockPercent(value: number) {
  return ((value / (analytics.stockTotal || 1)) * 100).toFixed(0)
}

/* ---------- 图表实例 ---------- */
const inboundEl = ref<HTMLElement>()
const outboundEl = ref<HTMLElement>()
const stockEl = ref<HTMLElement>()
const rankEl = ref<HTMLElement>()
const { updateChart: inboundChart } = useChart(inboundEl)
const { updateChart: outboundChart } = useChart(outboundEl)
const { updateChart: stockChart } = useChart(stockEl)
const { updateChart: rankChart } = useChart(rankEl)

/* 渲染趋势面积图 */
function renderTrendChart(update: any, trend: { dates: string[]; inbound: number[] }, color: string) {
  update({
    tooltip: { trigger: 'axis' },
    grid: { left: 8, right: 8, top: 24, bottom: 0, containLabel: true },
    xAxis: { type: 'category', data: trend.dates, boundaryGap: false, axisLine: { lineStyle: { color: '#e5e7eb' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: [
      {
        name: '单量',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: trend.inbound,
        itemStyle: { color },
        areaStyle: { color: `${color}1f` }
      }
    ]
  })
}

/* 渲染库存结构环形图 */
function renderStockChart() {
  stockChart({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 件（{d}%）' },
    series: [
      {
        type: 'pie',
        radius: ['62%', '82%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: analytics.stockItems.map((item) => ({
          ...item,
          itemStyle: { color: stockColors[item.name] }
        }))
      }
    ]
  })
}

/* 渲染物料入库量横向排行 */
function renderRankChart(ranks: { rank: number; name: string; amount: number }[]) {
  const sorted = [...ranks].reverse() // 横向图自下而上展示
  rankChart({
    tooltip: { trigger: 'axis', formatter: '{b}: {c} 件' },
    grid: { left: 8, right: 30, top: 8, bottom: 0, containLabel: true },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: {
      type: 'category',
      data: sorted.map((item) => item.name),
      axisLabel: { width: 130, overflow: 'truncate' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        data: sorted.map((item) => item.amount),
        itemStyle: { color: '#16a34a', borderRadius: [0, 7, 7, 0] },
        label: { show: true, position: 'right', formatter: '{c} 件', color: '#6b7280', fontSize: 11 }
      }
    ]
  })
}

/* ---------- 模拟导出 ---------- */
function exportAnalyticsReport() {
  message.success('分析报表导出任务已创建')
}

onMounted(loadAnalytics)
</script>

<style lang="scss" scoped>
/* 页头筛选 */
.head-card {
  margin-bottom: 16px;

  .rate-tag {
    margin-left: 8px;
  }
}

.filter-bar {
  display: -webkit-flex;
  display: flex;
  gap: 12px;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
}

.section-row {
  .a-col,
  .ant-col {
    margin-bottom: 16px;
  }
}

.chart-box {
  width: 100%;
  height: 300px;
}

.chart-pie {
  height: 240px;
}

/* 库存结构：环图 + 中心总数 */
.stock-body {
  position: relative;

  .stock-total {
    position: absolute;
    top: 50%;
    left: 50%;
    text-align: center;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    pointer-events: none;

    .total-num {
      font-size: 24px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .total-label {
      font-size: 12px;
      color: $color-text-secondary;
    }
  }
}

/* 库存结构明细图例 */
.stock-legend {
  display: -webkit-flex;
  display: flex;
  -webkit-justify-content: space-around;
  justify-content: space-around;
  margin-top: 12px;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;

  li {
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    font-size: 12px;

    i {
      width: 8px;
      height: 8px;
      margin-right: 6px;
      border-radius: 50%;
    }

    .legend-name {
      color: $color-text-secondary;
      margin-right: 6px;
    }

    .legend-percent {
      font-weight: 600;
    }
  }
}
</style>
