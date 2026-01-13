<template>
  <v-app>
    <!-- 应用栏 / Navigation Bar - 毛玻璃效果 -->
    <v-app-bar
      :elevation="0"
      class="app-navbar"
      height="64"
    >
      <!-- 应用标题 / Logo -->
      <v-app-bar-title>
        <router-link
          to="/"
          class="logo-link d-flex align-center"
        >
          <v-icon icon="mdi-shield-key" class="logo-icon mr-2" size="24" />
          <span class="logo-text">{{ $t('app.title') }}</span>
        </router-link>
      </v-app-bar-title>

      <v-spacer />

      <!-- 导航链接 (桌面端) - 图标按钮 + tooltip -->
      <template v-if="!mobile">
        <v-tooltip :text="$t('nav.tokens')" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              :to="{ name: 'TokenDisplay' }"
              icon
              variant="text"
              class="nav-icon-btn mx-1"
              size="44"
            >
              <v-icon icon="mdi-view-grid" size="20" />
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip :text="$t('nav.addKey')" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              :to="{ name: 'AddKey' }"
              icon
              variant="text"
              class="nav-icon-btn mx-1"
              size="44"
            >
              <v-icon icon="mdi-plus-circle" size="20" />
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip v-if="authStore.isAuthenticated" :text="$t('nav.manage')" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              :to="{ name: 'ManageKeys' }"
              icon
              variant="text"
              class="nav-icon-btn mx-1"
              size="44"
            >
              <v-icon icon="mdi-cog" size="20" />
            </v-btn>
          </template>
        </v-tooltip>
      </template>

      <!-- 分隔线 -->
      <div v-if="!mobile" class="nav-divider mx-2"></div>

      <!-- 主题切换按钮 -->
      <ThemeToggle />

      <!-- 语言选择器 -->
      <LanguageSelector />

      <!-- 用户信息和登录/登出 -->
      <template v-if="authStore.isAuthenticated">
        <!-- 用户菜单 -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="user-menu-btn ml-1"
              :ripple="false"
            >
              <v-icon icon="mdi-account-circle" size="20" />
              <span class="user-name ml-2" v-if="!mobile">{{ authStore.user?.username }}</span>
              <v-icon icon="mdi-menu-down" size="16" class="ml-1" />
            </v-btn>
          </template>

          <v-list class="user-menu-list">
            <v-list-item>
              <v-list-item-title class="text-caption">
                {{ $t('nav.welcome', { username: authStore.user?.username }) }}
              </v-list-item-title>
            </v-list-item>

            <v-divider />

            <v-list-item @click="handleLogout" class="logout-item">
              <template v-slot:prepend>
                <v-icon icon="mdi-logout" size="18" />
              </template>
              <v-list-item-title>{{ $t('nav.logout') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-else>
        <v-tooltip :text="$t('nav.login')" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              :to="{ name: 'Auth' }"
              icon
              variant="text"
              class="nav-icon-btn ml-1"
              size="44"
            >
              <v-icon icon="mdi-login" size="20" />
            </v-btn>
          </template>
        </v-tooltip>
      </template>

      <!-- 移动端菜单按钮 -->
      <v-app-bar-nav-icon
        v-if="mobile"
        @click="drawer = !drawer"
        class="mobile-menu-btn"
      />
    </v-app-bar>

    <!-- 移动端导航抽屉 -->
    <v-navigation-drawer
      v-if="mobile"
      v-model="drawer"
      temporary
      location="right"
      class="mobile-drawer"
    >
      <v-list class="mobile-nav-list">
        <v-list-item
          :to="{ name: 'TokenDisplay' }"
          @click="drawer = false"
          class="mobile-nav-item"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-view-grid" size="20" />
          </template>
          <v-list-item-title>{{ $t('nav.tokens') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          :to="{ name: 'AddKey' }"
          @click="drawer = false"
          class="mobile-nav-item"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-plus-circle" size="20" />
          </template>
          <v-list-item-title>{{ $t('nav.addKey') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="authStore.isAuthenticated"
          :to="{ name: 'ManageKeys' }"
          @click="drawer = false"
          class="mobile-nav-item"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-cog" size="20" />
          </template>
          <v-list-item-title>{{ $t('nav.manage') }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- 主内容区域 -->
    <v-main>
      <v-container fluid>
        <!-- 路由视图 -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- 全局 Snackbar 用于显示消息 -->
    <!-- 需求: 9.3, 9.4, 15.3, 15.4, 15.5 -->
    <v-snackbar
      v-if="notificationStore.currentNotification"
      v-model="notificationStore.currentNotification.show"
      :color="getSnackbarColor(notificationStore.currentNotification.type)"
      :timeout="notificationStore.currentNotification.timeout"
      location="top"
      class="app-snackbar"
      @update:model-value="(val) => !val && notificationStore.closeNotification()"
    >
      <div class="d-flex align-center snackbar-content">
        <!-- 图标 -->
        <v-icon
          :icon="getSnackbarIcon(notificationStore.currentNotification.type)"
          class="snackbar-icon mr-3"
          size="22"
        />
        <!-- 消息文本 -->
        <span class="snackbar-message">{{ notificationStore.currentNotification.message }}</span>
      </div>
      
      <template v-slot:actions>
        <!-- 重试按钮 (仅错误时显示) -->
        <v-btn
          v-if="notificationStore.currentNotification.type === 'error'"
          variant="text"
          size="small"
          class="retry-btn"
          @click="handleRetry"
        >
          {{ $t('common.retry') || 'Retry' }}
        </v-btn>
        <!-- 关闭按钮 -->
        <v-btn
          variant="text"
          size="small"
          class="close-btn"
          @click="notificationStore.closeNotification()"
        >
          {{ $t('common.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useAuthStore } from './stores/auth';
import { useNotificationStore } from './stores/notification';
import ThemeToggle from './components/ThemeToggle.vue';
import LanguageSelector from './components/LanguageSelector.vue';

/**
 * App.vue - 应用根组件
 * 
 * 需求: 3.1, 14.7, 15.3, 15.4, 15.5
 * 
 * 功能：
 * 1. 导航栏 - 显示应用标题和导航链接
 * 2. 语言选择器 - 支持 18 种语言切换
 * 3. 主题切换 - 明暗主题切换
 * 4. 用户信息 - 显示登录用户名和登出按钮
 * 5. 响应式布局 - 移动端使用抽屉式导航
 * 6. 全局消息提示 - Snackbar 组件
 */

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { mobile } = useDisplay();

// 移动端导航抽屉状态
const drawer = ref(false);

/**
 * 处理用户登出
 */
async function handleLogout() {
  try {
    await authStore.logout();
    router.push({ name: 'Auth' });
    notificationStore.showSuccess('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    notificationStore.showError('Logout failed');
  }
}

/**
 * 获取 Snackbar 颜色
 * 根据通知类型返回对应的 Vuetify 颜色
 */
function getSnackbarColor(type: string): string {
  switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return 'info';
  }
}

/**
 * 获取 Snackbar 图标
 * 根据通知类型返回对应的图标
 */
function getSnackbarIcon(type: string): string {
  switch (type) {
    case 'success':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'warning':
      return 'mdi-alert';
    case 'info':
      return 'mdi-information';
    default:
      return 'mdi-information';
  }
}

/**
 * 处理重试操作
 * 关闭当前通知并触发重试事件
 */
function handleRetry() {
  notificationStore.closeNotification();
  // 可以在这里添加重试逻辑，或者通过事件总线通知其他组件
  // 目前简单地关闭通知，让用户手动重试
}
</script>

<style scoped>
/* 导航栏 - 毛玻璃效果 */
.app-navbar {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(139, 92, 246, 0.2) !important;
}

/* 暗色主题导航栏 */
.v-theme--dark .app-navbar {
  background: rgba(10, 10, 11, 0.8) !important;
  border-bottom: 1px solid rgba(139, 92, 246, 0.3) !important;
}

/* Logo 链接样式 */
.logo-link {
  text-decoration: none;
  color: inherit;
  transition: opacity var(--duration-fast, 200ms) ease;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo-icon {
  color: rgb(var(--v-theme-primary));
}

.logo-text {
  font-weight: 600;
  font-size: 1.125rem;
  letter-spacing: 0.5px;
}

/* 导航图标按钮 */
.nav-icon-btn {
  color: rgb(var(--v-theme-on-surface)) !important;
  transition: all var(--duration-fast, 200ms) ease;
}

.nav-icon-btn:hover {
  color: rgb(var(--v-theme-primary)) !important;
  background: rgba(139, 92, 246, 0.1) !important;
}

.nav-icon-btn.v-btn--active {
  color: rgb(var(--v-theme-primary)) !important;
  background: rgba(139, 92, 246, 0.15) !important;
}

/* 导航分隔线 */
.nav-divider {
  width: 1px;
  height: 24px;
  background: rgba(139, 92, 246, 0.2);
}

/* 用户菜单按钮 */
.user-menu-btn {
  color: rgb(var(--v-theme-on-surface)) !important;
  text-transform: none !important;
  font-weight: 500;
  letter-spacing: 0.25px;
}

.user-menu-btn:hover {
  background: rgba(139, 92, 246, 0.1) !important;
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 用户菜单列表 */
.user-menu-list {
  min-width: 180px;
}

.logout-item:hover {
  color: rgb(var(--v-theme-error));
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  color: rgb(var(--v-theme-on-surface)) !important;
}

/* 移动端抽屉 */
.mobile-drawer {
  background: rgb(var(--v-theme-surface)) !important;
}

.mobile-nav-list {
  padding-top: 16px;
}

.mobile-nav-item {
  margin: 4px 8px;
  border-radius: 12px;
}

.mobile-nav-item:hover {
  background: rgba(139, 92, 246, 0.1);
}

.mobile-nav-item.v-list-item--active {
  background: rgba(139, 92, 246, 0.15);
  color: rgb(var(--v-theme-primary));
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal, 300ms) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移除链接下划线 */
.text-decoration-none {
  text-decoration: none;
}

/* 确保链接颜色继承 */
a {
  color: inherit;
}

/* Snackbar 样式增强 */
.app-snackbar :deep(.v-snackbar__wrapper) {
  min-width: 320px;
  max-width: 500px;
}

.snackbar-content {
  padding: 4px 0;
}

.snackbar-icon {
  flex-shrink: 0;
}

.snackbar-message {
  font-weight: 500;
  line-height: 1.4;
}

.app-snackbar :deep(.v-snackbar__actions) {
  margin-right: -8px;
}

.app-snackbar .close-btn,
.app-snackbar .retry-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  min-width: auto;
  padding: 0 12px;
}

.app-snackbar .retry-btn {
  background: rgba(255, 255, 255, 0.15);
  margin-right: 4px;
}

.app-snackbar .retry-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
