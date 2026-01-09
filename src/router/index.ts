import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

/**
 * Vue Router 配置
 * 
 * 需求: 1.1
 * 
 * 路由规则：
 * - / - 令牌展示页面（需要认证或临时模式）
 * - /auth - 登录/注册页面
 * - /add - 添加密钥页面
 * - /manage - 管理密钥页面（需要认证）
 */

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'TokenDisplay',
    component: () => import('../views/TokenDisplay.vue'),
    meta: {
      title: 'TOTP Tokens',
      requiresAuth: false, // 支持临时模式
    },
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/Auth.vue'),
    meta: {
      title: 'Login / Register',
      requiresAuth: false,
      guestOnly: true, // 已登录用户访问时重定向到首页
    },
  },
  {
    path: '/add',
    name: 'AddKey',
    component: () => import('../views/AddKey.vue'),
    meta: {
      title: 'Add Key',
      requiresAuth: false, // 支持临时模式
    },
  },
  {
    path: '/manage',
    name: 'ManageKeys',
    component: () => import('../views/ManageKeys.vue'),
    meta: {
      title: 'Manage Keys',
      requiresAuth: true, // 仅登录用户可访问
    },
  },
  {
    // 404 页面 - 重定向到首页
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * 全局前置守卫
 * 
 * 实现认证检查和路由保护
 * 
 * 逻辑：
 * 1. 检查路由是否需要认证 (requiresAuth: true)
 * 2. 如果需要认证但用户未登录，重定向到 /auth
 * 3. 如果是 guestOnly 路由但用户已登录，重定向到首页
 * 4. 更新页面标题
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // 如果是首次加载，检查认证状态
  if (from.name === undefined && !authStore.isLoading) {
    await authStore.checkAuth();
  }
  
  // 检查是否需要认证
  const requiresAuth = to.meta.requiresAuth === true;
  const guestOnly = to.meta.guestOnly === true;
  const isAuthenticated = authStore.isAuthenticated;
  
  // 需要认证但未登录 - 重定向到登录页
  if (requiresAuth && !isAuthenticated) {
    next({
      name: 'Auth',
      query: { redirect: to.fullPath }, // 保存原始目标路径
    });
    return;
  }
  
  // 仅访客页面但已登录 - 重定向到首页
  if (guestOnly && isAuthenticated) {
    next({ name: 'TokenDisplay' });
    return;
  }
  
  // 更新页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 2FA 身份验证器`;
  } else {
    document.title = '2FA 身份验证器';
  }
  
  next();
});

/**
 * 全局后置钩子
 * 
 * 可用于页面加载完成后的操作
 * 例如：滚动到顶部、分析统计等
 */
router.afterEach(() => {
  // 页面切换后滚动到顶部
  window.scrollTo(0, 0);
});

export default router;
