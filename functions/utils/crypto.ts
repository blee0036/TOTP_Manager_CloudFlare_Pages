/**
 * 加密工具函数
 * 用于密码哈希和验证
 */

/**
 * 使用 PBKDF2-SHA256 哈希密码
 * 
 * @param password - 明文密码
 * @param salt - 盐值
 * @param iterations - PBKDF2 迭代次数
 * @returns 十六进制格式的哈希值
 */
export async function hashPassword(
  password: string,
  salt: string,
  iterations: number
): Promise<string> {
  const encoder = new TextEncoder();
  
  // 导入密码作为密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // 派生密钥
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );
  
  // 转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return hashHex;
}

/**
 * 验证密码
 * 
 * @param storedHash - 存储的哈希值
 * @param providedPassword - 用户提供的密码
 * @param salt - 盐值
 * @param iterations - PBKDF2 迭代次数
 * @returns 密码是否匹配
 */
export async function verifyPassword(
  storedHash: string,
  providedPassword: string,
  salt: string,
  iterations: number
): Promise<boolean> {
  const calculatedHash = await hashPassword(providedPassword, salt, iterations);
  
  // 使用常量时间比较（虽然对于哈希值不是严格必要）
  if (storedHash.length !== calculatedHash.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < storedHash.length; i++) {
    result |= storedHash.charCodeAt(i) ^ calculatedHash.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * 从环境变量获取配置
 * 
 * @param env - Cloudflare Pages Functions 环境对象
 * @returns 配置对象
 */
export function getConfig(env: any): { hashSalt: string; pwIterations: number } {
  const DEFAULT_CONFIG = {
    HASH_SALT: 'default-salt-change-in-production',
    PW_ITERATIONS: '100000',
  };

  return {
    hashSalt: env.HASH_SALT || DEFAULT_CONFIG.HASH_SALT,
    pwIterations: parseInt(env.PW_ITERATIONS || DEFAULT_CONFIG.PW_ITERATIONS),
  };
}
