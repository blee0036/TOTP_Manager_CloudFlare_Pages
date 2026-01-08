import type { PagesFunction, EventContext } from '@cloudflare/workers-types';
import type { Env } from './types';

/**
 * API 中间件
 * 
 * 注意：由于使用 _routes.json 配置，此中间件仅在 /api/* 路由时执行
 * 
 * 职责：
 * 1. 添加安全响应头
 * 2. 错误处理
 * 3. 日志记录（可选）
 * 
 * 数据库初始化：
 * - 不在 Function 中进行数据库初始化
 * - 使用 Wrangler CLI 在部署前初始化数据库
 */

// 默认配置
export const DEFAULT_CONFIG = {
  HASH_SALT: 'default-salt-change-in-production',
  PW_ITERATIONS: '100000',
};

// 获取配置
export function getConfig(env: Env) {
  return {
    hashSalt: env.HASH_SALT || DEFAULT_CONFIG.HASH_SALT,
    pwIterations: parseInt(env.PW_ITERATIONS || DEFAULT_CONFIG.PW_ITERATIONS),
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next } = context;
  
  try {
    // 处理请求
    const response = await next();
    
    // 添加安全头
    const headers = new Headers(response.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;"
    );
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};
