<!--
  [根组件] App.vue —— 全局
  说明：国际化配置 + 路由出口容器（页面切换过渡动画）
-->
<template>
  <!-- 全局主题：品牌绿主色（GreenGrid）+ 中文国际化 -->
  <a-config-provider
    :locale="zhCN"
    :theme="{ token: { colorPrimary: '#16a34a', borderRadius: 6 } }"
  >
    <router-view v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </a-config-provider>
</template>

<script setup lang="ts">
/* [模块] 全局国际化配置 */
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>
