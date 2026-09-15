/**
 * [接口层] api/device.ts —— 设备管理页
 * 说明：设备列表、详情（含监控指标）、状态维护、删除接口（Mock 模拟）
 */
import http from '@/utils/request'
import type { DeviceItem, PageResult } from '@/types'

/* 设备监控指标（模拟运行趋势） */
export interface DeviceMetrics {
  times: string[]
  load: number[]
  temp: number[]
}

/* 分页查询设备列表 */
export function fetchDeviceList(params: Record<string, any>) {
  return http.get<PageResult<DeviceItem>>('/devices', params)
}

/* 查询设备详情（含监控指标） */
export function fetchDeviceDetail(id: number) {
  return http.get<DeviceItem & { metrics: DeviceMetrics }>(`/devices/${id}`)
}

/* 更新设备状态（维护操作） */
export function updateDeviceStatus(id: number, status: string) {
  return http.put(`/devices/${id}`, { status })
}

/* 删除设备 */
export function removeDevice(id: number) {
  return http.delete(`/devices/${id}`)
}
