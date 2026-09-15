<!--
  [布局子组件] layout/components/SideMenu.vue —— 全局布局侧边栏
  说明：品牌 Logo + 分组菜单（总览/业务管理/数据分析/系统管理），按角色过滤菜单项
-->
<template>
  <aside class="side-menu" :class="{ 'is-collapsed': collapsed }">
    <!-- 品牌 Logo 区域 -->
    <div class="menu-logo">
      <img class="logo-icon" src="@/assets/logo.svg" alt="GreenGrid" />
      <span v-show="!collapsed" class="logo-text">新能源数据运营平台</span>
    </div>

    <!-- 分组菜单：按当前角色过滤 -->
    <a-menu mode="inline" theme="dark" :selected-keys="selectedKeys" :inline-collapsed="collapsed"
      @click="handleMenuClick">
      <a-sub-menu v-for="group in filterMenuByRole(menuGroups)" :key="group.key">
        <template #title>
          <span>
            <component :is="group.icon" />
            <span>{{ group.label }}</span>
          </span>
        </template>
        <a-menu-item v-for="item in group.children" :key="item.key">
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </aside>
</template>

<script setup lang="ts">
/* [模块] 菜单配置 + 角色过滤 + 路由跳转 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  FundOutlined,
  AppstoreOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/userStore'

defineProps<{ collapsed: boolean }>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/* 菜单配置：与路由表 roles 保持一致 */
const menuGroups = [
  {
    key: 'overview',
    label: '总览',
    icon: FundOutlined,
    roles: ['super', 'ops', 'guest'],
    children: [
      { key: '/home', label: '数据总览', roles: ['super', 'ops', 'guest'] },
      { key: '/board', label: '运营看板', roles: ['super', 'ops', 'guest'] }
    ]
  },
  {
    key: 'business',
    label: '业务管理',
    icon: AppstoreOutlined,
    roles: ['super', 'ops', 'project', 'warehouse'],
    children: [
      { key: '/project', label: '项目管理', roles: ['super', 'ops', 'project'] },
      { key: '/device', label: '设备管理', roles: ['super', 'ops', 'project'] },
      { key: '/material', label: '物料管理', roles: ['super', 'ops', 'warehouse'] }
    ]
  },
  {
    key: 'analytics',
    label: '数据分析',
    icon: BarChartOutlined,
    roles: ['super', 'ops', 'warehouse'],
    children: [
      { key: '/analytics', label: '运营分析', roles: ['super', 'ops', 'warehouse'] },
      { key: '/report', label: '数据报表', roles: ['super', 'ops'] }
    ]
  },
  {
    key: 'system',
    label: '系统管理',
    icon: SettingOutlined,
    roles: ['super'],
    children: [
      { key: '/system/user', label: '用户与权限', roles: ['super'] },
      { key: '/system/log', label: '操作日志', roles: ['super'] }
    ]
  }
]

/* 按角色过滤菜单组及其子项 */
function filterMenuByRole(groups: typeof menuGroups) {
  const role = userStore.getUserRole
  return groups
    .filter((group) => group.roles.includes(role))
    .map((group) => ({
      ...group,
      children: group.children.filter((child) => child.roles.includes(role))
    }))
    .filter((group) => group.children.length > 0)
}

/* 当前选中菜单：取路由路径 */
const selectedKeys = computed(() => [route.path])

/* 点击菜单：路由跳转 */
function handleMenuClick({ key }: { key: string }) {
  router.push(key)
}
</script>

<style lang="scss" scoped>
/* 侧边栏：深色主题，宽度可收起 */
.side-menu {
  width: $sidebar-width;
  flex-shrink: 0;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  background: #001529;
  -webkit-transition: width 0.2s ease;
  transition: width 0.2s ease;
  overflow: hidden;

  &.is-collapsed {
    width: $sidebar-collapsed;
  }
}

/* Logo 区域 */
.menu-logo {
  @include flex-center;
  height: $header-height;
  padding: 0 16px;
  -webkit-box-pack: start;
  -webkit-justify-content: flex-start;
  justify-content: flex-start;
  overflow: hidden;
  white-space: nowrap;

  .logo-icon {
    width: 28px;
    height: 28px;
    display: block;
    flex-shrink: 0;
    border-radius: 6px;
  }

  .logo-text {
    margin-left: 10px;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
  }
}

/* 菜单区域：占满剩余高度可滚动 */
:deep(.a-menu),
:deep(.ant-menu) {
  -webkit-flex: 1;
  flex: 1;
  overflow-y: auto;
}
</style>
