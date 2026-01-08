import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../types';
import { hashPassword } from '../../utils/crypto';
import { getConfig } from '../../_middleware';

/**
 * POST /api/auth/register
 * 用户注册端点
 * 
 * 验证需求:
 * - 用户名长度 ≥ 3
 * - 密码长度 ≥ 6
 * - 用户名唯一性
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const { username, password } = await request.json();
    
    // 验证输入
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (username.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Username must be at least 3 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 获取配置
    const config = getConfig(env);
    
    // 哈希密码
    const passwordHash = await hashPassword(
      password,
      config.hashSalt,
      config.pwIterations
    );
    
    // 插入用户
    try {
      await env.DATABASE
        .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
        .bind(username, passwordHash)
        .run();
      
      return new Response(
        JSON.stringify({ success: true, message: 'Registration successful' }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbError: any) {
      if (dbError.message?.includes('UNIQUE constraint failed')) {
        return new Response(
          JSON.stringify({ error: 'Username already exists' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Registration failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
