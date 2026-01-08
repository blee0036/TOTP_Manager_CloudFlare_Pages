/**
 * useKeyValidation Composable
 * 封装密钥验证逻辑、OTPAuth 解析和格式规范化
 */

import { 
  validateAndNormalizeSecret, 
  normalizeSecret,
  type KeyValidationResult 
} from '../utils/keyValidation';
import { parseOtpAuthUri, type OTPAuthData } from '../utils/otpauth';

/**
 * useKeyValidation 返回类型
 */
export interface UseKeyValidationReturn {
  /**
   * 验证密钥格式并规范化
   * @param input - 用户输入的密钥字符串
   * @returns 验证结果，包含是否有效、规范化后的密钥和错误信息
   */
  validateSecret: (input: string) => KeyValidationResult;
  
  /**
   * 解析 OTPAuth URI
   * @param uri - otpauth:// 格式的 URI 字符串
   * @returns 解析后的数据，如果解析失败返回 null
   */
  parseOtpAuthUri: (uri: string) => OTPAuthData | null;
  
  /**
   * 规范化密钥字符串
   * @param secret - 原始密钥字符串
   * @returns 规范化后的密钥字符串（大写、无空格）
   */
  normalizeSecret: (secret: string) => string;
  
  /**
   * 检查输入是否为 OTPAuth URI
   * @param input - 用户输入的字符串
   * @returns 是否为 OTPAuth URI
   */
  isOtpAuthUri: (input: string) => boolean;
  
  /**
   * 从输入中提取密钥和备注
   * 支持纯密钥和 OTPAuth URI 两种格式
   * @param input - 用户输入的字符串
   * @returns 提取的密钥和备注，如果无效返回 null
   */
  extractKeyData: (input: string) => { secret: string; remark?: string } | null;
}

/**
 * 密钥验证 Composable
 * 
 * 提供密钥验证、OTPAuth URI 解析和格式规范化功能
 * 
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useKeyValidation } from '@/composables/useKeyValidation';
 * 
 * const { validateSecret, extractKeyData, isOtpAuthUri } = useKeyValidation();
 * const secretInput = ref('');
 * const remarkInput = ref('');
 * const errorMessage = ref('');
 * 
 * const handleInput = () => {
 *   // 检查是否为 OTPAuth URI
 *   if (isOtpAuthUri(secretInput.value)) {
 *     const data = extractKeyData(secretInput.value);
 *     if (data) {
 *       secretInput.value = data.secret;
 *       if (data.remark) {
 *         remarkInput.value = data.remark;
 *       }
 *     }
 *   }
 *   
 *   // 验证密钥
 *   const result = validateSecret(secretInput.value);
 *   if (!result.isValid) {
 *     errorMessage.value = result.error || 'Invalid secret';
 *   } else {
 *     errorMessage.value = '';
 *     secretInput.value = result.normalizedSecret;
 *   }
 * };
 * </script>
 * ```
 */
export function useKeyValidation(): UseKeyValidationReturn {
  /**
   * 验证密钥格式并规范化
   */
  const validateSecret = (input: string): KeyValidationResult => {
    return validateAndNormalizeSecret(input);
  };
  
  /**
   * 解析 OTPAuth URI
   */
  const parseUri = (uri: string): OTPAuthData | null => {
    return parseOtpAuthUri(uri);
  };
  
  /**
   * 规范化密钥字符串
   */
  const normalize = (secret: string): string => {
    return normalizeSecret(secret);
  };
  
  /**
   * 检查输入是否为 OTPAuth URI
   */
  const isOtpAuthUri = (input: string): boolean => {
    const trimmed = input.trim();
    return trimmed.toLowerCase().startsWith('otpauth://');
  };
  
  /**
   * 从输入中提取密钥和备注
   */
  const extractKeyData = (input: string): { secret: string; remark?: string } | null => {
    try {
      // 检查是否为 OTPAuth URI
      if (isOtpAuthUri(input)) {
        const parsed = parseUri(input);
        if (!parsed) {
          return null;
        }
        return {
          secret: parsed.secret,
          remark: parsed.remark
        };
      }
      
      // 纯密钥格式
      const result = validateSecret(input);
      if (!result.isValid) {
        return null;
      }
      
      return {
        secret: result.normalizedSecret
      };
    } catch (error) {
      console.error('Failed to extract key data:', error);
      return null;
    }
  };
  
  return {
    validateSecret,
    parseOtpAuthUri: parseUri,
    normalizeSecret: normalize,
    isOtpAuthUri,
    extractKeyData,
  };
}
