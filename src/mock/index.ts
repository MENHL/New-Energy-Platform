/**
 * [Mock 路由] mock/index.ts —— 全局
 * 说明：Mock 接口路由表（方法 + 路径匹配），模拟 300ms 网络延迟；
 *      支持列表筛选分页、详情、增删改等常用接口形态
 */
import type { ListQuery } from '@/types'
import {
  getHourlySeries,
  getTrendSeries,
  mockAccounts,
  mockDevices,
  mockInboundOrders,
  mockLogs,
  mockMaterials,
  mockOutboundOrders,
  mockProjects,
  mockReports
} from './data'

/* ========== 类型：Mock 处理器 ========== */
export interface MockContext {
  query: Record<string, string>
  body: Record<string, any>
  id?: string
}
interface MockHandler {
  method: 'get' | 'post' | 'put' | 'delete'
  url: string
  resolve: (ctx: MockContext) => { code: number; data?: any; message?: string }
}

/* ========== 通用工具 ========== */

/* 分页 + 关键词/字段过滤（status、region、category 等查询字段通用过滤） */
function paginateList<T extends Record<string, any>>(list: T[], query: ListQuery) {
  const keyword = String(query.keyword || '').trim()
  const page = Number(query.page || 1)
  const pageSize = Number(query.pageSize || 10)
  /* 字段过滤：跳过分页与关键词参数，其余字段按包含关系匹配 */
  let filtered = list
  for (const [key, value] of Object.entries(query)) {
    if (!value || ['page', 'pageSize', 'keyword'].includes(key)) continue
    filtered = filtered.filter((item) => String(item[key]).includes(String(value)))
  }
  if (keyword) {
    filtered = filtered.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(keyword.toLowerCase())
    )
  }
  return {
    list: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length
  }
}

/* 自增 ID */
let nextId = 1000
function createId() {
  return ++nextId
}

/* ========== 首页 / 数据总览 ========== */
const dashboardOverview = {
  kpis: [
    { label: '在建项目', value: 24, unit: '个', remark: '较上周 +2', trend: 1 },
    { label: '运行设备', value: 358, unit: '台', remark: '在线率 92.4%', trend: 1 },
    { label: '物料品类', value: 126, unit: '种', remark: '与昨日持平', trend: 0 },
    { label: '今日入库', value: 46, unit: '单', remark: '环比 +12.3%', trend: 1 },
    { label: '今日出库', value: 39, unit: '单', remark: '环比 -4.9%', trend: -1 },
    { label: '库存预警', value: 8, unit: '项', remark: '其中缺货 2 项', trend: -1 }
  ],
  trend: getTrendSeries(7),
  deviceStatus: {
    total: 358,
    items: [
      { name: '在线运行', value: 330 },
      { name: '离线', value: 14 },
      { name: '故障', value: 8 },
      { name: '维护中', value: 6 }
    ]
  },
  topProjects: [
    { rank: 1, name: '华东储能基地一期', amount: 1286 },
    { rank: 2, name: '西北光伏组件仓', amount: 1102 },
    { rank: 3, name: '粤东风电运维', amount: 954 },
    { rank: 4, name: '华中新能源产业园', amount: 871 },
    { rank: 5, name: '华北氢能示范站', amount: 756 }
  ],
  warnings: [
    { id: 1, name: '磷酸铁锂电芯 280Ah', spec: '3.2V/280Ah', stock: 12, safetyStock: 50, level: '缺货' },
    { id: 2, name: '单晶硅光伏组件 550W', spec: '182mm 半片', stock: 86, safetyStock: 150, level: '低库存' },
    { id: 3, name: 'IGBT 功率模块 1200V', spec: 'FF1200R12', stock: 34, safetyStock: 60, level: '低库存' }
  ],
  activities: [
    { id: 1, content: '张工 完成入库单 RK202609140046（磷酸铁锂电芯 280Ah × 200），仓库：华东一号仓', time: '10:24' },
    { id: 2, content: '设备 DEV-0231（逆变器）上报故障代码 E-07，已自动生成维护工单', time: '09:47' },
    { id: 3, content: '李敏 更新项目「华东储能基地一期」进度至 68%，里程碑：并网前调试', time: '09:12' },
    { id: 4, content: '物料「单晶硅光伏组件 550W」库存低于安全库存，触发补货预警', time: '08:35' }
  ]
}

/* ========== 运营看板 ========== */
const boardSummary = {
  kpis: [
    { label: '今日发电量', value: 128.6, unit: '万kWh', remark: '环比 +4.2%', trend: 1 },
    { label: '设备综合利用率', value: 91.8, unit: '%', remark: '环比 +1.6%', trend: 1 },
    { label: '今日出入库吞吐', value: 85, unit: '单', remark: '环比 +9.1%', trend: 1 },
    { label: '活跃预警', value: 5, unit: '项', remark: '设备 2 · 库存 3', trend: -1 }
  ],
  hourly: getHourlySeries(),
  warehouses: [
    { name: '华东一号仓', usage: 82 },
    { name: '西北光伏组件仓', usage: 64 },
    { name: '华南储能系统仓', usage: 45 }
  ],
  deviceTypes: [
    { name: '风电机组', usage: 88 },
    { name: '光伏阵列', usage: 92 },
    { name: '储能系统', usage: 76 },
    { name: '输配电', usage: 84 }
  ],
  todos: [
    { id: 1, content: '处理设备 DEV-0231 故障工单', level: '紧急' },
    { id: 2, content: '审批入库单 RK202609140048', level: '今日' },
    { id: 3, content: '补货审批：单晶硅光伏组件 550W', level: '今日' },
    { id: 4, content: '复核 8 月运营汇总报表', level: '本周' }
  ]
}

/* ========== 运营分析 ========== */
function buildAnalytics(range: number) {
  const trend = getTrendSeries(range)
  return {
    inboundRate: '+8.6%',
    outboundRate: '-3.2%',
    inboundTrend: trend,
    outboundTrend: trend,
    stockStructure: {
      total: 12480,
      items: [
        { name: '电芯电池', value: 6739 },
        { name: '光伏组件', value: 2621 },
        { name: '电气元件', value: 1747 },
        { name: '结构件辅材', value: 1373 }
      ]
    },
    materialRank: [
      { rank: 1, name: '磷酸铁锂电芯 280Ah', amount: 8420 },
      { rank: 2, name: '单晶硅光伏组件 550W', amount: 7150 },
      { rank: 3, name: '组串式逆变器 110kW', amount: 5680 },
      { rank: 4, name: 'IGBT 功率模块 1200V', amount: 4410 },
      { rank: 5, name: '铝合金支架连接件', amount: 3520 }
    ]
  }
}

/* ========== Mock 路由表 ========== */
const ok = (data?: any) => ({ code: 0, data })
const fail = (message: string) => ({ code: 1, message })

export const mockHandlers: MockHandler[] = [
  /* ---- 认证 ---- */
  {
    method: 'post',
    url: '/auth/login',
    resolve: ({ body }) => {
      const hit = mockAccounts.find(
        (acc) => acc.username === body.username && acc.password === body.password
      )
      return hit ? ok({ token: `mock-token-${hit.user.id}-${Date.now()}`, user: hit.user }) : fail('账号或密码错误')
    }
  },

  /* ---- 首页 / 看板 / 分析 ---- */
  { method: 'get', url: '/dashboard/overview', resolve: () => ok(dashboardOverview) },
  { method: 'get', url: '/board/summary', resolve: () => ok(boardSummary) },
  { method: 'get', url: '/analytics/summary', resolve: ({ query }) => ok(buildAnalytics(Number(query.range || 30))) },

  /* ---- 项目管理 ---- */
  { method: 'get', url: '/projects', resolve: ({ query }) => ok(paginateList(mockProjects, query)) },
  {
    method: 'get',
    url: '/projects',
    resolve: ({ id }) => {
      const project = mockProjects.find((item) => String(item.id) === id)
      return project
        ? ok({ ...project, devices: mockDevices.filter((d) => d.projectName === project.name) })
        : fail('项目不存在或已被删除')
    }
  },
  {
    method: 'post',
    url: '/projects',
    resolve: ({ body }) => {
      mockProjects.unshift({ id: createId(), updatedAt: '2026-09-14 19:00', status: '进行中', progress: 0, ...body })
      return ok()
    }
  },
  {
    method: 'put',
    url: '/projects',
    resolve: ({ id, body }) => {
      const project = mockProjects.find((item) => String(item.id) === id)
      if (project) Object.assign(project, body, { updatedAt: '2026-09-14 19:00' })
      return project ? ok() : fail('项目不存在')
    }
  },
  {
    method: 'delete',
    url: '/projects',
    resolve: ({ id }) => {
      const index = mockProjects.findIndex((item) => String(item.id) === id)
      if (index < 0) return fail('项目不存在')
      mockProjects.splice(index, 1)
      return ok()
    }
  },

  /* ---- 设备管理 ---- */
  { method: 'get', url: '/devices', resolve: ({ query }) => ok(paginateList(mockDevices, query)) },
  {
    method: 'get',
    url: '/devices',
    resolve: ({ id }) => {
      const device = mockDevices.find((item) => String(item.id) === id)
      if (!device) return fail('设备不存在')
      const random = (seed: number) => Array.from({ length: 12 }, (_, i) => Math.round(60 + Math.abs(Math.sin(i * seed)) * 35))
      return ok({ ...device, metrics: { times: Array.from({ length: 12 }, (_, i) => `${i * 2}:00`), load: random(1.7), temp: random(2.3) } })
    }
  },
  {
    method: 'put',
    url: '/devices',
    resolve: ({ id, body }) => {
      const device = mockDevices.find((item) => String(item.id) === id)
      if (device) Object.assign(device, body, { lastUpdateAt: '2026-09-14 19:00' })
      return device ? ok() : fail('设备不存在')
    }
  },
  {
    method: 'delete',
    url: '/devices',
    resolve: ({ id }) => {
      const index = mockDevices.findIndex((item) => String(item.id) === id)
      if (index < 0) return fail('设备不存在')
      mockDevices.splice(index, 1)
      return ok()
    }
  },

  /* ---- 物料管理（详情含出入库追溯记录） ---- */
  { method: 'get', url: '/materials', resolve: ({ query }) => ok(paginateList(mockMaterials, query)) },
  {
    method: 'get',
    url: '/materials',
    resolve: ({ id }) => {
      const material = mockMaterials.find((item) => String(item.id) === id)
      return material
        ? ok({
            ...material,
            inboundRecords: mockInboundOrders.filter((o) => o.materialName === material.name),
            outboundRecords: mockOutboundOrders.filter((o) => o.materialName === material.name)
          })
        : fail('物料不存在')
    }
  },
  {
    method: 'post',
    url: '/materials',
    resolve: ({ body }) => {
      const stock = Number(body.stock || 0)
      const safetyStock = Number(body.safetyStock || 0)
      mockMaterials.unshift({
        id: createId(),
        status: stock === 0 ? '缺货' : stock < safetyStock ? '低库存' : '正常',
        ...body,
        stock,
        safetyStock
      })
      return ok()
    }
  },
  {
    method: 'put',
    url: '/materials',
    resolve: ({ id, body }) => {
      const material = mockMaterials.find((item) => String(item.id) === id)
      if (!material) return fail('物料不存在')
      Object.assign(material, body)
      material.status = material.stock === 0 ? '缺货' : material.stock < material.safetyStock ? '低库存' : '正常'
      return ok()
    }
  },
  {
    method: 'delete',
    url: '/materials',
    resolve: ({ id }) => {
      const index = mockMaterials.findIndex((item) => String(item.id) === id)
      if (index < 0) return fail('物料不存在')
      mockMaterials.splice(index, 1)
      return ok()
    }
  },

  /* ---- 数据报表 ---- */
  { method: 'get', url: '/reports', resolve: ({ query }) => ok(paginateList(mockReports, query)) },
  {
    method: 'post',
    url: '/reports',
    resolve: ({ body }) => {
      mockReports.unshift({ id: createId(), status: '生成中', createdAt: '2026-09-14 19:00', creator: '李敏', ...body })
      return ok()
    }
  },
  {
    method: 'put',
    url: '/reports',
    resolve: ({ id, body }) => {
      const report = mockReports.find((item) => String(item.id) === id)
      if (report) Object.assign(report, body)
      return report ? ok() : fail('报表不存在')
    }
  },
  {
    method: 'delete',
    url: '/reports',
    resolve: ({ id }) => {
      const index = mockReports.findIndex((item) => String(item.id) === id)
      if (index < 0) return fail('报表不存在')
      mockReports.splice(index, 1)
      return ok()
    }
  },

  /* ---- 用户与权限 ---- */
  { method: 'get', url: '/system/users', resolve: ({ query }) => ok(paginateList(mockAccounts.map((a) => a.user), query)) },
  {
    method: 'post',
    url: '/system/users',
    resolve: ({ body }) => {
      mockAccounts.push({
        username: body.username,
        password: '123456',
        user: { id: createId(), lastLoginAt: '—', status: 1, ...body }
      })
      return ok()
    }
  },
  {
    method: 'put',
    url: '/system/users',
    resolve: ({ id, body }) => {
      const account = mockAccounts.find((acc) => String(acc.user.id) === id)
      if (account) Object.assign(account.user, body)
      return account ? ok() : fail('用户不存在')
    }
  },
  {
    method: 'delete',
    url: '/system/users',
    resolve: ({ id }) => {
      const index = mockAccounts.findIndex((acc) => String(acc.user.id) === id)
      if (index < 0) return fail('用户不存在')
      mockAccounts.splice(index, 1)
      return ok()
    }
  },

  /* ---- 操作日志 ---- */
  { method: 'get', url: '/system/logs', resolve: ({ query }) => ok(paginateList(mockLogs, query)) }
]

/* ========== 匹配器：按 方法 + 路径段 匹配处理器（支持 /xxx/:id 形态） ========== */
export function matchMockHandler(method: string, url: string) {
  const [path, queryStr = ''] = url.split('?')
  const segments = path.split('/').filter(Boolean)
  /* 两轮匹配：先精确匹配集合路径，再反向匹配 /xxx/:id 详情路径 */
  for (const withId of [false, true]) {
    const ordered = withId ? [...mockHandlers].reverse() : mockHandlers
    for (const handler of ordered) {
      if (handler.method !== method) continue
      const parts = handler.url.split('/').filter(Boolean)
      if (segments.length !== parts.length + (withId ? 1 : 0)) continue
      if (!parts.every((part, i) => part === segments[i])) continue
      return {
        handler,
        id: withId ? segments[parts.length] : undefined,
        query: Object.fromEntries(new URLSearchParams(queryStr))
      }
    }
  }
  return null
}
