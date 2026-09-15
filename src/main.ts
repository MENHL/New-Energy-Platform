/**
 * [应用入口] main.ts —— 全局
 * 说明：创建 Vue 应用，注册 Pinia 状态管理、Router 路由与全局样式
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setupRouter } from './router'
import '@/styles/base.scss'
import '@/mock' // 引入 Mock 模块，注册模拟接口数据

createApp(App).use(createPinia()).use(setupRouter()).mount('#app')
