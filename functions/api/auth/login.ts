import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env, User } from '../../types';
import { verifyPassword } from '../../utils/crypto';
import { createSessionCookie } from '../../utils/auth';
import { getConfig } from '../../_middleware';

/**
 * POST /api/auth/login
 * 用户登录端点
 * 
 * 验证需求:
 * - 用户名和密码验证
 * - 创建会话 Cookie
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 查询用户
    const user = await env.DATABASE
      .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
      .bind(username)
      .first<User>();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid username or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 验证密码
    const config = getConfig(env);
    const isValid = await verifyPassword(
      user.password_hash,
      password,
      config.hashSalt,
      config.pwIterations
    );
    
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid username or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 创建会话
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': createSessionCookie(user.username),
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        user: { id: user.id, username: user.username },
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Login failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
