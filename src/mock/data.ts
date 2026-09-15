/**
 * [模拟数据] mock/data.ts —— 全局 Mock 数据源
 * 说明：按业务模块组织静态数据与趋势生成器，供 mock/index.ts 路由表调用
 */
import type {
  DeviceItem,
  LogItem,
  MaterialItem,
  OrderItem,
  ProjectItem,
  ReportItem,
  UserInfo
} from '@/types'

/* ========== 登录账号（Mock 演示账号，密码统一 123456） ========== */
export const mockAccounts = [
  {
    username: 'admin',
    password: '123456',
    user: {
      id: 1,
      username: 'admin',
      name: '张工',
      role: 'super',
      roleName: '超级管理员',
      dept: '信息中心',
      status: 1,
      lastLoginAt: '2026-09-14 18:32'
    } as UserInfo
  },
  { username: 'ops', password: '123456', user: { id: 2, username: 'ops', name: '李敏', role: 'ops', roleName: '运营管理员', dept: '运营部', status: 1, lastLoginAt: '2026-09-14 09:12' } as UserInfo },
  { username: 'warehouse', password: '123456', user: { id: 3, username: 'warehouse', name: '王强', role: 'warehouse', roleName: '仓储管理员', dept: '仓储部', status: 1, lastLoginAt: '2026-09-13 16:45' } as UserInfo },
  { username: 'project', password: '123456', user: { id: 4, username: 'project', name: '赵磊', role: 'project', roleName: '项目管理员', dept: '工程部', status: 1, lastLoginAt: '2026-09-13 11:20' } as UserInfo },
  { username: 'guest', password: '123456', user: { id: 5, username: 'guest', name: '访客', role: 'guest', roleName: '普通用户', dept: '外部', status: 1, lastLoginAt: '2026-09-12 09:00' } as UserInfo }
]

/* ========== 项目数据 ========== */
export const mockProjects: ProjectItem[] = [
  {
    id: 1,
    projectCode: 'PRJ-2026-011',
    name: '华东储能基地一期',
    region: '华东',
    manager: '李敏',
    status: '进行中',
    progress: 68,
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    updatedAt: '2026-09-14 09:12'
  },
  { id: 2, projectCode: 'PRJ-2026-009', name: '西北光伏组件仓扩建', region: '西北', manager: '王强', status: '进行中', progress: 43, startDate: '2026-05-10', endDate: '2027-02-28', updatedAt: '2026-09-13 15:40' },
  { id: 3, projectCode: 'PRJ-2026-007', name: '粤东风电运维中心', region: '华南', manager: '赵磊', status: '已暂停', progress: 80, startDate: '2025-11-20', endDate: '2026-10-31', updatedAt: '2026-09-10 10:05' },
  { id: 4, projectCode: 'PRJ-2025-021', name: '华北氢能示范站建设', region: '华北', manager: '孙倩', status: '已完成', progress: 100, startDate: '2025-04-01', endDate: '2026-06-30', updatedAt: '2026-06-30 18:00' },
  { id: 5, projectCode: 'PRJ-2026-015', name: '西南微电网改造', region: '西南', manager: '陈涛', status: '进行中', progress: 25, startDate: '2026-07-15', endDate: '2027-05-31', updatedAt: '2026-09-12 14:22' },
  { id: 6, projectCode: 'PRJ-2026-002', name: '华中新能源产业园', region: '华中', manager: '周琳', status: '进行中', progress: 57, startDate: '2026-01-08', endDate: '2026-11-30', updatedAt: '2026-09-11 16:48' },
  { id: 7, projectCode: 'PRJ-2026-018', name: '华东储能基地二期', region: '华东', manager: '李敏', status: '进行中', progress: 12, startDate: '2026-08-01', endDate: '2027-08-31', updatedAt: '2026-09-14 11:30' },
  { id: 8, projectCode: 'PRJ-2026-005', name: '东北风光互补项目', region: '东北', manager: '吴迪', status: '已暂停', progress: 35, startDate: '2026-02-20', endDate: '2027-01-31', updatedAt: '2026-08-28 09:15' },
  { id: 9, projectCode: 'PRJ-2025-018', name: '华南储能系统仓建设', region: '华南', manager: '郑阳', status: '已完成', progress: 100, startDate: '2025-06-01', endDate: '2026-04-30', updatedAt: '2026-04-30 17:20' },
  { id: 10, projectCode: 'PRJ-2026-020', name: '华北氢能储运配套', region: '华北', manager: '孙倩', status: '进行中', progress: 8, startDate: '2026-09-01', endDate: '2027-09-30', updatedAt: '2026-09-14 08:50' },
  { id: 11, projectCode: 'PRJ-2026-013', name: '西北光伏扶贫并网', region: '西北', manager: '王强', status: '进行中', progress: 74, startDate: '2026-04-12', endDate: '2026-12-15', updatedAt: '2026-09-13 19:02' },
  { id: 12, projectCode: 'PRJ-2026-016', name: '华东充电网络扩建', region: '华东', manager: '周琳', status: '进行中', progress: 46, startDate: '2026-06-20', endDate: '2027-03-31', updatedAt: '2026-09-12 13:44' }
]

/* ========== 设备数据 ========== */
export const mockDevices: DeviceItem[] = [
  { id: 1, deviceCode: 'DEV-0231', name: '组串式逆变器 110kW', type: '逆变器', projectName: '华东储能基地一期', status: '故障', installDate: '2026-03-15', lastUpdateAt: '2026-09-14 09:47' },
  { id: 2, deviceCode: 'DEV-0187', name: '风力发电机组 2.5MW', type: '风电机组', projectName: '粤东风电运维中心', status: '在线', installDate: '2025-12-08', lastUpdateAt: '2026-09-14 18:00' },
  { id: 3, deviceCode: 'DEV-0456', name: '储能变流器 PCS 500kW', type: '储能系统', projectName: '华北氢能示范站建设', status: '维护中', installDate: '2026-01-20', lastUpdateAt: '2026-09-14 16:45' },
  { id: 4, deviceCode: 'DEV-0322', name: '光伏汇流箱 16 路', type: '光伏阵列', projectName: '西北光伏组件仓扩建', status: '在线', installDate: '2026-05-30', lastUpdateAt: '2026-09-14 17:58' },
  { id: 5, deviceCode: 'DEV-0501', name: '箱式变压器 1250kVA', type: '输配电', projectName: '华中新能源产业园', status: '在线', installDate: '2026-02-11', lastUpdateAt: '2026-09-14 18:00' },
  { id: 6, deviceCode: 'DEV-0129', name: '风力发电机组 3.0MW', type: '风电机组', projectName: '东北风光互补项目', status: '离线', installDate: '2025-10-25', lastUpdateAt: '2026-09-12 06:30' },
  { id: 7, deviceCode: 'DEV-0388', name: '组串式逆变器 110kW', type: '逆变器', projectName: '西北光伏扶贫并网', status: '在线', installDate: '2026-04-18', lastUpdateAt: '2026-09-14 18:00' },
  { id: 8, deviceCode: 'DEV-0410', name: '储能电池舱 3.44MWh', type: '储能系统', projectName: '华东储能基地二期', status: '在线', installDate: '2026-08-15', lastUpdateAt: '2026-09-14 18:00' },
  { id: 9, deviceCode: 'DEV-0205', name: '光伏汇流箱 12 路', type: '光伏阵列', projectName: '华东充电网络扩建', status: '维护中', installDate: '2026-06-22', lastUpdateAt: '2026-09-13 15:10' },
  { id: 10, deviceCode: 'DEV-0277', name: '箱式变压器 800kVA', type: '输配电', projectName: '西南微电网改造', status: '故障', installDate: '2026-07-30', lastUpdateAt: '2026-09-14 08:20' },
  { id: 11, deviceCode: 'DEV-0098', name: '储能变流器 PCS 250kW', type: '储能系统', projectName: '华南储能系统仓建设', status: '在线', installDate: '2025-08-12', lastUpdateAt: '2026-09-14 18:00' },
  { id: 12, deviceCode: 'DEV-0465', name: '风力发电机组 2.5MW', type: '风电机组', projectName: '华北氢能储运配套', status: '离线', installDate: '2026-09-05', lastUpdateAt: '2026-09-14 07:15' }
]

/* ========== 物料数据 ========== */
export const mockMaterials: MaterialItem[] = [
  { id: 1, materialCode: 'MAT-0112', name: '磷酸铁锂电芯 280Ah', category: '电芯电池', spec: '3.2V / 280Ah', unit: '件', stock: 12, safetyStock: 50, status: '缺货' },
  { id: 2, materialCode: 'MAT-0087', name: '单晶硅光伏组件 550W', category: '光伏组件', spec: '182mm 半片', unit: '块', stock: 86, safetyStock: 150, status: '低库存' },
  { id: 3, materialCode: 'MAT-0203', name: 'IGBT 功率模块 1200V', category: '电气元件', spec: 'FF1200R12', unit: '个', stock: 240, safetyStock: 100, status: '正常' },
  { id: 4, materialCode: 'MAT-0056', name: '组串式逆变器 110kW', category: '电气元件', spec: 'SG110CX', unit: '台', stock: 320, safetyStock: 150, status: '正常' },
  { id: 5, materialCode: 'MAT-0158', name: '铝合金支架连接件', category: '结构件辅材', spec: 'M10 / 阳极氧化', unit: '套', stock: 145, safetyStock: 200, status: '低库存' },
  { id: 6, materialCode: 'MAT-0031', name: '磷酸铁锂电芯 100Ah', category: '电芯电池', spec: '3.2V / 100Ah', unit: '件', stock: 560, safetyStock: 200, status: '正常' },
  { id: 7, materialCode: 'MAT-0245', name: '高压线束 95mm²', category: '电气元件', spec: '4C / 耐候', unit: '卷', stock: 48, safetyStock: 60, status: '低库存' },
  { id: 8, materialCode: 'MAT-0074', name: '多晶硅光伏组件 450W', category: '光伏组件', spec: '166mm', unit: '块', stock: 610, safetyStock: 300, status: '正常' },
  { id: 9, materialCode: 'MAT-0190', name: '钢制电缆桥架', category: '结构件辅材', spec: '400×200 热镀锌', unit: '米', stock: 0, safetyStock: 80, status: '缺货' },
  { id: 10, materialCode: 'MAT-0266', name: '风电偏航制动器', category: '结构件辅材', spec: '液压式 / 2.5MW', unit: '台', stock: 175, safetyStock: 60, status: '正常' }
]

/* ========== 入库 / 出库单数据 ========== */
export const mockInboundOrders: OrderItem[] = [
  { id: 1, orderNo: 'RK202609140046', materialName: '磷酸铁锂电芯 280Ah', quantity: 200, target: '华东一号仓', operator: '张工', time: '2026-09-14 10:24' },
  { id: 2, orderNo: 'RK202609140041', materialName: '单晶硅光伏组件 550W', quantity: 150, target: '西北光伏组件仓', operator: '王强', time: '2026-09-14 09:05' },
  { id: 3, orderNo: 'RK202609130038', materialName: 'IGBT 功率模块 1200V', quantity: 80, target: '华东一号仓', operator: '李敏', time: '2026-09-13 16:40' },
  { id: 4, orderNo: 'RK202609130035', materialName: '铝合金支架连接件', quantity: 300, target: '华南储能系统仓', operator: '郑阳', time: '2026-09-13 14:02' },
  { id: 5, orderNo: 'RK202609120031', materialName: '组串式逆变器 110kW', quantity: 40, target: '华东一号仓', operator: '张工', time: '2026-09-12 11:20' },
  { id: 6, orderNo: 'RK202609120028', materialName: '高压线束 95mm²', quantity: 60, target: '西北光伏组件仓', operator: '王强', time: '2026-09-12 09:48' }
]

export const mockOutboundOrders: OrderItem[] = [
  { id: 1, orderNo: 'CK202609140029', materialName: '单晶硅光伏组件 550W', quantity: 120, target: '西北光伏扶贫并网', operator: '王强', time: '2026-09-14 11:10' },
  { id: 2, orderNo: 'CK202609140027', materialName: '磷酸铁锂电芯 280Ah', quantity: 90, target: '华东储能基地一期', operator: '张工', time: '2026-09-14 08:36' },
  { id: 3, orderNo: 'CK202609130024', materialName: '组串式逆变器 110kW', quantity: 25, target: '华东储能基地二期', operator: '李敏', time: '2026-09-13 17:22' },
  { id: 4, orderNo: 'CK202609130021', materialName: '钢制电缆桥架', quantity: 200, target: '华中新能源产业园', operator: '周琳', time: '2026-09-13 13:15' },
  { id: 5, orderNo: 'CK202609120019', materialName: '风电偏航制动器', quantity: 12, target: '粤东风电运维中心', operator: '赵磊', time: '2026-09-12 15:50' },
  { id: 6, orderNo: 'CK202609120016', materialName: 'IGBT 功率模块 1200V', quantity: 35, target: '华北氢能示范站建设', operator: '孙倩', time: '2026-09-12 10:08' }
]

/* ========== 报表数据 ========== */
export const mockReports: ReportItem[] = [
  { id: 1, type: '运营汇总', name: '月度运营汇总报表 2026-08', status: '已生成', createdAt: '2026-09-01 08:00', creator: '系统' },
  { id: 2, type: '库存分析', name: '库存周报 W37', status: '已生成', createdAt: '2026-09-07 18:00', creator: '系统' },
  { id: 3, type: '设备分析', name: '设备故障月报 2026-08', status: '已生成', createdAt: '2026-09-01 09:30', creator: '系统' },
  { id: 4, type: '物料分析', name: '物料消耗季报 Q3', status: '生成中', createdAt: '2026-09-14 18:00', creator: '李敏' },
  { id: 5, type: '运营汇总', name: '入库单月度汇总 2026-08', status: '已生成', createdAt: '2026-09-02 10:15', creator: '系统' },
  { id: 6, type: '设备分析', name: '设备利用率周报 W36', status: '已生成', createdAt: '2026-08-31 18:00', creator: '系统' }
]

/* ========== 操作日志数据 ========== */
export const mockLogs: LogItem[] = [
  { id: 1, operator: '李敏', module: '项目管理', action: '更新', content: '更新项目「华东储能基地一期」进度至 68%', ip: '10.12.8.34', createdAt: '2026-09-14 18:32' },
  { id: 2, operator: '系统', module: '仓储管理', action: '新增', content: '系统自动生成入库单 RK202609140046（华东一号仓）', ip: '10.0.1.15', createdAt: '2026-09-14 17:58' },
  { id: 3, operator: '王强', module: '设备管理', action: '维护', content: '提交设备 DEV-0456 维护工单（储能变流器 PCS 500kW）', ip: '10.12.9.102', createdAt: '2026-09-14 16:45' },
  { id: 4, operator: '张工', module: '系统管理', action: '删除', content: '删除过期角色「临时审核员」', ip: '10.12.8.11', createdAt: '2026-09-14 15:20' },
  { id: 5, operator: '张工', module: '系统管理', action: '登录', content: '账号 admin 登录平台成功', ip: '10.12.8.11', createdAt: '2026-09-14 14:02' },
  { id: 6, operator: '郑阳', module: '物料管理', action: '新增', content: '新增物料「钢制电缆桥架 400×200」并录入安全库存', ip: '10.12.6.88', createdAt: '2026-09-14 11:36' },
  { id: 7, operator: '李敏', module: '项目管理', action: '新增', content: '创建项目「华东储能基地二期」（PRJ-2026-018）', ip: '10.12.8.34', createdAt: '2026-09-13 10:24' },
  { id: 8, operator: '王强', module: '仓储管理', action: '更新', content: '入库单 RK202609130038 完成验收复核', ip: '10.12.9.102', createdAt: '2026-09-13 17:02' }
]

/* ========== 趋势序列生成器（确定性伪随机，保证数据稳定） ========== */
function createRandom(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

/* 生成近 N 日入出库趋势 */
export function getTrendSeries(days: number) {
  const random = createRandom(20260914)
  const dates: string[] = []
  const inbound: number[] = []
  const outbound: number[] = []
  const now = new Date('2026-09-14T00:00:00')
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 86400000)
    dates.push(`${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`)
    inbound.push(Math.round(32 + random() * 26))
    outbound.push(Math.round(28 + random() * 22))
  }
  /* 末位对齐设计稿数值 */
  inbound[days - 1] = 46
  outbound[days - 1] = 39
  return { dates, inbound, outbound }
}

/* 生成近 24 小时产能与吞吐趋势 */
export function getHourlySeries() {
  const random = createRandom(914)
  const hours: string[] = []
  const power: number[] = []
  const orders: number[] = []
  for (let h = 0; h < 24; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
    const curve = Math.sin(((h - 6) / 24) * Math.PI) // 白天高、夜间低的发电曲线
    power.push(Math.max(0.4, Number((curve * 8 + random() * 1.2).toFixed(1))))
    orders.push(h > 20 || h < 6 ? Math.round(random() * 2) : Math.round(2 + random() * 6))
  }
  return { hours, power, orders }
}
