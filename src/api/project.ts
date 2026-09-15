/**
 * [接口层] api/project.ts —— 项目管理页
 * 说明：项目列表、详情、新增、编辑、删除接口（Mock 模拟）
 */
import http from '@/utils/request'
import type { PageResult, ProjectItem } from '@/types'

/* 分页查询项目列表 */
export function fetchProjectList(params: Record<string, any>) {
  return http.get<PageResult<ProjectItem>>('/projects', params)
}

/* 查询项目详情（含关联设备） */
export function fetchProjectDetail(id: number) {
  return http.get<ProjectItem & { devices: any[] }>(`/projects/${id}`)
}

/* 新增项目 */
export function addProject(data: Partial<ProjectItem>) {
  return http.post('/projects', data)
}

/* 编辑项目 */
export function updateProject(id: number, data: Partial<ProjectItem>) {
  return http.put(`/projects/${id}`, data)
}

/* 删除项目 */
export function removeProject(id: number) {
  return http.delete(`/projects/${id}`)
}
