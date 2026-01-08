/**
 * TOTP (Time-based One-Time Password) 算法实现
 * 基于 RFC 6238 标准
 */

import { base32Decode } from './base32';

/**
 * TOTP 令牌生成器
 * 
 * @param secretBase32 - Base32 编码的密钥
 * @param step - 时间步长（秒），默认 30 秒
 * @param digits - 令牌位数，默认 6 位
 * @returns 生成的 TOTP 令牌字符串
 * @throws 如果密钥无效或生成失败
 */
export async function generateTOTP(
  secretBase32: string,
  step: number = 30,
  digits: number = 6
): Promise<string> {
  try {
    // 1. 解码 Base32 密钥
    const secretBytes = base32Decode(secretBase32);
    
    // 2. 计算时间步数（当前时间戳除以步长）
    const counter = Math.floor(Date.now() / 1000 / step);
    
    // 3. 将计数器转换为 8 字节大端序
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    const high = Math.floor(counter / 0x100000000);
    const low = counter & 0xFFFFFFFF;
    counterView.setUint32(0, high, false); // 大端序
    counterView.setUint32(4, low, false);  // 大端序
    const counterBytes = new Uint8Array(counterBuffer);
    
    // 4. 导入密钥用于 HMAC-SHA1
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    
    // 5. 计算 HMAC-SHA1
    const hmacResult = await crypto.subtle.sign('HMAC', key, counterBytes);
    const hmacBytes = new Uint8Array(hmacResult);
    
    // 6. 动态截断（Dynamic Truncation）
    // 使用最后一个字节的低 4 位作为偏移量
    const lastByte = hmacBytes[hmacBytes.length - 1];
    if (lastByte === undefined) {
      throw new Error('HMAC result is empty');
    }
    const offset = lastByte & 0x0f;
    
    // 从偏移位置提取 4 个字节，并清除最高位
    const byte0 = hmacBytes[offset];
    const byte1 = hmacBytes[offset + 1];
    const byte2 = hmacBytes[offset + 2];
    const byte3 = hmacBytes[offset + 3];
    
    if (byte0 === undefined || byte1 === undefined || byte2 === undefined || byte3 === undefined) {
      throw new Error('Invalid HMAC offset');
    }
    
    const code = (
      ((byte0 & 0x7f) << 24) |
      ((byte1 & 0xff) << 16) |
      ((byte2 & 0xff) << 8) |
      (byte3 & 0xff)
    ) % Math.pow(10, digits);
    
    // 7. 格式化为指定位数（前导零填充）
    return code.toString().padStart(digits, '0');
  } catch (error) {
    console.error('TOTP generation error:', error);
    throw error;
  }
}

/**
 * 获取当前 TOTP 周期的剩余秒数
 * 
 * @param step - 时间步长（秒），默认 30 秒
 * @returns 剩余秒数（0 到 step-1）
 */
export function getTimeRemaining(step: number = 30): number {
  const now = Math.floor(Date.now() / 1000);
  return step - (now % step);
}

/**
 * 获取当前 TOTP 周期的进度百分比
 * 
 * @param step - 时间步长（秒），默认 30 秒
 * @returns 进度百分比（0 到 100）
 */
export function getProgress(step: number = 30): number {
  const remaining = getTimeRemaining(step);
  return ((step - remaining) / step) * 100;
}
