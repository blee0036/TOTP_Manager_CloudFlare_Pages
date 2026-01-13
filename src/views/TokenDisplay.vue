<template>
  <v-container class="token-display-container">
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center flex-wrap">
          <div>
            <h1 class="text-h4 font-weight-bold">
              {{ t('nav.tokens', 'Tokens') }}
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis mt-1">
              {{ isTemporaryMode 
                ? t('auth.temporaryModeDesc', 'Keys stored in browser only')
                : t('token.syncedMode', 'Keys synced to your account')
              }}
            </p>
          </div>
          <div class="d-flex gap-2 mt-2 mt-sm-0">
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              @click="handleAddKey"
            >
              {{ t('keys.addKey', 'Add Key') }}
            </v-btn>
            <v-btn
              v-if="!isTemporaryMode"
              variant="outlined"
              prepend-icon="mdi-cog"
              @click="handleManageKeys"
            >
              {{ t('nav.manage', 'Manage') }}
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Search Bar -->
    <v-row v-if="displayKeys.length > 0" class="mb-4">
      <v-col cols="12" md="8" lg="6">
        <SearchBar
          v-model="searchQuery"
          :show-result-count="true"
          :result-count="filteredKeys.length"
          @search="handleSearch"
          @clear="handleClearSearch"
        />
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="isLoading" class="mt-8">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
        <p class="text-subtitle-1 mt-4">
          {{ t('common.loading', 'Loading...') }}
        </p>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else-if="displayKeys.length === 0" class="mt-12 justify-center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <div class="empty-state text-center">
          <!-- 装饰性图标带发光效果 -->
          <div class="empty-icon-wrapper mb-8">
            <div class="glow-effect"></div>
            <v-icon
              size="120"
              class="empty-icon"
            >
              mdi-shield-key-outline
            </v-icon>
          </div>
          <!-- 标题 -->
          <h2 class="empty-title text-h5 font-weight-medium mb-4">
            {{ t('keys.noKeys', 'No keys found') }}
          </h2>
          <!-- 描述文字 -->
          <p class="empty-desc text-body-1 mb-8">
            {{ t('keys.noKeysDesc', 'Add your first 2FA key to get started') }}
          </p>
          <!-- 行动按钮 - 紫色渐变 -->
          <v-btn
            size="large"
            class="add-key-btn text-none font-weight-medium px-8"
            @click="handleAddKey"
          >
            <v-icon start>mdi-plus</v-icon>
            {{ t('keys.addKey', 'Add Key') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- No Search Results -->
    <v-row v-else-if="filteredKeys.length === 0" class="mt-12 justify-center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <div class="empty-state text-center">
          <div class="empty-icon-wrapper mb-8">
            <div class="glow-effect glow-effect-subtle"></div>
            <v-icon
              size="120"
              class="empty-icon empty-icon-secondary"
            >
              mdi-magnify
            </v-icon>
          </div>
          <h2 class="empty-title text-h5 font-weight-medium mb-4">
            {{ t('keys.noResults', 'No matching keys found') }}
          </h2>
          <p class="empty-desc text-body-1 mb-8">
            {{ t('keys.noResultsDesc', 'Try a different search term') }}
          </p>
          <v-btn
            variant="outlined"
            color="primary"
            size="large"
            class="clear-search-btn text-none font-weight-medium px-8"
            @click="handleClearSearch"
          >
            {{ t('common.clearSearch', 'Clear Search') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Token Cards Grid - 响应式布局 -->
    <!-- 需求 8.1: 移动端单列, 需求 8.2: 平板双列, 需求 8.3: 桌面三到四列 -->
    <v-row v-else class="token-grid">
      <v-col
        v-for="key in filteredKeys"
        :key="key.id"
        cols="12"
        sm="6"
        md="6"
        lg="4"
        xl="3"
      >
        <TokenCard
          :id="key.id"
          :remark="key.remark"
          :secret="key.secret"
          @copy="handleCopyToken"
          @manage="handleManageKey"
        />
      </v-col>
    </v-row>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      :timeout="2000"
      location="top"
    >
      {{ successMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { useKeysStore } from '../stores/keys';
import { useLocalStorage } from '../composables/useLocalStorage';
import TokenCard from '../components/TokenCard.vue';
import SearchBar from '../components/SearchBar.vue';

/**
 * TokenDisplay.vue 页面
 * 
 * 显示 TOTP 令牌卡片列表，支持搜索和本地存储模式
 * 
 * 需求: 4.3, 7.3, 8.2
 */

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const keysStore = useKeysStore();
const localStorage = useLocalStorage();

// Component state
const searchQuery = ref('');
const isLoading = ref(false);
const showSuccess = ref(false);
const successMessage = ref('');

/**
 * Check if in temporary mode (not authenticated)
 * 需求: 7.3
 */
const isTemporaryMode = computed(() => !authStore.isAuthenticated);

/**
 * Get keys based on mode (authenticated or temporary)
 * 需求: 7.3
 */
const displayKeys = computed(() => {
  if (isTemporaryMode.value) {
    return localStorage.keys.value;
  } else {
    return keysStore.keys;
  }
});

/**
 * Filter keys based on search query
 * 需求: 8.2
 */
const filteredKeys = computed(() => {
  if (!searchQuery.value || searchQuery.value.trim() === '') {
    return displayKeys.value;
  }

  const normalizedQuery = searchQuery.value.toLowerCase().trim();
  
  return displayKeys.value.filter(key => {
    const normalizedRemark = key.remark.toLowerCase();
    return normalizedRemark.includes(normalizedQuery);
  });
});

/**
 * Handle search input
 */
const handleSearch = (query: string) => {
  searchQuery.value = query;
};

/**
 * Handle clear search
 */
const handleClearSearch = () => {
  searchQuery.value = '';
};

/**
 * Handle add key button click
 */
const handleAddKey = () => {
  router.push('/add');
};

/**
 * Handle manage keys button click
 */
const handleManageKeys = () => {
  router.push('/manage');
};

/**
 * Handle manage single key
 */
const handleManageKey = (id: string | number) => {
  router.push(`/manage?key=${id}`);
};

/**
 * Handle token copy
 */
const handleCopyToken = () => {
  successMessage.value = t('token.copied', 'Copied to clipboard!');
  showSuccess.value = true;
};

/**
 * Load keys on mount
 * 需求: 4.3
 */
onMounted(async () => {
  // If authenticated, fetch keys from server
  if (authStore.isAuthenticated) {
    isLoading.value = true;
    try {
      await keysStore.fetchKeys();
    } catch (error) {
      console.error('Failed to fetch keys:', error);
    } finally {
      isLoading.value = false;
    }
  }
  // If in temporary mode, keys are already loaded from localStorage
});

/**
 * Watch authentication state changes
 */
watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth) {
    // User just logged in, fetch keys
    isLoading.value = true;
    try {
      await keysStore.fetchKeys();
    } catch (error) {
      console.error('Failed to fetch keys:', error);
    } finally {
      isLoading.value = false;
    }
  } else {
    // User logged out, clear keys store
    keysStore.clearKeys();
  }
});
</script>

<style scoped>
.token-display-container {
  padding-top: 24px;
  padding-bottom: 24px;
}

/* 响应式网格布局 - 需求 8.1, 8.2, 8.3 */
.token-grid {
  margin: 0 -8px;
}

.token-grid > .v-col {
  padding: 8px;
}

/* 移动端优化 - 需求 8.1, 8.5 */
@media (max-width: 599px) {
  .token-display-container {
    padding-top: 16px;
    padding-bottom: 16px;
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .token-grid {
    margin: 0 -6px;
  }
  
  .token-grid > .v-col {
    padding: 6px;
  }
}

/* 平板端优化 - 需求 8.2 */
@media (min-width: 600px) and (max-width: 959px) {
  .token-display-container {
    padding-top: 20px;
    padding-bottom: 20px;
  }
  
  .token-grid > .v-col {
    padding: 10px;
  }
}

/* 桌面端优化 - 需求 8.3 */
@media (min-width: 960px) {
  .token-grid > .v-col {
    padding: 12px;
  }
}

.empty-state {
  padding: 80px 24px;
  max-width: 600px;
  margin: 0 auto;
}

.empty-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
}

/* 发光效果背景 */
.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: var(--gradient-radial-purple);
  box-shadow: var(--shadow-glow-lg);
  animation: glow-pulse 3s ease-in-out infinite;
}

/* 次要发光效果（搜索无结果状态） */
.glow-effect-subtle {
  opacity: 0.4;
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.15);
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.empty-icon {
  position: relative;
  z-index: 1;
  color: rgb(var(--v-theme-primary));
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.4));
}

.empty-icon-secondary {
  color: rgb(var(--v-theme-on-surface-variant));
  filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.2));
}

.empty-title {
  color: rgb(var(--v-theme-on-background));
}

.empty-desc {
  color: rgb(var(--v-theme-on-surface-variant));
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* 紫色渐变按钮 */
.add-key-btn {
  background: var(--gradient-primary) !important;
  color: white !important;
  border-radius: 12px !important;
  box-shadow: var(--shadow-purple) !important;
  transition: transform var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out) !important;
}

.add-key-btn:hover {
  background: var(--gradient-primary-hover) !important;
  box-shadow: var(--shadow-purple-lg) !important;
  transform: translateY(-2px);
}

.add-key-btn:active {
  transform: scale(0.98);
}

/* 清除搜索按钮 */
.clear-search-btn {
  border-radius: 12px !important;
  border-color: rgb(var(--v-theme-primary)) !important;
  transition: transform var(--duration-fast) var(--ease-out),
              background-color var(--duration-fast) var(--ease-out) !important;
}

.clear-search-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
  transform: translateY(-2px);
}

.clear-search-btn:active {
  transform: scale(0.98);
}

.gap-2 {
  gap: 8px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .glow-effect {
    animation: none;
  }
  
  .add-key-btn:hover,
  .clear-search-btn:hover {
    transform: none;
  }
  
  .add-key-btn:active,
  .clear-search-btn:active {
    transform: none;
  }
}
</style>
