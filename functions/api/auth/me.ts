import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../types';
import { getUserFromRequest } from '../../utils/auth';

/**
 * GET /api/auth/me
 * 获取当前用户信息端点
 * 
 * 返回当前登录用户的信息
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getUserFromRequest(context);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get user information' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
