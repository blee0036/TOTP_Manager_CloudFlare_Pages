import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../types';
import { clearSessionCookie } from '../../utils/auth';

/**
 * POST /api/auth/logout
 * 用户登出端点
 * 
 * 清除会话 Cookie
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    });
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: 'Logout failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
