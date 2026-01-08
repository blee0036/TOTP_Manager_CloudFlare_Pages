/**
 * useTOTP Composable
 * 封装 TOTP 生成逻辑，提供令牌自动更新和进度条功能
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { generateTOTP, getTimeRemaining, getProgress } from '../utils/totp';

/**
 * useTOTP 返回类型
 */
export interface UseTOTPReturn {
  /**
   * 生成 TOTP 令牌
   * @param secret - Base32 编码的密钥
   * @param step - 时间步长（秒），默认 30 秒
   * @param digits - 令牌位数，默认 6 位
   * @returns 生成的 TOTP 令牌字符串
   */
  generateTOTP: (secret: string, step?: number, digits?: number) => Promise<string>;
  
  /**
   * 获取当前令牌（使用默认参数）
   * @param secret - Base32 编码的密钥
   * @returns 生成的 TOTP 令牌字符串
   */
  getCurrentToken: (secret: string) => Promise<string>;
  
  /**
   * 获取当前周期的剩余秒数
   * @returns 剩余秒数（0 到 29）
   */
  getTimeRemaining: () => number;
  
  /**
   * 获取当前周期的进度百分比
   * @returns 进度百分比（0 到 100）
   */
  getProgress: () => number;
  
  /**
   * 当前剩余秒数（响应式）
   */
  timeRemaining: Ref<number>;
  
  /**
   * 当前进度百分比（响应式）
   */
  progress: Ref<number>;
  
  /**
   * 是否正在更新（响应式）
   */
  isUpdating: Ref<boolean>;
}

/**
 * TOTP Composable
 * 
 * 提供 TOTP 令牌生成、自动更新和进度跟踪功能
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useTOTP } from '@/composables/useTOTP';
 * 
 * const { getCurrentToken, timeRemaining, progress } = useTOTP();
 * const token = ref('');
 * 
 * // 生成令牌
 * token.value = await getCurrentToken('JBSWY3DPEHPK3PXP');
 * 
 * // 监听剩余时间
 * watch(timeRemaining, (remaining) => {
 *   if (remaining === 30) {
 *     // 新周期开始，重新生成令牌
 *     token.value = await getCurrentToken('JBSWY3DPEHPK3PXP');
 *   }
 * });
 * </script>
 * 
 * <template>
 *   <div>
 *     <p>Token: {{ token }}</p>
 *     <p>Time remaining: {{ timeRemaining }}s</p>
 *     <v-progress-linear :model-value="progress" />
 *   </div>
 * </template>
 * ```
 */
export function useTOTP(): UseTOTPReturn {
  // 响应式状态
  const timeRemaining = ref<number>(getTimeRemaining());
  const progress = ref<number>(getProgress());
  const isUpdating = ref<boolean>(false);
  
  // 定时器引用
  let intervalId: number | null = null;
  
  /**
   * 更新时间和进度
   */
  const updateTimeAndProgress = () => {
    timeRemaining.value = getTimeRemaining();
    progress.value = getProgress();
  };
  
  /**
   * 启动自动更新
   */
  const startAutoUpdate = () => {
    // 立即更新一次
    updateTimeAndProgress();
    
    // 每秒更新一次
    intervalId = window.setInterval(() => {
      updateTimeAndProgress();
    }, 1000);
  };
  
  /**
   * 停止自动更新
   */
  const stopAutoUpdate = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  
  // 组件挂载时启动自动更新
  onMounted(() => {
    startAutoUpdate();
  });
  
  // 组件卸载时停止自动更新
  onUnmounted(() => {
    stopAutoUpdate();
  });
  
  /**
   * 生成 TOTP 令牌（完整参数）
   */
  const generateTOTPToken = async (
    secret: string,
    step: number = 30,
    digits: number = 6
  ): Promise<string> => {
    try {
      isUpdating.value = true;
      const token = await generateTOTP(secret, step, digits);
      return token;
    } catch (error) {
      console.error('Failed to generate TOTP:', error);
      throw error;
    } finally {
      isUpdating.value = false;
    }
  };
  
  /**
   * 获取当前令牌（使用默认参数）
   */
  const getCurrentToken = async (secret: string): Promise<string> => {
    return generateTOTPToken(secret, 30, 6);
  };
  
  return {
    generateTOTP: generateTOTPToken,
    getCurrentToken,
    getTimeRemaining,
    getProgress,
    timeRemaining,
    progress,
    isUpdating,
  };
}
