import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 通知类型
 * 
 * 需求: 15.3, 15.4, 15.5
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * 通知消息接口
 */
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timeout: number;
  show: boolean;
}

/**
 * Notification Store
 * 管理全局通知消息
 * 
 * 需求: 15.3, 15.4, 15.5
 * 
 * 功能：
 * 1. 显示成功、错误、警告、信息消息
 * 2. 自动消失（可配置超时时间）
 * 3. 支持不同类型的样式
 * 4. 队列管理（一次只显示一个通知）
 */
export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([]);
  const currentNotification = ref<Notification | null>(null);

  /**
   * 显示通知
   * 
   * @param message - 消息内容
   * @param type - 消息类型
   * @param timeout - 自动消失时间（毫秒），0 表示不自动消失
   */
  function showNotification(
    message: string,
    type: NotificationType = 'info',
    timeout: number = 3000
  ): void {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
      timeout,
      show: true,
    };

    // 如果当前没有显示通知，立即显示
    if (!currentNotification.value) {
      currentNotification.value = notification;
    } else {
      // 否则加入队列
      notifications.value.push(notification);
    }
  }

  /**
   * 显示成功消息
   * 需求: 15.3, 15.4
   */
  function showSuccess(message: string, timeout: number = 3000): void {
    showNotification(message, 'success', timeout);
  }

  /**
   * 显示错误消息
   * 需求: 15.1, 15.2, 15.3, 15.4
   */
  function showError(message: string, timeout: number = 5000): void {
    showNotification(message, 'error', timeout);
  }

  /**
   * 显示警告消息
   * 需求: 15.3, 15.4
   */
  function showWarning(message: string, timeout: number = 4000): void {
    showNotification(message, 'warning', timeout);
  }

  /**
   * 显示信息消息
   * 需求: 15.3, 15.4
   */
  function showInfo(message: string, timeout: number = 3000): void {
    showNotification(message, 'info', timeout);
  }

  /**
   * 关闭当前通知
   * 需求: 15.5
   */
  function closeNotification(): void {
    if (currentNotification.value) {
      currentNotification.value.show = false;
      currentNotification.value = null;

      // 显示队列中的下一个通知
      if (notifications.value.length > 0) {
        const next = notifications.value.shift();
        if (next) {
          currentNotification.value = next;
        }
      }
    }
  }

  /**
   * 清空所有通知
   */
  function clearAll(): void {
    currentNotification.value = null;
    notifications.value = [];
  }

  return {
    // State
    currentNotification,
    notifications,
    // Actions
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeNotification,
    clearAll,
  };
});
