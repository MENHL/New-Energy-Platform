/**
 * [接口层] api/system.ts —— 系统管理（用户与权限 / 操作日志）
 * 说明：用户增删改查、状态切换与日志查询接口（Mock 模拟）
 */
import http from '@/utils/request'
import type { LogItem, PageResult, UserInfo } from '@/types'

/* ========== 用户与权限 ========== */

/* 分页查询用户列表 */
export function fetchUserList(params: Record<string, any>) {
  return http.get<PageResult<UserInfo>>('/system/users', params)
}

/* 新增用户 */
export function addUser(data: Partial<UserInfo>) {
  return http.post('/system/users', data)
}

/* 编辑用户 */
export function updateUser(id: number, data: Partial<UserInfo>) {
  return http.put(`/system/users/${id}`, data)
}

/* 删除用户 */
export function removeUser(id: number) {
  return http.delete(`/system/users/${id}`)
}

/* ========== 操作日志 ========== */

/* 分页查询操作日志 */
export function fetchLogList(params: Record<string, any>) {
  return http.get<PageResult<LogItem>>('/system/logs', params)
}
