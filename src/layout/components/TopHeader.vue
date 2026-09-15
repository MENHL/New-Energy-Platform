<!--
  [布局子组件] layout/components/TopHeader.vue —— 全局布局顶部栏
  说明：侧栏收起按钮、面包屑导航、消息通知与用户下拉操作（退出登录）
-->
<template>
  <header class="top-header">
    <!-- 左侧：收起按钮 + 面包屑 -->
    <div class="header-left">
      <MenuFoldOutlined v-if="!collapsed" class="collapse-btn" @click="emit('toggleCollapsed')" />
      <MenuUnfoldOutlined v-else class="collapse-btn" @click="emit('toggleCollapsed')" />
      <a-breadcrumb>
        <a-breadcrumb-item>首页</a-breadcrumb-item>
        <a-breadcrumb-item v-for="crumb in breadcrumbItems" :key="crumb">
          {{ crumb }}
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 右侧：消息 + 用户下拉 -->
    <div class="header-right">
      <a-badge :count="5" size="small">
        <BellOutlined class="header-icon" />
      </a-badge>

      <a-dropdown>
        <div class="user-info">
          <a-avatar :size="30" style="background-color: #16a34a">
            {{ userStore.getUserName.slice(0, 1) }}
          </a-avatar>
          <div class="user-meta">
            <span class="user-name">{{ userStore.getUserName }}</span>
            <span class="user-role">{{ userStore.getUserRoleName }}</span>
          </div>
        </div>
        <template #overlay>
          <a-menu @click="handleUserAction">
            <a-menu-item key="logout">
              <LogoutOutlined />
              <span style="margin-left: 8px">退出登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
/* [模块] 面包屑 + 用户退出 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/userStore'

// 定义组件的属性，接收一个 collapsed 布尔值类型的属性
const props = defineProps<{ collapsed: boolean }>()
// 定义组件的事件，用于触发折叠状态切换事件
const emit = defineEmits<{ (e: 'toggleCollapsed'): void }>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/* 面包屑：优先使用路由 meta.title（与设计稿“首页 / xxx”一致） */
// 使用computed属性创建一个响应式的面包屑项数组
const breadcrumbItems = computed(() =>
  // 将路由元信息中的title转换为字符串，如果不存在则使用空字符串
  String(route.meta.title || '')
    .split(' / ')
    .filter(Boolean)
)

/* 用户操作：退出登录 */
function handleUserAction({ key }: { key: string }) {
  if (key !== 'logout') return
  userStore.removeLoginState()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
/* 顶部栏：64px 高（PRD 规范），白底分割线 */
.top-header {
  @include flex-between;
  height: $header-height;
  padding: 0 20px;
  background: $color-bg-card;
  border-bottom: 1px solid $color-border;
}

.header-left {
  @include flex-between;
  -webkit-box-pack: start;
  -webkit-justify-content: flex-start;
  justify-content: flex-start;

  .collapse-btn {
    margin-right: 16px;
    font-size: 17px;
    cursor: pointer;
    color: $color-text-secondary;
  }
}

.header-right {
  @include flex-between;

  .header-icon {
    font-size: 17px;
    color: $color-text-secondary;
    cursor: pointer;
  }
}

/* 用户信息：头像 + 姓名/角色 */
.user-info {
  @include flex-between;
  margin-left: 24px;
  padding: 4px 8px;
  border-radius: $radius-sm;
  cursor: pointer;
  -webkit-transition: background 0.2s ease;
  transition: background 0.2s ease;

  &:hover {
    background: $color-bg-hover;
  }

  .user-meta {
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    margin-left: 8px;
    line-height: 1.3;

    .user-name {
      font-size: 13px;
      font-weight: 500;
    }

    .user-role {
      font-size: 11px;
      color: $color-text-weak;
    }
  }
}
</style>
