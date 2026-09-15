/**
 * [状态管理] stores/userStore.ts —— 全局（用户会话与权限）
 * 说明：登录态保存、记住登录（localStorage 持久化）、退出清理
 */
import { defineStore } from 'pinia'
import { loginByAccount, type LoginForm } from '@/api/auth'
import type { UserInfo } from '@/types'

/* 本地缓存键 */
const TOKEN_KEY = 'gg_token'
const USER_KEY = 'gg_user'

export const useUserStore = defineStore('user', {
  /* ---------- 状态 ---------- */
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    userInfo: JSON.parse(localStorage.getItem(USER_KEY) || 'null') as UserInfo | null
  }),

  /* ---------- 取值器 ---------- */
  getters: {
    getUserToken: (state) => state.token,
    getUserRole: (state) => state.userInfo?.role ?? 'guest',
    getUserRoleName: (state) => state.userInfo?.roleName ?? '普通用户',
    getUserName: (state) => state.userInfo?.name ?? '未登录'
  },

  /* ---------- 动作 ---------- */
  actions: {
    /* 提交登录：校验通过后保存会话；勾选“记住登录状态”时持久化 */
    async submitLogin(form: LoginForm) {
      const data = await loginByAccount(form)
      this.token = data.token
      this.userInfo = data.user
      if (form.remember) {
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      }
    },

    /* 退出登录：清空会话与本地缓存 */
    removeLoginState() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }
})
