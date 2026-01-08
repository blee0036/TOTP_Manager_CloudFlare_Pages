<template>
  <v-app>
    <!-- 应用栏 / Navigation Bar -->
    <v-app-bar
      :elevation="2"
      color="primary"
      dark
    >
      <!-- 应用标题 -->
      <v-app-bar-title>
        <router-link
          to="/"
          class="text-decoration-none text-white d-flex align-center"
        >
          <v-icon icon="mdi-shield-key" class="mr-2" />
          {{ $t('app.title') }}
        </router-link>
      </v-app-bar-title>

      <v-spacer />

      <!-- 导航链接 (桌面端) -->
      <template v-if="!mobile">
        <v-btn
          :to="{ name: 'TokenDisplay' }"
          variant="text"
          :ripple="false"
        >
          <v-icon icon="mdi-view-grid" class="mr-1" />
          {{ $t('nav.tokens') }}
        </v-btn>

        <v-btn
          :to="{ name: 'AddKey' }"
          variant="text"
          :ripple="false"
        >
          <v-icon icon="mdi-plus-circle" class="mr-1" />
          {{ $t('nav.addKey') }}
        </v-btn>

        <v-btn
          v-if="authStore.isAuthenticated"
          :to="{ name: 'ManageKeys' }"
          variant="text"
          :ripple="false"
        >
          <v-icon icon="mdi-cog" class="mr-1" />
          {{ $t('nav.manage') }}
        </v-btn>
      </template>

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
              :ripple="false"
            >
              <v-icon icon="mdi-account-circle" class="mr-1" />
              {{ authStore.user?.username }}
              <v-icon icon="mdi-menu-down" class="ml-1" />
            </v-btn>
          </template>

          <v-list>
            <v-list-item>
              <v-list-item-title>
                {{ $t('nav.welcome', { username: authStore.user?.username }) }}
              </v-list-item-title>
            </v-list-item>

            <v-divider />

            <v-list-item @click="handleLogout">
              <template v-slot:prepend>
                <v-icon icon="mdi-logout" />
              </template>
              <v-list-item-title>{{ $t('nav.logout') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-else>
        <v-btn
          :to="{ name: 'Auth' }"
          variant="text"
          :ripple="false"
        >
          <v-icon icon="mdi-login" class="mr-1" />
          {{ $t('nav.login') }}
        </v-btn>
      </template>

      <!-- 移动端菜单按钮 -->
      <v-app-bar-nav-icon
        v-if="mobile"
        @click="drawer = !drawer"
      />
    </v-app-bar>

    <!-- 移动端导航抽屉 -->
    <v-navigation-drawer
      v-if="mobile"
      v-model="drawer"
      temporary
      location="right"
    >
      <v-list>
        <v-list-item
          :to="{ name: 'TokenDisplay' }"
          @click="drawer = false"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-view-grid" />
          </template>
          <v-list-item-title>{{ $t('nav.tokens') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          :to="{ name: 'AddKey' }"
          @click="drawer = false"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-plus-circle" />
          </template>
          <v-list-item-title>{{ $t('nav.addKey') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="authStore.isAuthenticated"
          :to="{ name: 'ManageKeys' }"
          @click="drawer = false"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-cog" />
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
    <!-- 需求: 15.3, 15.4, 15.5 -->
    <v-snackbar
      v-if="notificationStore.currentNotification"
      v-model="notificationStore.currentNotification.show"
      :color="getSnackbarColor(notificationStore.currentNotification.type)"
      :timeout="notificationStore.currentNotification.timeout"
      location="top"
      @update:model-value="(val) => !val && notificationStore.closeNotification()"
    >
      <div class="d-flex align-center">
        <!-- 图标 -->
        <v-icon
          :icon="
            notificationStore.currentNotification.type === 'success' ? 'mdi-check-circle' :
            notificationStore.currentNotification.type === 'error' ? 'mdi-alert-circle' :
            notificationStore.currentNotification.type === 'warning' ? 'mdi-alert' :
            'mdi-information'
          "
          class="mr-2"
        />
        <!-- 消息文本 -->
        <span>{{ notificationStore.currentNotification.message }}</span>
      </div>
      
      <template v-slot:actions>
        <v-btn
          variant="text"
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
</script>

<style scoped>
/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
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
</style>
