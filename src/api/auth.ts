/**
 * [接口层] api/auth.ts —— 登录页
 * 说明：账号登录接口（Mock 模拟）
 */
import http from '@/utils/request'
import type { UserInfo } from '@/types'

/* 登录表单 */
export interface LoginForm {
  username: string
  password: string
  remember: boolean
}

/* 登录结果 */
export interface LoginResult {
  token: string
  user: UserInfo
}

/* 提交账号登录 */
export function loginByAccount(form: LoginForm) {
  return http.post<LoginResult>('/auth/login', form)
}
