/**
 * OTPAuth URI 解析器
 * 支持解析 otpauth:// 协议的 URI
 * 格式: otpauth://totp/Issuer:Account?secret=SECRET&issuer=Issuer
 */

/**
 * OTPAuth URI 解析结果
 */
export interface OTPAuthData {
  secret: string;
  remark: string;
  issuer?: string;
  account?: string;
  algorithm?: string;
  digits?: number;
  period?: number;
}

/**
 * 解析 otpauth:// URI
 * 
 * @param uri - otpauth:// 格式的 URI 字符串
 * @returns 解析后的数据，如果解析失败返回 null
 * 
 * @example
 * ```typescript
 * const data = parseOtpAuthUri('otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google');
 * // { secret: 'JBSWY3DPEHPK3PXP', remark: 'Google (user@example.com)', issuer: 'Google', account: 'user@example.com', ... }
 * ```
 */
export function parseOtpAuthUri(uri: string): OTPAuthData | null {
  try {
    const url = new URL(uri);
    
    // 验证协议
    if (url.protocol !== 'otpauth:') {
      throw new Error('Invalid protocol, expected otpauth://');
    }
    
    // 验证类型（仅支持 TOTP）
    if (url.hostname !== 'totp') {
      throw new Error('Only TOTP type is supported');
    }
    
    // 解析路径中的 issuer 和 account
    // 格式可能是: /Account 或 /Issuer:Account
    const pathParts = url.pathname.substring(1).split(':');
    const issuerFromPath = pathParts.length > 1 && pathParts[0]
      ? decodeURIComponent(pathParts[0]) 
      : null;
    const lastPart = pathParts[pathParts.length - 1];
    const account = lastPart ? decodeURIComponent(lastPart) : '';
    
    // 解析查询参数
    const params = url.searchParams;
    const secret = params.get('secret');
    const issuerParam = params.get('issuer');
    const algorithm = params.get('algorithm') || 'SHA1';
    const digits = parseInt(params.get('digits') || '6');
    const period = parseInt(params.get('period') || '30');
    
    if (!secret) {
      throw new Error('Secret parameter is required');
    }
    
    // 验证密钥格式
    const normalizedSecret = secret.toUpperCase().replace(/\s+/g, '');
    if (!/^[A-Z2-7]+=*$/.test(normalizedSecret) || normalizedSecret.replace(/=+$/, '').length < 8) {
      throw new Error('Invalid Base32 secret format');
    }
    
    // 警告不支持的参数
    if (algorithm.toUpperCase() !== 'SHA1') {
      console.warn('Only SHA1 algorithm is guaranteed to be supported');
    }
    if (digits !== 6) {
      console.warn('Only 6-digit codes are guaranteed to be supported');
    }
    if (period !== 30) {
      console.warn('Only 30-second period is guaranteed to be supported');
    }
    
    // 生成备注
    // 优先使用查询参数中的 issuer，其次使用路径中的 issuer
    const issuer = issuerParam || issuerFromPath;
    let remark = '';
    if (issuer) {
      remark = issuer;
      if (account && account !== issuer) {
        remark += ` (${account})`;
      }
    } else if (account) {
      remark = account;
    } else {
      remark = 'Unnamed Key';
    }
    
    return {
      secret: normalizedSecret,
      remark: remark.trim(),
      issuer: issuer || undefined,
      account,
      algorithm,
      digits,
      period
    };
  } catch (error) {
    console.error('OTPAuth URI parsing error:', error);
    return null;
  }
}
