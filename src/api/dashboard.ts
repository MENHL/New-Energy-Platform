/**
 * [接口层] api/dashboard.ts —— 首页数据总览 / 运营看板
 * 说明：总览 KPI、趋势、设备状态、看板汇总等接口（Mock 模拟）
 */
import http from '@/utils/request'

/* 首页 KPI 指标项 */
export interface KpiItem {
  label: string
  value: number
  unit: string
  remark: string
  trend: number // 1 上升 / 0 持平 / -1 下降
}

/* 获取首页数据总览 */
export function fetchDashboardOverview() {
  return http.get('/dashboard/overview')
}

/* 获取运营看板汇总数据 */
export function fetchBoardSummary() {
  return http.get('/board/summary')
}

/* 获取运营分析汇总（range：近 N 日） */
export function fetchAnalyticsSummary(params: { range: number; projectId?: string; category?: string }) {
  return http.get('/analytics/summary', params)
}
