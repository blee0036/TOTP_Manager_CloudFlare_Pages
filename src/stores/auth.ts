import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../types';
import { handleApiError } from '../utils/apiError';

/**
 * Auth Store
 * 管理用户认证状态和操作
 * 
 * 需求: 5.1, 5.2, 5.5, 15.1, 15.2
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);

  // Getters
  const isAuthenticated = computed(() => user.value !== null);

  /**
   * 用户登录
   * 需求: 5.2, 5.3, 15.1, 15.2
   */
  async function login(username: string, password: string): Promise<void> {
    isLoading.value = true;
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // 包含 cookies
      });

      if (!response.ok) {
        await handleApiError(new Error('Login failed'), response);
        return;
      }

      const data = await response.json();
      user.value = data.user;
    } catch (error) {
      console.error('Login error:', error);
      await handleApiError(error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 用户注册
   * 需求: 5.1, 5.6, 15.1, 15.2
   */
  async function register(username: string, password: string): Promise<void> {
    isLoading.value = true;
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        await handleApiError(new Error('Registration failed'), response);
        return;
      }

      // 注册成功后不自动登录，让用户手动登录
      // 这样可以确保用户记住密码
    } catch (error) {
      console.error('Registration error:', error);
      await handleApiError(error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 用户登出
   * 需求: 5.5, 15.1, 15.2
   */
  async function logout(): Promise<void> {
    isLoading.value = true;
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('Logout request failed, clearing local state anyway');
      }

      // 清除本地状态
      user.value = null;
    } catch (error) {
      console.error('Logout error:', error);
      // 即使请求失败，也清除本地状态
      user.value = null;
      await handleApiError(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 检查认证状态
   * 从服务器获取当前用户信息
   * 需求: 5.3, 5.4, 15.1, 15.2
   */
  async function checkAuth(): Promise<void> {
    isLoading.value = true;
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        user.value = data.user;
      } else {
        // 未认证或会话过期
        user.value = null;
      }
    } catch (error) {
      console.error('Check auth error:', error);
      user.value = null;
      // 不显示错误通知，因为这是后台检查
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    user,
    isLoading,
    // Getters
    isAuthenticated,
    // Actions
    login,
    register,
    logout,
    checkAuth,
  };
});
