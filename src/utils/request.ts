/**
 * [请求封装] utils/request.ts —— 全局
 * 说明：Axios 实例、Token 注入、响应拦截与统一错误提示；
 *      自定义适配器优先分发到本地 Mock 接口，未命中再回退真实请求
 */
import axios from 'axios'
import { message } from 'ant-design-vue'
import { matchMockHandler } from '@/mock'

/* ========== 创建实例 ========== */
const instance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

/* ========== 请求拦截：注入登录 Token ========== */
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('gg_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ========== 响应拦截：剥离包装层，统一错误提示 ========== */
instance.interceptors.response.use(
  (res) => {
    const { code, data, message: msg } = res.data || {}
    if (code === 0) return data
    message.error(msg || '请求失败')
    return Promise.reject(new Error(msg || '请求失败'))
  },
  (err) => {
    message.error(err?.message || '网络异常，请稍后重试')
    return Promise.reject(err)
  }
)

/* ========== Mock 适配器：命中本地模拟接口则直接返回 ========== */
instance.defaults.adapter = async (config) => {
  const mock = matchMockHandler(String(config.method || 'get').toLowerCase(), config.url || '')
  if (mock) {
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data
    const result = mock.handler.resolve({ query: mock.query, body: body || {}, id: mock.id })
    await new Promise((resolve) => setTimeout(resolve, 300)) // 模拟网络延迟
    return {
      data: result,
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    } as any
  }
  /* 未命中 Mock：走不携带 Mock 适配器的备用实例（真实请求） */
  return fallbackInstance.request(config)
}

/* 备用实例：与主实例同配置，但无 Mock 适配器，避免递归 */
const fallbackInstance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

/* ========== 类型化导出：调用侧可直接声明返回数据类型 ========== */
const http = {
  get: <T = any>(url: string, params?: Record<string, any>) =>
    instance.get(url, { params }) as unknown as Promise<T>,
  post: <T = any>(url: string, data?: Record<string, any>) =>
    instance.post(url, data) as unknown as Promise<T>,
  put: <T = any>(url: string, data?: Record<string, any>) =>
    instance.put(url, data) as unknown as Promise<T>,
  delete: <T = any>(url: string, params?: Record<string, any>) =>
    instance.delete(url, { params }) as unknown as Promise<T>
}

export default http
