<!--
  [首页页面] views/dashboard/HomeView.vue —— 首页 / 数据总览
  说明：KPI 指标卡片 + 入出库趋势（日/周/月）+ 设备状态分布 +
       项目运营排行 Top5 + 库存预警 + 最近动态（GSAP 卡片入场动画）
-->
<template>
  <div class="home-view">
    <!-- ========== 模块一：核心 KPI 指标卡片（等高对齐） ========== -->
    <a-row :gutter="16" class="kpi-row" align="stretch">
      <a-col v-for="kpi in overview.kpis" :key="kpi.label" :xs="12" :md="8" :xl="4">
        <KpiCard v-bind="kpi" />
      </a-col>
    </a-row>

    <!-- ========== 模块二：入出库趋势 + 设备状态分布 ========== -->
    <a-row :gutter="16" class="section-row">
      <a-col :xs="24" :xl="16">
        <div class="gg-card">
          <div class="gg-card-head">
            <span class="gg-card-title">入出库趋势</span>
            <!-- 日 / 周 / 月 维度切换 -->
            <a-radio-group v-model:value="trendRange" size="small" button-style="solid" @change="handleRangeChange">
              <a-radio-button value="7">日</a-radio-button>
              <a-radio-button value="30">周</a-radio-button>
              <a-radio-button value="90">月</a-radio-button>
            </a-radio-group>
          </div>
          <div ref="trendEl" class="chart-box chart-trend"></div>
        </div>
      </a-col>

      <a-col :xs="24" :xl="8">
        <div class="gg-card device-card">
          <div class="gg-card-head">
            <span class="gg-card-title">设备状态分布</span>
            <router-link class="gg-card-extra" to="/device">查看设备</router-link>
          </div>
          <div class="device-body">
            <!-- 环形图 -->
            <div ref="deviceEl" class="chart-box chart-device"></div>
            <!-- 图例明细 -->
            <ul class="device-legend">
              <li v-for="item in overview.deviceStatus.items" :key="item.name">
                <i :style="{ background: statusColors[item.name] }"></i>
                <span class="legend-name">{{ item.name }}</span>
                <span class="legend-value">{{ item.value }} 台 · {{ getDevicePercent(item.value) }}%</span>
              </li>
            </ul>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- ========== 模块三：项目排行 + 库存预警 + 最近动态 ========== -->
    <a-row :gutter="16" class="section-row">
      <!-- 项目运营排行 Top5 -->
      <a-col :xs="24" :lg="8">
        <div class="gg-card">
          <div class="gg-card-head">
            <span class="gg-card-title">项目运营排行 Top5</span>
            <router-link class="gg-card-extra" to="/project">全部项目</router-link>
          </div>
          <ul class="rank-list">
            <li v-for="item in overview.topProjects" :key="item.rank">
              <span class="rank-no" :class="{ 'is-top': item.rank <= 3 }">{{ String(item.rank).padStart(2, '0')
                }}</span>
              <span class="rank-name">{{ item.name }}</span>
              <span class="rank-amount">{{ item.amount.toLocaleString() }} 单</span>
            </li>
          </ul>
        </div>
      </a-col>

      <!-- 库存预警 -->
      <a-col :xs="24" :lg="8">
        <div class="gg-card">
          <div class="gg-card-head">
            <span class="gg-card-title">库存预警</span>
            <router-link class="gg-card-extra" to="/material">查看全部 8 项</router-link>
          </div>
          <ul class="warn-list">
            <li v-for="item in overview.warnings" :key="item.id">
              <div class="warn-info">
                <div class="warn-name">{{ item.name }}</div>
                <div class="warn-spec">规格 {{ item.spec }}</div>
                <div class="warn-stock">库存 {{ item.stock }} / 安全 {{ item.safetyStock }}</div>
              </div>
              <a-tag :color="item.level === '缺货' ? 'red' : 'orange'">{{ item.level }}</a-tag>
            </li>
          </ul>
        </div>
      </a-col>

      <!-- 最近动态 -->
      <a-col :xs="24" :lg="8">
        <div class="gg-card">
          <div class="gg-card-head">
            <span class="gg-card-title">最近动态</span>
            <a class="gg-card-extra">查看全部</a>
          </div>
          <a-timeline class="activity-list">
            <a-timeline-item v-for="item in overview.activities" :key="item.id" color="green">
              <p class="activity-content">{{ item.content }}</p>
              <span class="activity-time">{{ item.time }}</span>
            </a-timeline-item>
          </a-timeline>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
/* [模块] 数据获取 + 图表渲染 + GSAP 入场动画 */
import { onMounted, reactive, ref } from 'vue'
import gsap from 'gsap'
import { fetchAnalyticsSummary, fetchDashboardOverview } from '@/api/dashboard'
import { useChart } from '@/composables/useChart'
import KpiCard from '@/components/KpiCard.vue'

/* ---------- 数据状态 ---------- */
const trendRange = ref<'7' | '30' | '90'>('7')

const overview = reactive<{
  kpis: any[]
  deviceStatus: { total: number; items: { name: string; value: number }[] }
  topProjects: any[]
  warnings: any[]
  activities: any[]
}>({
  kpis: [],
  deviceStatus: { total: 0, items: [] },
  topProjects: [],
  warnings: [],
  activities: []
})

/* 设备状态配色（在线=品牌绿） */
const statusColors: Record<string, string> = {
  在线运行: '#16a34a',
  离线: '#9ca3af',
  故障: '#ef4444',
  维护中: '#f59e0b'
}

/* ---------- 拉取总览数据 ---------- */
async function loadOverview() {
  const data: any = await fetchDashboardOverview()
  Object.assign(overview, {
    kpis: data.kpis,
    deviceStatus: data.deviceStatus,
    topProjects: data.topProjects,
    warnings: data.warnings,
    activities: data.activities
  })
  renderTrendChart(data.trend)
  renderDeviceChart()
}

/* ---------- 获取设备状态占比 ---------- */
function getDevicePercent(value: number) {
  const total = overview.deviceStatus.total || 1
  return ((value / total) * 100).toFixed(1)
}

/* ---------- 图表实例 ---------- */
const trendEl = ref<HTMLElement>()
const deviceEl = ref<HTMLElement>()
const { updateChart: renderTrendOption } = useChart(trendEl)
const { updateChart: renderDeviceOption } = useChart(deviceEl)

/* 渲染入出库趋势折线图 */
function renderTrendChart(trend: { dates: string[]; inbound: number[]; outbound: number[] }) {
  renderTrendOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['入库单量', '出库单量'], top: 0, right: 0 },
    grid: { left: 8, right: 8, top: 36, bottom: 0, containLabel: true },
    xAxis: { type: 'category', data: trend.dates, boundaryGap: false, axisLine: { lineStyle: { color: '#e5e7eb' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: [
      {
        name: '入库单量',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: trend.inbound,
        itemStyle: { color: '#16a34a' },
        areaStyle: { color: 'rgba(22, 163, 74, 0.12)' }
      },
      {
        name: '出库单量',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: trend.outbound,
        itemStyle: { color: '#3b82f6' },
        areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }
      }
    ]
  })
}

/* 渲染设备状态环形图 */
function renderDeviceChart() {
  const { total, items } = overview.deviceStatus
  renderDeviceOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 台（{d}%）' },
    title: {
      text: `${total}`,
      subtext: '设备总数',
      left: 'center',
      top: '38%',
      textStyle: { fontSize: 26, fontWeight: 700 },
      subtextStyle: { fontSize: 12, color: '#9ca3af' }
    },
    series: [
      {
        type: 'pie',
        radius: ['58%', '78%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: items.map((item) => ({ ...item, itemStyle: { color: statusColors[item.name] } }))
      }
    ]
  })
}

/* 切换趋势维度：日 / 周 / 月 */
async function handleRangeChange() {
  const data: any = await fetchAnalyticsSummary({ range: Number(trendRange.value) })
  renderTrendChart(data.inboundTrend)
}

/* ---------- 初始化：数据加载 + 卡片入场动画 ---------- */
onMounted(async () => {
  await loadOverview()
  /* KPI 整行动画：保证动画过程中卡片始终水平对齐 */
  gsap.from('.home-view .kpi-row', {
    y: 24,
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
  })
  /* 下方区块逐卡入场 */
  gsap.from('.home-view .section-row .gg-card', {
    y: 24,
    opacity: 0,
    duration: 0.5,
    stagger: 0.06,
    delay: 0.1,
    ease: 'power2.out'
  })
})
</script>

<style lang="scss" scoped>
/* 页面区块间距：8px 基础间距体系 */
/* KPI 行：强制纵向拉伸 + 列改为 flex 容器，保证卡片等高水平对齐 */
.kpi-row {
  -webkit-align-items: stretch;
  align-items: stretch;

  > .a-col,
  > .ant-col {
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
  }
}

.kpi-row,
.section-row {

  .a-col,
  .ant-col {
    margin-bottom: 16px;
  }
}

/* 图表容器：统一高度 */
.chart-box {
  width: 100%;
  height: 300px;
}

.chart-device {
  height: 240px;
}

/* 设备状态：环图 + 图例左右布局 */
.device-body {
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;

  .chart-device {
    -webkit-flex: 1;
    flex: 1;
    min-width: 0;
  }
}

.device-legend {
  width: 150px;
  flex-shrink: 0;

  li {
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    margin-bottom: 10px;
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

    .legend-value {
      color: $color-text;
    }
  }
}

/* 排行列表 */
.rank-list {
  li {
    @include flex-between;
    padding: 9px 0;
    border-bottom: 1px dashed $color-border;

    &:last-child {
      border-bottom: none;
    }

    .rank-no {
      width: 24px;
      font-size: 13px;
      font-weight: 700;
      color: $color-text-weak;

      &.is-top {
        color: $color-primary;
      }
    }

    .rank-name {
      -webkit-flex: 1;
      flex: 1;
      margin: 0 12px;
      @include ellipsis;
    }

    .rank-amount {
      font-size: 13px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
  }
}

/* 预警列表 */
.warn-list {
  li {
    @include flex-between;
    padding: 9px 0;
    border-bottom: 1px dashed $color-border;

    &:last-child {
      border-bottom: none;
    }

    .warn-name {
      font-weight: 500;
    }

    .warn-spec,
    .warn-stock {
      margin-top: 3px;
      font-size: 12px;
      color: $color-text-secondary;
    }
  }
}

/* 动态时间线 */
.activity-list {
  .activity-content {
    font-size: 13px;
    line-height: 1.6;
  }

  .activity-time {
    font-size: 12px;
    color: $color-text-weak;
  }
}
</style>
