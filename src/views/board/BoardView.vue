<!--
  [看板页面] views/board/BoardView.vue —— 运营看板
  说明：条件筛选 + 核心 KPI + 近 24 小时产能/吞吐趋势 +
       仓库实时状态 + 设备类型利用率 + 今日待办
-->
<template>
  <div class="board-view">
    <!-- ========== 模块一：页头 + 条件筛选 ========== -->
    <div class="gg-card board-head">
      <div class="board-title-wrap">
        <h2 class="board-title">运营看板</h2>
        <span class="board-date">{{ boardDate }}</span>
        <span class="board-refresh">数据更新于 18:00 · 每 5 分钟自动刷新</span>
      </div>
      <!-- 筛选：时间 / 项目 / 区域（FR-BOARD-01） -->
      <div class="board-filters">
        <a-select v-model:value="filters.region" style="width: 120px" :options="regionOptions" placeholder="全部区域"
          allowClear />
        <a-select v-model:value="filters.project" style="width: 160px" :options="projectOptions" placeholder="全部项目"
          allowClear />
        <a-button type="primary" @click="loadBoard">查询</a-button>
      </div>
    </div>

    <!-- ========== 模块二：核心 KPI（大屏一行 4 个，中/小屏两行两列） ========== -->
    <a-row :gutter="16" class="kpi-row">
      <a-col v-for="kpi in board.kpis" :key="kpi.label" :xs="12" :md="12" :xl="6">
        <KpiCard v-bind="kpi" />
      </a-col>
    </a-row>

    <!-- ========== 模块三：产能与吞吐趋势（近 24 小时，双轴） ========== -->
    <div class="gg-card section-card">
      <div class="gg-card-head">
        <span class="gg-card-title">产能与吞吐趋势（近24小时）</span>
      </div>
      <div ref="hourlyEl" class="chart-box"></div>
    </div>

    <!-- ========== 模块四：仓库实时状态 + 设备类型利用率 + 今日待办 ========== -->
    <a-row :gutter="16" class="section-row">
      <!-- 仓库实时状态 -->
      <a-col :xs="24" :lg="8">
        <div class="gg-card h-full">
          <div class="gg-card-head"><span class="gg-card-title">仓库实时状态</span></div>
          <ul class="warehouse-list">
            <li v-for="item in board.warehouses" :key="item.name">
              <div class="warehouse-row">
                <span class="warehouse-name">{{ item.name }}</span>
                <span class="warehouse-usage">库容占用 {{ item.usage }}%</span>
              </div>
              <a-progress :percent="item.usage"
                :stroke-color="item.usage > 80 ? '#ef4444' : item.usage > 60 ? '#f59e0b' : '#16a34a'" size="small" />
            </li>
          </ul>
          <!-- 库容预警提示 -->
          <a-alert v-if="board.warehouses.some((w) => w.usage > 80)" class="warehouse-alert" type="warning" show-icon
            message="华东一号仓库容接近上限，建议尽快安排移库" />
        </div>
      </a-col>

      <!-- 设备类型利用率 -->
      <a-col :xs="24" :lg="8">
        <div class="gg-card h-full">
          <div class="gg-card-head"><span class="gg-card-title">设备类型利用率</span></div>
          <ul class="type-list">
            <li v-for="item in board.deviceTypes" :key="item.name">
              <div class="warehouse-row">
                <span class="warehouse-name">{{ item.name }}</span>
                <span class="warehouse-usage">{{ item.usage }}%</span>
              </div>
              <a-progress :percent="item.usage" stroke-color="#16a34a" size="small" />
            </li>
          </ul>
        </div>
      </a-col>

      <!-- 今日待办 -->
      <a-col :xs="24" :lg="8">
        <div class="gg-card h-full">
          <div class="gg-card-head"><span class="gg-card-title">今日待办</span></div>
          <ul class="todo-list">
            <li v-for="item in board.todos" :key="item.id">
              <span class="todo-content">{{ item.content }}</span>
              <a-tag :color="todoTagColor(item.level)">{{ item.level }}</a-tag>
            </li>
          </ul>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
/* [模块] 看板数据加载 + 双轴趋势图 + GSAP 入场动画 */
import { onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import gsap from 'gsap'
import { fetchBoardSummary } from '@/api/dashboard'
import { useChart } from '@/composables/useChart'
import KpiCard from '@/components/KpiCard.vue'

/* ---------- 筛选状态 ---------- */
const filters = reactive({ region: undefined as string | undefined, project: undefined as string | undefined })

const regionOptions = [
  { value: '华东', label: '华东' },
  { value: '华北', label: '华北' },
  { value: '华南', label: '华南' },
  { value: '西北', label: '西北' }
]

const projectOptions = [
  { value: '华东储能基地一期', label: '华东储能基地一期' },
  { value: '西北光伏组件仓扩建', label: '西北光伏组件仓扩建' },
  { value: '华北氢能示范站', label: '华北氢能示范站' }
]

/* ---------- 数据状态 ---------- */
const board = reactive<{
  kpis: any[]
  warehouses: { name: string; usage: number }[]
  deviceTypes: { name: string; usage: number }[]
  todos: { id: number; content: string; level: string }[]
}>({ kpis: [], warehouses: [], deviceTypes: [], todos: [] })

const boardDate = dayjs().format('YYYY-MM-DD')

/* ---------- 拉取看板数据 ---------- */
async function loadBoard() {
  const data: any = await fetchBoardSummary()
  board.kpis = data.kpis
  board.warehouses = data.warehouses
  board.deviceTypes = data.deviceTypes
  board.todos = data.todos
  renderHourlyChart(data.hourly)
}

/* ---------- 双轴趋势图：发电功率（左轴折线）+ 出入库单量（右轴柱状） ---------- */
const hourlyEl = ref<HTMLElement>()
const { updateChart: renderHourlyOption } = useChart(hourlyEl)

function renderHourlyChart(hourly: { hours: string[]; power: number[]; orders: number[] }) {
  renderHourlyOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['发电功率 (MW)', '出入库单量'], top: 0, right: 0 },
    grid: { left: 8, right: 8, top: 40, bottom: 0, containLabel: true },
    xAxis: {
      type: 'category',
      data: hourly.hours,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e5e7eb' } }
    },
    yAxis: [
      { type: 'value', name: '发电功率 (MW)', splitLine: { lineStyle: { color: '#f3f4f6' } } },
      { type: 'value', name: '单量', splitLine: { show: false } }
    ],
    series: [
      {
        name: '发电功率 (MW)',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: hourly.power,
        itemStyle: { color: '#16a34a' },
        areaStyle: { color: 'rgba(22, 163, 74, 0.12)' }
      },
      {
        name: '出入库单量',
        type: 'bar',
        yAxisIndex: 1,
        barWidth: 8,
        data: hourly.orders,
        itemStyle: { color: 'rgba(59, 130, 246, 0.65)', borderRadius: [4, 4, 0, 0] }
      }
    ]
  })
}

/* 待办标签配色 */
function todoTagColor(level: string) {
  const colors: Record<string, string> = { 紧急: 'red', 今日: 'orange', 本周: 'blue' }
  return colors[level] || 'default'
}

/* ---------- 初始化 ---------- */
onMounted(async () => {
  await loadBoard()
  /* KPI 整行动画：保证动画过程中卡片始终水平对齐 */
  gsap.from('.board-view .kpi-row', {
    y: 24,
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
  })
  /* 下方区块逐卡入场 */
  gsap.from('.board-view .section-card, .board-view .section-row .gg-card', {
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
/* 页头：标题信息 + 筛选条件 */
.board-head {
  margin-bottom: 16px;

  .board-title-wrap {
    @include flex-between;
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    justify-content: flex-start;
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;

    .board-title {
      font-size: 18px;
      font-weight: 700;
      margin-right: 12px;
    }

    .board-date {
      font-size: 14px;
      color: $color-text;
      margin-right: 16px;
    }

    .board-refresh {
      font-size: 12px;
      color: $color-text-weak;
    }
  }

  .board-filters {
    margin-top: 14px;
    display: -webkit-flex;
    display: flex;
    gap: 12px;
  }
}

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

.section-card {
  margin-bottom: 16px;
}

.chart-box {
  width: 100%;
  height: 320px;
}

/* 仓库 / 设备类型列表 */
.warehouse-list,
.type-list {
  li {
    margin-bottom: 14px;
  }

  .warehouse-row {
    @include flex-between;
    margin-bottom: 4px;

    .warehouse-name {
      font-size: 13px;
      font-weight: 500;
    }

    .warehouse-usage {
      font-size: 12px;
      color: $color-text-secondary;
    }
  }
}

.warehouse-alert {
  margin-top: 8px;
}

/* 今日待办 */
.todo-list {
  li {
    @include flex-between;
    padding: 10px 0;
    border-bottom: 1px dashed $color-border;

    &:last-child {
      border-bottom: none;
    }

    .todo-content {
      -webkit-flex: 1;
      flex: 1;
      margin-right: 12px;
      font-size: 13px;
      @include ellipsis;
    }
  }
}
</style>
