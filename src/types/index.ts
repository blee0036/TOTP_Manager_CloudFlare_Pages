// 全局类型定义

export interface User {
  id: number;
  username: string;
}

export interface TOTPKey {
  id: number | string;
  remark: string;
  secret: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface KeysState {
  keys: TOTPKey[];
  isLoading: boolean;
  searchQuery: string;
}

export interface SettingsState {
  locale: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface ApiError {
  error: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
