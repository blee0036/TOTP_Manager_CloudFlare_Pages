/**
 * Base32 编解码器
 * 实现 RFC 4648 Base32 编码标准
 */

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Base32 解码器
 * 将 Base32 编码的字符串转换为 Uint8Array
 * 
 * @param encoded - Base32 编码的字符串
 * @returns 解码后的字节数组
 * @throws 如果输入包含无效的 Base32 字符
 */
export function base32Decode(encoded: string): Uint8Array {
  // 创建查找表
  const base32Lookup: Record<string, number> = {};
  for (let i = 0; i < BASE32_CHARS.length; i++) {
    const char = BASE32_CHARS[i];
    if (char) {
      base32Lookup[char] = i;
    }
  }
  
  // 规范化输入：转大写，移除空格和填充
  encoded = encoded.toUpperCase().replace(/\s+/g, '').replace(/=+$/, '');
  
  if (encoded.length === 0) {
    return new Uint8Array(0);
  }
  
  // 验证所有字符都是有效的 Base32 字符
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i];
    if (char && !(char in base32Lookup)) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
  }
  
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = new Uint8Array(Math.floor(encoded.length * 5 / 8));
  
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i];
    if (char) {
      const lookupValue = base32Lookup[char];
      if (lookupValue !== undefined) {
        value = (value << 5) | lookupValue;
        bits += 5;
        
        if (bits >= 8) {
          output[index++] = (value >>> (bits - 8)) & 0xFF;
          bits -= 8;
        }
      }
    }
  }
  
  return output;
}

/**
 * Base32 编码器
 * 将字节数组转换为 Base32 编码的字符串
 * 
 * @param data - 要编码的字节数组
 * @returns Base32 编码的字符串
 */
export function base32Encode(data: Uint8Array): string {
  if (data.length === 0) {
    return '';
  }
  
  let bits = 0;
  let value = 0;
  let output = '';
  
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    if (byte !== undefined) {
      value = (value << 8) | byte;
      bits += 8;
      
      while (bits >= 5) {
        output += BASE32_CHARS[(value >>> (bits - 5)) & 0x1F];
        bits -= 5;
      }
    }
  }
  
  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 0x1F];
  }
  
  // 添加填充
  while (output.length % 8 !== 0) {
    output += '=';
  }
  
  return output;
}
