// Cloudflare Pages Functions 类型定义

export interface Env {
  DATABASE: D1Database;
  HASH_SALT: string;
  PW_ITERATIONS: string;
  SESSION_SECRET?: string;
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface TOTPKey {
  id: number;
  user_id: number;
  remark: string;
  secret: string;
  created_at: string;
}
