/**
 * 密钥验证和规范化工具
 * 支持多种输入格式的密钥验证和规范化
 */

import { base32Decode } from './base32';
import { parseOtpAuthUri } from './otpauth';

/**
 * 密钥验证结果
 */
export interface KeyValidationResult {
  isValid: boolean;
  normalizedSecret: string;
  error?: string;
}

/**
 * 规范化密钥字符串
 * 移除空白字符并转换为大写
 * 
 * @param secret - 原始密钥字符串
 * @returns 规范化后的密钥字符串
 * 
 * @example
 * ```typescript
 * normalizeSecret('jbsw y3dp ehpk 3pxp') // 'JBSWY3DPEHPK3PXP'
 * normalizeSecret('JBSWY3DPEHPK3PXP')    // 'JBSWY3DPEHPK3PXP'
 * ```
 */
export function normalizeSecret(secret: string): string {
  // 移除所有空白字符并转换为大写
  return secret.trim().replace(/\s+/g, '').toUpperCase();
}

/**
 * 验证并规范化密钥输入
 * 支持多种输入格式：
 * - 纯 Base32 密钥（大小写混合、带空格）
 * - otpauth:// URI
 * 
 * @param input - 用户输入的密钥字符串
 * @returns 验证结果，包含是否有效、规范化后的密钥和错误信息
 * 
 * @example
 * ```typescript
 * // 纯 Base32 密钥
 * validateAndNormalizeSecret('JBSWY3DPEHPK3PXP')
 * // { isValid: true, normalizedSecret: 'JBSWY3DPEHPK3PXP' }
 * 
 * // 带空格的密钥
 * validateAndNormalizeSecret('JBSW Y3DP EHPK 3PXP')
 * // { isValid: true, normalizedSecret: 'JBSWY3DPEHPK3PXP' }
 * 
 * // OTPAuth URI
 * validateAndNormalizeSecret('otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP')
 * // { isValid: true, normalizedSecret: 'JBSWY3DPEHPK3PXP' }
 * 
 * // 无效密钥
 * validateAndNormalizeSecret('invalid!')
 * // { isValid: false, normalizedSecret: '', error: 'Invalid Base32 format...' }
 * ```
 */
export function validateAndNormalizeSecret(input: string): KeyValidationResult {
  try {
    // 移除所有空白字符
    let normalized = input.trim().replace(/\s+/g, '');
    
    // 检查是否为 otpauth:// URI
    if (normalized.toLowerCase().startsWith('otpauth://')) {
      const parsed = parseOtpAuthUri(normalized);
      if (!parsed) {
        return {
          isValid: false,
          normalizedSecret: '',
          error: 'Invalid OTPAuth URI format'
        };
      }
      return {
        isValid: true,
        normalizedSecret: parsed.secret
      };
    }
    
    // 转换为大写
    normalized = normalized.toUpperCase();
    
    // 验证 Base32 格式
    // Base32 字符集: A-Z (26个字母) + 2-7 (6个数字) + = (填充)
    const base32Regex = /^[A-Z2-7]+=*$/;
    if (!base32Regex.test(normalized)) {
      return {
        isValid: false,
        normalizedSecret: '',
        error: 'Invalid Base32 format. Only A-Z, 2-7, and = are allowed'
      };
    }
    
    // 验证最小长度（移除填充后至少 8 个字符）
    const withoutPadding = normalized.replace(/=+$/, '');
    if (withoutPadding.length < 8) {
      return {
        isValid: false,
        normalizedSecret: '',
        error: 'Secret must be at least 8 characters (excluding padding)'
      };
    }
    
    // 尝试解码以验证有效性
    try {
      base32Decode(normalized);
    } catch (error) {
      return {
        isValid: false,
        normalizedSecret: '',
        error: 'Secret cannot be decoded as valid Base32'
      };
    }
    
    return {
      isValid: true,
      normalizedSecret: normalized
    };
  } catch (error) {
    return {
      isValid: false,
      normalizedSecret: '',
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}
