/**
 * [工程配置] vite.config.ts —— 全局构建配置
 * 说明：Vue 插件、@ 别名、Ant Design Vue 按需自动引入、SCSS 全局变量注入、
 *      部署基础路径（GitHub Pages 子路径）、分包优化
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

/* 部署基础路径：GitHub Pages 项目站点为 /<仓库名>/，本地开发为 / */
const GITHUB_PAGES_BASE = '/New-Energy-Platform/'

export default defineConfig(({ command }) => ({
  /* 基础路径：构建时使用 Pages 子路径，开发服务器保持根路径 */
  base: command === 'build' ? GITHUB_PAGES_BASE : '/',

  /* 插件：Vue 单文件组件 + Ant Design Vue 按需引入（v4 为 cssinjs 主题，无需额外样式导入） */
  plugins: [
    vue(),
    AutoImport({
      imports: [],
      resolvers: [AntDesignVueResolver({ importStyle: false })],
      dts: false
    }),
    Components({
      resolvers: [AntDesignVueResolver({ importStyle: false })],
      dts: false
    })
  ],

  /* 路径别名：@ 指向 src 目录 */
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  /* SCSS 模块化：全局注入变量与 mixin，业务样式无需重复引入 */
  css: {
    preprocessorOptions: {
      scss: {
        additionalData:
          '@use "@/styles/variables" as *;\n@use "@/styles/mixins" as *;\n'
      }
    }
  },

  /* 构建优化：大依赖分包，提升缓存命中率与首屏性能 */
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia', 'axios'],
          antd: ['ant-design-vue'],
          charts: ['echarts'],
          anim: ['gsap']
        }
      }
    }
  },

  server: {
    port: 5180,
    open: false
  }
}))
