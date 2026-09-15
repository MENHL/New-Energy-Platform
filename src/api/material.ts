/**
 * [接口层] api/material.ts —— 物料管理页
 * 说明：物料列表、详情（含出入库追溯）、增删改接口（Mock 模拟）
 */
import http from '@/utils/request'
import type { MaterialItem, OrderItem, PageResult } from '@/types'

/* 物料详情（含出入库追溯记录） */
export interface MaterialDetail extends MaterialItem {
  inboundRecords: OrderItem[]
  outboundRecords: OrderItem[]
}

/* 分页查询物料列表 */
export function fetchMaterialList(params: Record<string, any>) {
  return http.get<PageResult<MaterialItem>>('/materials', params)
}

/* 查询物料详情（含出入库记录追溯） */
export function fetchMaterialDetail(id: number) {
  return http.get<MaterialDetail>(`/materials/${id}`)
}

/* 新增物料 */
export function addMaterial(data: Partial<MaterialItem>) {
  return http.post('/materials', data)
}

/* 编辑物料 */
export function updateMaterial(id: number, data: Partial<MaterialItem>) {
  return http.put(`/materials/${id}`, data)
}

/* 删除物料 */
export function removeMaterial(id: number) {
  return http.delete(`/materials/${id}`)
}
