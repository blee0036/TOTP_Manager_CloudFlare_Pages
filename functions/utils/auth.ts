/**
 * 认证和会话管理工具函数
 */

import type { EventContext } from '@cloudflare/workers-types';
import type { Env } from '../types';

const COOKIE_NAME = '__totp_session';

/**
 * 生成安全的会话令牌
 * 
 * @returns UUID 格式的会话令牌
 */
export function generateSessionToken(): string {
  return crypto.randomUUID();
}

/**
 * 创建会话 Cookie
 * 
 * @param sessionToken - 会话令牌
 * @param maxAge - Cookie 最大存活时间（秒），默认 24 小时
 * @returns Cookie 字符串
 */
export function createSessionCookie(
  sessionToken: string,
  maxAge: number = 86400
): string {
  const isSecure = true; // Cloudflare Pages 总是 HTTPS
  
  return [
    `${COOKIE_NAME}=${sessionToken}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    isSecure ? 'Secure' : ''
  ].filter(Boolean).join('; ');
}

/**
 * 清除会话 Cookie
 * 
 * @returns Cookie 字符串（设置为过期）
 */
export function clearSessionCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Secure'
  ].join('; ');
}

/**
 * 从 Cookie 头解析 Cookie
 * 
 * @param cookieHeader - Cookie 头字符串
 * @returns Cookie 键值对对象
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, ...valueParts] = cookie.split('=');
    const value = valueParts.join('=').trim();
    if (key) {
      acc[key.trim()] = value;
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * 从请求中获取会话令牌
 * 
 * @param request - Request 对象
 * @returns 会话令牌或 null
 */
export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) {
    return null;
  }
  
  const cookies = parseCookies(cookieHeader);
  return cookies[COOKIE_NAME] || null;
}

/**
 * 从请求中获取用户信息
 * 
 * @param context - EventContext 对象
 * @returns 用户对象或 null
 */
export async function getUserFromRequest(
  context: EventContext<Env, any, any>
): Promise<{ id: number; username: string } | null> {
  const { request, env } = context;
  
  // 获取 session cookie
  const sessionToken = getSessionToken(request);
  
  if (!sessionToken) {
    return null;
  }
  
  // 从数据库验证会话（简化版本，使用 username 作为 token）
  // 生产环境应使用真实的会话表
  try {
    const user = await env.DATABASE
      .prepare('SELECT id, username FROM users WHERE username = ?')
      .bind(sessionToken)
      .first<{ id: number; username: string }>();
    
    return user || null;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * 要求认证的中间件
 * 
 * @param context - EventContext 对象
 * @returns 用户对象或错误响应
 */
export async function requireAuth(
  context: EventContext<Env, any, any>
): Promise<{ id: number; username: string } | Response> {
  const user = await getUserFromRequest(context);
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  return user;
}
