/**
 * API 错误处理工具
 * 
 * 需求: 15.1, 15.2
 * 
 * 功能：
 * 1. 统一 API 错误格式
 * 2. 网络错误检测
 * 3. 离线提示
 * 4. 用户友好的错误消息
 */

/**
 * API 错误类型
 */
export const ApiErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  OFFLINE: 'OFFLINE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ApiErrorType = typeof ApiErrorType[keyof typeof ApiErrorType];

/**
 * API 错误接口
 */
export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  details?: any;
  originalError?: Error;
}

/**
 * 检测是否离线
 * 
 * 需求: 15.2
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * 解析 API 错误
 * 
 * 需求: 15.1, 15.2
 * 
 * @param error - 原始错误对象
 * @param response - Fetch Response 对象（可选）
 * @returns 标准化的 API 错误对象
 */
export async function parseApiError(
  error: any,
  response?: Response
): Promise<ApiError> {
  // 检查是否离线
  if (isOffline()) {
    return {
      type: ApiErrorType.OFFLINE,
      message: 'You are currently offline. Please check your internet connection.',
      originalError: error,
    };
  }

  // 网络错误（无法连接到服务器）
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ApiErrorType.NETWORK_ERROR,
      message: 'Unable to connect to the server. Please check your internet connection.',
      originalError: error,
    };
  }

  // 超时错误
  if (error.name === 'AbortError') {
    return {
      type: ApiErrorType.TIMEOUT,
      message: 'Request timed out. Please try again.',
      originalError: error,
    };
  }

  // 如果有 Response 对象，解析 HTTP 错误
  if (response) {
    const statusCode = response.status;
    let errorMessage = 'An error occurred';
    let errorDetails: any;

    // 尝试解析错误响应体
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData;
      } else {
        errorMessage = await response.text();
      }
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError);
    }

    // 根据状态码分类错误
    switch (statusCode) {
      case 401:
        return {
          type: ApiErrorType.UNAUTHORIZED,
          message: errorMessage || 'Please login to continue',
          statusCode,
          details: errorDetails,
        };

      case 403:
        return {
          type: ApiErrorType.FORBIDDEN,
          message: errorMessage || 'You do not have permission to perform this action',
          statusCode,
          details: errorDetails,
        };

      case 404:
        return {
          type: ApiErrorType.NOT_FOUND,
          message: errorMessage || 'Resource not found',
          statusCode,
          details: errorDetails,
        };

      case 400:
      case 422:
        return {
          type: ApiErrorType.VALIDATION_ERROR,
          message: errorMessage || 'Validation error',
          statusCode,
          details: errorDetails,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ApiErrorType.SERVER_ERROR,
          message: errorMessage || 'Server error occurred. Please try again later.',
          statusCode,
          details: errorDetails,
        };

      default:
        return {
          type: ApiErrorType.UNKNOWN,
          message: errorMessage || 'An unexpected error occurred',
          statusCode,
          details: errorDetails,
        };
    }
  }

  // 未知错误
  return {
    type: ApiErrorType.UNKNOWN,
    message: error.message || 'An unexpected error occurred',
    originalError: error,
  };
}

/**
 * 获取用户友好的错误消息
 * 
 * 需求: 15.3, 15.4
 * 
 * @param error - API 错误对象
 * @returns 用户友好的错误消息
 */
export function getUserFriendlyMessage(error: ApiError): string {
  switch (error.type) {
    case ApiErrorType.OFFLINE:
      return 'You are offline. Please check your internet connection.';

    case ApiErrorType.NETWORK_ERROR:
      return 'Unable to connect to the server. Please check your connection.';

    case ApiErrorType.TIMEOUT:
      return 'Request timed out. Please try again.';

    case ApiErrorType.UNAUTHORIZED:
      return 'Please login to continue.';

    case ApiErrorType.FORBIDDEN:
      return 'You do not have permission to perform this action.';

    case ApiErrorType.NOT_FOUND:
      return 'The requested resource was not found.';

    case ApiErrorType.VALIDATION_ERROR:
      return error.message || 'Please check your input and try again.';

    case ApiErrorType.SERVER_ERROR:
      return 'Server error occurred. Please try again later.';

    default:
      return error.message || 'An unexpected error occurred.';
  }
}

/**
 * 处理 API 错误并显示通知
 * 
 * 需求: 15.1, 15.2, 15.3, 15.4
 * 
 * @param error - 原始错误对象
 * @param response - Fetch Response 对象（可选）
 * @param showNotification - 显示通知的回调函数
 */
export async function handleApiError(
  error: any,
  response?: Response,
  showNotification?: (message: string, type: 'error' | 'warning') => void
): Promise<ApiError> {
  const apiError = await parseApiError(error, response);
  const userMessage = getUserFriendlyMessage(apiError);

  // 记录错误到控制台
  console.error('API Error:', {
    type: apiError.type,
    message: apiError.message,
    statusCode: apiError.statusCode,
    details: apiError.details,
    originalError: apiError.originalError,
  });

  // 显示通知
  if (showNotification) {
    const notificationType = apiError.type === ApiErrorType.OFFLINE 
      ? 'warning' 
      : 'error';
    showNotification(userMessage, notificationType);
  }

  return apiError;
}

/**
 * 创建带有错误处理的 fetch 包装器
 * 
 * 需求: 15.1, 15.2
 * 
 * @param url - 请求 URL
 * @param options - Fetch 选项
 * @param timeout - 超时时间（毫秒），默认 30 秒
 * @returns Promise<Response>
 */
export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit,
  timeout: number = 30000
): Promise<Response> {
  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 如果响应不成功，抛出错误
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      throw { error, response };
    }

    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // 如果有 response，说明是 HTTP 错误
    if (err.response) {
      throw { error: err.error, response: err.response };
    }

    // 否则是网络错误或超时
    throw err;
  }
}

/**
 * 监听在线/离线状态变化
 * 
 * 需求: 15.2
 * 
 * @param onOnline - 上线时的回调
 * @param onOffline - 离线时的回调
 * @returns 清理函数
 */
export function watchOnlineStatus(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  const handleOnline = () => {
    console.log('Network: Online');
    onOnline?.();
  };

  const handleOffline = () => {
    console.log('Network: Offline');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
