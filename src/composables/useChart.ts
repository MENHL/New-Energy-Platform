/**
 * [通用逻辑] composables/useChart.ts —— 图表页通用
 * 说明：ECharts 按需引入（Tree Shaking 减小体积）、实例初始化、
 *      视口自适应 resize 与组件卸载时销毁
 */
import { onBeforeUnmount, onMounted, shallowRef, type Ref } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

/* 按需注册图表类型与组件 */
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

/**
 * 创建图表实例并绑定自适应
 * @param elRef 图表容器 DOM 引用
 */
export function useChart(elRef: Ref<HTMLElement | null>) {
  const chartRef = shallowRef<echarts.ECharts | null>(null)

  /* 更新图表配置（首次调用时初始化实例） */
  function updateChart(option: echarts.EChartsCoreOption) {
    if (!elRef.value) return
    if (!chartRef.value) chartRef.value = echarts.init(elRef.value)
    chartRef.value.setOption(option, true)
  }

  /* 视口变化时重绘 */
  function resizeChart() {
    chartRef.value?.resize()
  }

  onMounted(() => window.addEventListener('resize', resizeChart))
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
    chartRef.value?.dispose()
    chartRef.value = null
  })

  return { chartRef, updateChart }
}
