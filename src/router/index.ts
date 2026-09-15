/**
 * [路由配置] router/index.ts —— 全局
 * 说明：路由表（页面懒加载）、登录守卫、角色权限控制与页面标题设置
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/userStore'

/* 角色常量：super 超级管理员 / ops 运营 / warehouse 仓储 / project 项目 / guest 普通 */
export type RoleKey = 'super' | 'ops' | 'warehouse' | 'project' | 'guest'

/* 路由表：业务页面全部懒加载，按需加载提升首屏性能 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: {
      title: '登录',
      free: true
    }
  },
  {
    path: '/',
    component: () => import('@/layout/BasicLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/dashboard/HomeView.vue'),
        meta: {
          title: '数据总览',
          roles: ['super', 'ops', 'guest']
        }
      },
      {
        path: 'board',
        name: 'board',
        component: () => import('@/views/board/BoardView.vue'),
        meta: {
          title: '运营看板',
          roles: ['super', 'ops', 'guest']
        }
      },
      {
        path: 'project',
        name: 'project',
        component: () => import('@/views/project/ProjectList.vue'),
        meta: {
          title: '项目管理',
          roles: ['super', 'ops', 'project']
        }
      },
      {
        path: 'device',
        name: 'device',
        component: () => import('@/views/device/DeviceList.vue'),
        meta: {
          title: '设备管理',
          roles: ['super', 'ops', 'project']

        }
      },
      {
        path: 'material',
        name: 'material',
        component: () => import('@/views/material/MaterialList.vue'),
        meta: {
          title: '物料管理',
          roles: ['super', 'ops', 'warehouse']
        }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('@/views/analytics/AnalyticsView.vue'),
        meta: {
          title: '运营分析',
          roles: ['super', 'ops', 'warehouse']
        }
      },
      {
        path: 'report',
        name: 'report',
        component: () => import('@/views/report/ReportList.vue'),
        meta: {
          title: '数据报表',
          roles: ['super', 'ops']
        }
      },
      {
        path: 'system/user',
        name: 'systemUser',
        component: () => import('@/views/system/UserManage.vue'),
        meta: {
          title: '用户与权限',
          roles: ['super']
        }
      },
      {
        path: 'system/log',
        name: 'systemLog',
        component: () => import('@/views/system/LogList.vue'),
        meta: {
          title: '操作日志',
          roles: ['super']
        }
      }
    ]
  },
  /* 兜底：未知路径回首页 */
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  /* 基础路径跟随 Vite base：GitHub Pages 子路径部署时保持路由与资源路径一致 */
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/* 全局守卫：登录校验 → 角色权限校验 → 设置页面标题 */
router.beforeEach((to) => {
  const userStore = useUserStore()
  const hasToken = Boolean(userStore.getUserToken)

  /* 未登录：跳转登录页并携带回跳地址 */
  if (!hasToken && !to.meta.free) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  /* 已登录访问登录页：直接进入首页 */
  if (hasToken && to.name === 'login') {
    return { path: '/' }
  }
  /* 角色权限：无权限时回首页并提示 */
  const roles = to.meta.roles as RoleKey[] | undefined
  if (hasToken && roles && !roles.includes(userStore.getUserRole as RoleKey)) {
    message.warning('暂无该页面访问权限，请联系管理员')
    return { path: '/home' }
  }
  /* 更新页面标题 */
  document.title = to.meta.title
    ? `${to.meta.title} - GreenGrid 新能源运营平台`
    : 'GreenGrid 新能源运营平台'
})

/* 导出路由安装函数 */
export function setupRouter() {
  return router
}
