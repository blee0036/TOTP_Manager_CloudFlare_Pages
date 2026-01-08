import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    // PWA 插件配置
    // 需求: 12.4
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'TOTP Manager',
        short_name: 'TOTP',
        description: 'Time-based One-Time Password Manager',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // 缓存策略配置
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // 运行时缓存配置
        runtimeCaching: [
          {
            // 缓存 API 请求（网络优先）
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 小时
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // 缓存 Google Fonts（缓存优先）
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 年
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // 缓存 Google Fonts 字体文件（缓存优先）
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 年
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // 缓存图片（缓存优先）
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 天
              },
            },
          },
        ],
        // 清理过期缓存
        cleanupOutdatedCaches: true,
        // 跳过等待，立即激活新的 Service Worker
        skipWaiting: true,
        // 立即控制所有客户端
        clientsClaim: true,
      },
      devOptions: {
        enabled: false, // 开发环境禁用 Service Worker
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    // 启用代码分割优化
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        // 手动配置代码分割策略
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // Vuetify UI 库
          'vuetify-vendor': ['vuetify'],
          // i18n 库
          'i18n-vendor': ['vue-i18n'],
          // 工具库
          'utils': [
            './src/utils/base32.ts',
            './src/utils/totp.ts',
            './src/utils/otpauth.ts',
            './src/utils/keyValidation.ts',
          ],
        },
        // 为每个 chunk 生成独立的文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用源码映射（生产环境可选）
    sourcemap: false,
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true,
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
})
