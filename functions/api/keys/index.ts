import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env, TOTPKey } from '../../types';
import { requireAuth } from '../../utils/auth';

/**
 * GET /api/keys
 * 获取用户的所有密钥
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userOrResponse = await requireAuth(context);
  if (userOrResponse instanceof Response) {
    return userOrResponse;
  }
  
  const user = userOrResponse;
  const { env } = context;
  
  try {
    const { results } = await env.DATABASE
      .prepare('SELECT id, remark, secret, created_at FROM totp_keys WHERE user_id = ? ORDER BY remark')
      .bind(user.id)
      .all();
    
    return new Response(
      JSON.stringify({ keys: results || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get keys error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch keys' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * POST /api/keys
 * 添加新密钥
 * 
 * 验证需求:
 * - 备注必填
 * - 密钥格式验证（Base32）
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const userOrResponse = await requireAuth(context);
  if (userOrResponse instanceof Response) {
    return userOrResponse;
  }
  
  const user = userOrResponse;
  const { request, env } = context;
  
  try {
    const { remark, secret } = await request.json();
    
    // 验证输入
    if (!remark || !secret) {
      return new Response(
        JSON.stringify({ error: 'Remark and secret are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (remark.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Remark cannot be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 验证 Base32 格式
    const cleanedSecret = secret.toUpperCase().replace(/\s+/g, '');
    const base32Regex = /^[A-Z2-7]+=*$/;
    
    if (!base32Regex.test(cleanedSecret) || cleanedSecret.replace(/=+$/, '').length < 8) {
      return new Response(
        JSON.stringify({ error: 'Invalid secret format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 插入密钥
    const result = await env.DATABASE
      .prepare('INSERT INTO totp_keys (user_id, remark, secret) VALUES (?, ?, ?)')
      .bind(user.id, remark.trim(), cleanedSecret)
      .run();
    
    // 获取插入的记录
    const newKey = await env.DATABASE
      .prepare('SELECT id, remark, secret, created_at FROM totp_keys WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();
    
    return new Response(
      JSON.stringify({ success: true, key: newKey }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Add key error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add key' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
