import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import vuetify from './plugins/vuetify'
import { i18n, initI18n } from './i18n'
import './style.css'
import App from './App.vue'
import { watchOnlineStatus } from './utils/apiError'
import { useNotificationStore } from './stores/notification'
import { registerSW } from 'virtual:pwa-register'

/**
 * 应用入口文件
 * 
 * 需求: 15.1, 15.2, 15.3, 15.4, 15.5, 12.1, 12.2, 12.4, 14.10
 * 
 * 功能：
 * 1. 创建 Vue 应用实例
 * 2. 注册插件（Router, Pinia, Vuetify, I18n）
 * 3. 配置全局错误处理
 * 4. 监听在线/离线状态
 * 5. 实现代码分割和懒加载
 * 6. 注册 Service Worker
 * 7. 挂载应用到 DOM
 */

/**
 * 注册 Service Worker
 * 
 * 需求: 12.4
 * 
 * 实现离线缓存和自动更新
 */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // 注册 Service Worker 并处理更新
  const updateSW = registerSW({
    onNeedRefresh() {
      // 当有新版本可用时
      console.log('New content available, please refresh.')
      
      // 可以显示一个通知让用户选择是否更新
      // 这里我们自动更新
      updateSW(true)
    },
    onOfflineReady() {
      // 当应用准备好离线使用时
      console.log('App ready to work offline')
    },
    onRegistered(registration) {
      // Service Worker 注册成功
      console.log('Service Worker registered:', registration)
      
      // 每小时检查一次更新
      if (registration) {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // 1 小时
      }
    },
    onRegisterError(error) {
      // Service Worker 注册失败
      console.error('Service Worker registration error:', error)
    },
  })
}

// 异步初始化应用
async function initApp() {
  const app = createApp(App)

  // 注册插件
  // 注意：Pinia 必须在 Router 之前注册，因为路由守卫需要访问 store
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  app.use(vuetify)
  app.use(i18n)

  /**
   * 全局错误处理器
   * 
   * 需求: 15.1, 15.2
   * 
   * 捕获 Vue 组件中的错误并记录
   * 在生产环境中，可以将错误发送到错误追踪服务（如 Sentry）
   */
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err)
    console.error('Component:', instance)
    console.error('Error Info:', info)
    
    // 在生产环境中，可以将错误发送到错误追踪服务
    if (import.meta.env.PROD) {
      // 示例：发送到错误追踪服务
      // sendErrorToTrackingService({
      //   error: err,
      //   component: instance?.$options.name || 'Unknown',
      //   info,
      //   timestamp: new Date().toISOString(),
      // })
    }
  }

  /**
   * 全局警告处理器
   * 
   * 仅在开发环境中启用，用于调试
   */
  if (import.meta.env.DEV) {
    app.config.warnHandler = (msg, instance, trace) => {
      console.warn('Vue Warning:', msg)
      console.warn('Component:', instance)
      console.warn('Trace:', trace)
    }
  }

  /**
   * 未捕获的 Promise 拒绝处理
   * 
   * 需求: 15.1, 15.2
   * 
   * 捕获未处理的 Promise 拒绝，防止应用崩溃
   * 这对于异步操作（如 API 调用）特别重要
   */
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
    
    // 阻止默认的错误提示
    event.preventDefault()
    
    // 在生产环境中，记录错误
    if (import.meta.env.PROD) {
      // 示例：发送到错误追踪服务
      // sendErrorToTrackingService({
      //   type: 'unhandledRejection',
      //   error: event.reason,
      //   timestamp: new Date().toISOString(),
      // })
    }
    
    // 在开发环境中，提供更详细的错误信息
    if (import.meta.env.DEV) {
      console.error('Promise rejection details:', {
        reason: event.reason,
        promise: event.promise,
      })
    }
  })

  /**
   * 全局错误处理
   * 
   * 需求: 15.1, 15.2
   * 
   * 捕获未捕获的 JavaScript 错误
   * 这是最后一道防线，防止应用完全崩溃
   */
  window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error)
    console.error('Message:', event.message)
    console.error('Source:', event.filename)
    console.error('Line:', event.lineno)
    console.error('Column:', event.colno)
    
    // 阻止默认的错误提示
    event.preventDefault()
    
    // 在生产环境中，记录错误
    if (import.meta.env.PROD) {
      // 示例：发送到错误追踪服务
      // sendErrorToTrackingService({
      //   type: 'globalError',
      //   error: event.error,
      //   message: event.message,
      //   source: event.filename,
      //   line: event.lineno,
      //   column: event.colno,
      //   timestamp: new Date().toISOString(),
      // })
    }
  })

  /**
   * 性能监控（可选）
   * 
   * 需求: 12.5
   * 
   * 监控应用性能指标
   */
  if (import.meta.env.PROD && 'performance' in window) {
    window.addEventListener('load', () => {
      // 获取性能指标
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      const connectTime = perfData.responseEnd - perfData.requestStart
      const renderTime = perfData.domComplete - perfData.domLoading
      
      console.log('Performance Metrics:')
      console.log('- Page Load Time:', pageLoadTime, 'ms')
      console.log('- Connect Time:', connectTime, 'ms')
      console.log('- Render Time:', renderTime, 'ms')
      
      // TODO: 发送性能指标到分析服务
      // sendPerformanceMetrics({ pageLoadTime, connectTime, renderTime })
    })
  }

  // 初始化 i18n（懒加载语言文件）
  // 需求: 14.10
  await initI18n()

  // 挂载应用
  app.mount('#app')

  /**
   * 监听在线/离线状态
   * 
   * 需求: 15.2
   * 
   * 当网络状态变化时显示通知
   */
  watchOnlineStatus(
    () => {
      // 上线时
      const notificationStore = useNotificationStore()
      notificationStore.showSuccess('You are back online')
    },
    () => {
      // 离线时
      const notificationStore = useNotificationStore()
      notificationStore.showWarning('You are offline. Some features may not be available.')
    }
  )
}

// 启动应用
initApp().catch((error) => {
  console.error('Failed to initialize app:', error)
  // 显示友好的错误消息
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
      <div style="text-align: center;">
        <h1>Failed to load application</h1>
        <p>Please refresh the page or try again later.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
          Reload
        </button>
      </div>
    </div>
  `
})
