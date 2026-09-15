/**
 * [接口层] api/report.ts —— 数据报表页
 * 说明：报表列表、生成、取消、删除接口（Mock 模拟）
 */
import http from '@/utils/request'
import type { PageResult, ReportItem } from '@/types'

/* 分页查询报表列表 */
export function fetchReportList(params: Record<string, any>) {
  return http.get<PageResult<ReportItem>>('/reports', params)
}

/* 生成报表 */
export function addReport(data: Partial<ReportItem>) {
  return http.post('/reports', data)
}

/* 取消生成中的报表 */
export function cancelReport(id: number) {
  return http.put(`/reports/${id}`, { status: '已取消' })
}

/* 删除报表 */
export function removeReport(id: number) {
  return http.delete(`/reports/${id}`)
}
