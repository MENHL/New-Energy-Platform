/**
 * [类型定义] types/index.ts —— 全局
 * 说明：业务实体与分页查询的 TypeScript 类型（对应 PRD 第 7 节数据模型）
 */

/* 用户信息 */
export interface UserInfo {
  id: number
  username: string
  name: string
  role: string // super | ops | warehouse | project | guest
  roleName: string
  dept: string
  status: 0 | 1 // 1 启用 / 0 禁用
  lastLoginAt: string
}

/* 项目 */
export interface ProjectItem {
  id: number
  projectCode: string
  name: string
  region: string
  manager: string
  status: '进行中' | '已暂停' | '已完成'
  progress: number
  startDate: string
  endDate: string
  updatedAt: string
}

/* 设备 */
export interface DeviceItem {
  id: number
  deviceCode: string
  name: string
  type: string
  projectName: string
  status: '在线' | '离线' | '故障' | '维护中'
  installDate: string
  lastUpdateAt: string
}

/* 物料 */
export interface MaterialItem {
  id: number
  materialCode: string
  name: string
  category: string
  spec: string
  unit: string
  stock: number
  safetyStock: number
  status: '正常' | '低库存' | '缺货'
}

/* 入库 / 出库单（target：入库=仓库，出库=去向） */
export interface OrderItem {
  id: number
  orderNo: string
  materialName: string
  quantity: number
  target: string
  operator: string
  time: string
}

/* 数据报表 */
export interface ReportItem {
  id: number
  type: string
  name: string
  status: '已生成' | '生成中'
  createdAt: string
  creator: string
}

/* 操作日志 */
export interface LogItem {
  id: number
  operator: string
  module: string
  action: '新增' | '更新' | '删除' | '维护' | '登录'
  content: string
  ip: string
  createdAt: string
}

/* 分页结果 */
export interface PageResult<T> {
  list: T[]
  total: number
}

/* 通用列表查询参数 */
export interface ListQuery {
  page?: number
  pageSize?: number
  keyword?: string
  [key: string]: string | number | undefined
}
