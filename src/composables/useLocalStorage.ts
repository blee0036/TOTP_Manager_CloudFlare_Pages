/**
 * useLocalStorage Composable
 * 实现本地密钥存储和 CRUD 操作
 */

import { ref, type Ref } from 'vue';

/**
 * 本地存储的 TOTP 密钥类型
 */
export interface TOTPKey {
  id: string;           // 格式: local_timestamp_random
  remark: string;       // 备注（必填）
  secret: string;       // Base32 密钥
  createdAt: string;    // ISO 8601 格式的创建时间
}

/**
 * useLocalStorage 返回类型
 */
export interface UseLocalStorageReturn {
  /**
   * 密钥列表（响应式）
   */
  keys: Ref<TOTPKey[]>;
  
  /**
   * 添加新密钥
   * @param key - 密钥数据（不包含 id 和 createdAt）
   * @returns 添加的密钥（包含生成的 id 和 createdAt）
   */
  addKey: (key: Omit<TOTPKey, 'id' | 'createdAt'>) => TOTPKey;
  
  /**
   * 更新密钥
   * @param id - 密钥 ID
   * @param updates - 要更新的字段
   * @returns 是否更新成功
   */
  updateKey: (id: string, updates: Partial<Omit<TOTPKey, 'id' | 'createdAt'>>) => boolean;
  
  /**
   * 删除密钥
   * @param id - 密钥 ID
   * @returns 是否删除成功
   */
  deleteKey: (id: string) => boolean;
  
  /**
   * 根据 ID 获取密钥
   * @param id - 密钥 ID
   * @returns 密钥对象，如果不存在返回 undefined
   */
  getKeyById: (id: string) => TOTPKey | undefined;
  
  /**
   * 清除所有密钥
   */
  clearKeys: () => void;
  
  /**
   * 加载密钥（从 LocalStorage）
   */
  loadKeys: () => void;
  
  /**
   * 保存密钥（到 LocalStorage）
   */
  saveKeys: () => void;
}

// LocalStorage 键名
const STORAGE_KEY = 'temp_totp_keys';

/**
 * 生成唯一的密钥 ID
 * 格式: local_timestamp_random
 */
function generateKeyId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `local_${timestamp}_${random}`;
}

/**
 * 本地存储 Composable
 * 
 * 提供临时模式下的密钥存储功能，数据保存在浏览器 LocalStorage 中
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useLocalStorage } from '@/composables/useLocalStorage';
 * 
 * const { keys, addKey, updateKey, deleteKey } = useLocalStorage();
 * 
 * // 添加密钥
 * const newKey = addKey({
 *   remark: 'Google',
 *   secret: 'JBSWY3DPEHPK3PXP'
 * });
 * 
 * // 更新密钥
 * updateKey(newKey.id, { remark: 'Google Account' });
 * 
 * // 删除密钥
 * deleteKey(newKey.id);
 * </script>
 * 
 * <template>
 *   <div>
 *     <p>Total keys: {{ keys.length }}</p>
 *     <ul>
 *       <li v-for="key in keys" :key="key.id">
 *         {{ key.remark }}
 *       </li>
 *     </ul>
 *   </div>
 * </template>
 * ```
 */
export function useLocalStorage(): UseLocalStorageReturn {
  // 响应式密钥列表
  const keys = ref<TOTPKey[]>([]);
  
  /**
   * 从 LocalStorage 加载密钥
   */
  const loadKeys = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          keys.value = parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load keys from LocalStorage:', error);
      keys.value = [];
    }
  };
  
  /**
   * 保存密钥到 LocalStorage
   */
  const saveKeys = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys.value));
    } catch (error) {
      console.error('Failed to save keys to LocalStorage:', error);
    }
  };
  
  /**
   * 添加新密钥
   */
  const addKey = (key: Omit<TOTPKey, 'id' | 'createdAt'>): TOTPKey => {
    const newKey: TOTPKey = {
      id: generateKeyId(),
      remark: key.remark,
      secret: key.secret,
      createdAt: new Date().toISOString(),
    };
    
    keys.value.push(newKey);
    saveKeys();
    
    return newKey;
  };
  
  /**
   * 更新密钥
   */
  const updateKey = (
    id: string, 
    updates: Partial<Omit<TOTPKey, 'id' | 'createdAt'>>
  ): boolean => {
    const index = keys.value.findIndex(k => k.id === id);
    if (index === -1) {
      return false;
    }
    
    // 更新密钥（保留 id 和 createdAt）
    keys.value[index] = {
      ...keys.value[index],
      ...updates,
    } as TOTPKey;
    
    saveKeys();
    return true;
  };
  
  /**
   * 删除密钥
   */
  const deleteKey = (id: string): boolean => {
    const index = keys.value.findIndex(k => k.id === id);
    if (index === -1) {
      return false;
    }
    
    keys.value.splice(index, 1);
    saveKeys();
    return true;
  };
  
  /**
   * 根据 ID 获取密钥
   */
  const getKeyById = (id: string): TOTPKey | undefined => {
    return keys.value.find(k => k.id === id);
  };
  
  /**
   * 清除所有密钥
   */
  const clearKeys = () => {
    keys.value = [];
    saveKeys();
  };
  
  // 初始加载
  loadKeys();
  
  // 监听密钥变化，自动保存（可选，已在各操作中手动保存）
  // watch(keys, saveKeys, { deep: true });
  
  return {
    keys,
    addKey,
    updateKey,
    deleteKey,
    getKeyById,
    clearKeys,
    loadKeys,
    saveKeys,
  };
}
