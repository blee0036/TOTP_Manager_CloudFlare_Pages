import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../types';
import { requireAuth } from '../../utils/auth';

/**
 * PUT /api/keys/:id
 * 更新密钥备注
 * 
 * 验证需求:
 * - 备注必填
 * - 只能更新自己的密钥
 */
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const userOrResponse = await requireAuth(context);
  if (userOrResponse instanceof Response) {
    return userOrResponse;
  }
  
  const user = userOrResponse;
  const { request, env, params } = context;
  const keyId = params.id as string;
  
  try {
    const { remark } = await request.json();
    
    if (!remark || remark.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Remark cannot be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 更新密钥（仅当属于当前用户）
    const result = await env.DATABASE
      .prepare('UPDATE totp_keys SET remark = ? WHERE id = ? AND user_id = ?')
      .bind(remark.trim(), keyId, user.id)
      .run();
    
    if (result.meta.changes === 0) {
      return new Response(
        JSON.stringify({ error: 'Key not found or unauthorized' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 获取更新后的记录
    const updatedKey = await env.DATABASE
      .prepare('SELECT id, remark, secret, created_at FROM totp_keys WHERE id = ?')
      .bind(keyId)
      .first();
    
    return new Response(
      JSON.stringify({ success: true, key: updatedKey }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Update key error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update key' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /api/keys/:id
 * 删除密钥
 * 
 * 验证需求:
 * - 只能删除自己的密钥
 */
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const userOrResponse = await requireAuth(context);
  if (userOrResponse instanceof Response) {
    return userOrResponse;
  }
  
  const user = userOrResponse;
  const { env, params } = context;
  const keyId = params.id as string;
  
  try {
    const result = await env.DATABASE
      .prepare('DELETE FROM totp_keys WHERE id = ? AND user_id = ?')
      .bind(keyId, user.id)
      .run();
    
    if (result.meta.changes === 0) {
      return new Response(
        JSON.stringify({ error: 'Key not found or unauthorized' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Delete key error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete key' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
