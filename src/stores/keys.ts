import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TOTPKey } from '../types';
import { handleApiError } from '../utils/apiError';

/**
 * Keys Store
 * 管理 TOTP 密钥的状态和操作
 * 
 * 需求: 6.9, 6.10, 6.11, 8.2, 8.3, 8.4, 15.1, 15.2
 */
export const useKeysStore = defineStore('keys', () => {
  // State
  const keys = ref<TOTPKey[]>([]);
  const isLoading = ref(false);
  const searchQuery = ref('');

  /**
   * 过滤后的密钥列表
   * 根据搜索查询进行客户端过滤
   * 需求: 8.2, 8.3, 8.4
   */
  const filteredKeys = computed(() => {
    if (!searchQuery.value || searchQuery.value.trim() === '') {
      return keys.value;
    }

    const normalizedQuery = searchQuery.value.toLowerCase().trim();
    
    return keys.value.filter(key => {
      const normalizedRemark = key.remark.toLowerCase();
      return normalizedRemark.includes(normalizedQuery);
    });
  });

  /**
   * 获取用户的所有密钥
   * 需求: 6.9, 15.1, 15.2
   */
  async function fetchKeys(): Promise<void> {
    isLoading.value = true;
    try {
      const response = await fetch('/api/keys', {
        credentials: 'include',
      });

      if (!response.ok) {
        await handleApiError(new Error('Failed to fetch keys'), response);
        return;
      }

      const data = await response.json();
      keys.value = data.keys || [];
    } catch (error) {
      console.error('Fetch keys error:', error);
      await handleApiError(error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 添加新密钥
   * 需求: 6.7, 6.8, 6.10, 15.1, 15.2
   */
  async function addKey(data: { remark: string; secret: string }): Promise<void> {
    isLoading.value = true;
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        await handleApiError(new Error('Failed to add key'), response);
        return;
      }

      const result = await response.json();
      
      // 将新密钥添加到本地状态
      if (result.key) {
        keys.value.push(result.key);
        // 按备注排序
        keys.value.sort((a, b) => a.remark.localeCompare(b.remark));
      }
    } catch (error) {
      console.error('Add key error:', error);
      await handleApiError(error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 更新密钥备注
   * 需求: 6.9, 6.11, 15.1, 15.2
   */
  async function updateKey(id: number, data: { remark: string }): Promise<void> {
    isLoading.value = true;
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        await handleApiError(new Error('Failed to update key'), response);
        return;
      }

      const result = await response.json();
      
      // 更新本地状态
      if (result.key) {
        const index = keys.value.findIndex(k => k.id === id);
        if (index !== -1) {
          keys.value[index] = result.key;
          // 重新排序
          keys.value.sort((a, b) => a.remark.localeCompare(b.remark));
        }
      }
    } catch (error) {
      console.error('Update key error:', error);
      await handleApiError(error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 删除密钥
   * 需求: 6.10, 6.11, 15.1, 15.2
   */
  async function deleteKey(id: number): Promise<void> {
    isLoading.value = true;
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        await handleApiError(new Error('Failed to delete key'), response);
        return;
      }

      // 从本地状态中移除
      keys.value = keys.value.filter(k => k.id !== id);
    } catch (error) {
      console.error('Delete key error:', error);
      await handleApiError(error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 设置搜索查询
   * 需求: 8.2, 8.3
   */
  function setSearchQuery(query: string): void {
    searchQuery.value = query;
  }

  /**
   * 清空所有密钥（用于登出时）
   */
  function clearKeys(): void {
    keys.value = [];
    searchQuery.value = '';
  }

  return {
    // State
    keys,
    isLoading,
    searchQuery,
    // Getters
    filteredKeys,
    // Actions
    fetchKeys,
    addKey,
    updateKey,
    deleteKey,
    setSearchQuery,
    clearKeys,
  };
});
