<!--
  [全局布局] layout/BasicLayout.vue —— 所有登录后的页面
  说明：侧边栏（可收起）+ 顶部栏（面包屑/用户信息）+ 内容区路由出口
-->
<template>
  <div class="basic-layout">
    <!-- 侧边栏：菜单分组导航 -->
    <SideMenu :collapsed="collapsed" />

    <!-- 右侧主区域 -->
    <div class="layout-main">
      <!-- 顶部栏：收起按钮 + 面包屑 + 用户操作 -->
      <TopHeader :collapsed="collapsed" @toggleCollapsed="toggleCollapsed" />

      <!-- 内容区：路由出口 -->
      <main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
/* [模块] 布局状态：侧边栏收起/展开 + 小屏自适应 */
import { onMounted, onUnmounted, ref } from 'vue'
import SideMenu from './components/SideMenu.vue'
import TopHeader from './components/TopHeader.vue'

/* 移动端断点：与登录页 <768px 规则保持一致 */
const MOBILE_BREAKPOINT = 768

const collapsed = ref(false)

/* 切换侧边栏收起状态（顶栏按钮触发） */
function toggleCollapsed() {
  collapsed.value = !collapsed.value
}

/* 初始化收起状态：屏幕小于 768px 自动收起侧边栏 */
function initCollapsedState() {
  collapsed.value = window.innerWidth < MOBILE_BREAKPOINT
}

/* 监听窗口尺寸变化：跨过 768px 断点时同步收起/展开 */
function handleWindowResize() {
  collapsed.value = window.innerWidth < MOBILE_BREAKPOINT
}

onMounted(() => {
  initCollapsedState()
  window.addEventListener('resize', handleWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<style lang="scss" scoped>
/* 布局容器：侧栏 + 主区 左右结构 */
.basic-layout {
  display: -webkit-flex;
  display: flex;
  height: 100%;
}

.layout-main {
  -webkit-flex: 1;
  flex: 1;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  min-width: 0; /* 防止表格撑破布局 */
}

/* 内容区：24px 内边距（PRD 规范），超出滚动 */
.layout-content {
  -webkit-flex: 1;
  flex: 1;
  padding: $content-padding;
  overflow-y: auto;
}
</style>
