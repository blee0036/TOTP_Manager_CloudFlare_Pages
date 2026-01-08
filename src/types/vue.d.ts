/**
 * Vue 全局类型声明
 * 
 * 扩展 Vue 的类型定义以支持自定义全局属性
 */

import type { NotificationType } from '../stores/notification';

export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    /**
     * 全局消息显示方法
     * 
     * 用于在任何组件中显示 Snackbar 消息
     * 
     * @deprecated 请使用 useNotificationStore() 代替
     * 
     * @example
     * // 旧方式（已弃用）
     * this.$showMessage('Success!', 'success')
     * 
     * // 新方式（推荐）
     * import { useNotificationStore } from '@/stores/notification'
     * const notification = useNotificationStore()
     * notification.showSuccess('Success!')
     */
    $showMessage: (
      message: string,
      color?: NotificationType
    ) => void
  }
}
