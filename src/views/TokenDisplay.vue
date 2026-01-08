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
    <v-row v-else-if="displayKeys.length === 0" class="mt-8">
      <v-col cols="12">
        <v-card
          variant="outlined"
          class="empty-state-card text-center pa-8"
        >
          <v-icon
            size="80"
            color="grey-lighten-1"
            class="mb-4"
          >
            mdi-key-outline
          </v-icon>
          <h2 class="text-h5 mb-2">
            {{ t('keys.noKeys', 'No keys found') }}
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ t('keys.noKeysDesc', 'Add your first TOTP key to get started') }}
          </p>
          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            prepend-icon="mdi-plus"
            @click="handleAddKey"
          >
            {{ t('keys.addKey', 'Add Key') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- No Search Results -->
    <v-row v-else-if="filteredKeys.length === 0" class="mt-8">
      <v-col cols="12">
        <v-card
          variant="outlined"
          class="empty-state-card text-center pa-8"
        >
          <v-icon
            size="80"
            color="grey-lighten-1"
            class="mb-4"
          >
            mdi-magnify
          </v-icon>
          <h2 class="text-h5 mb-2">
            {{ t('keys.noResults', 'No matching keys found') }}
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ t('keys.noResultsDesc', 'Try a different search term') }}
          </p>
          <v-btn
            variant="outlined"
            @click="handleClearSearch"
          >
            {{ t('common.clearSearch', 'Clear Search') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Token Cards Grid -->
    <v-row v-else>
      <v-col
        v-for="key in filteredKeys"
        :key="key.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <TokenCard
          :id="key.id"
          :remark="key.remark"
          :secret="key.secret"
          :on-manage="isTemporaryMode ? undefined : () => handleManageKey(key.id)"
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

.empty-state-card {
  border-radius: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.gap-2 {
  gap: 8px;
}
</style>
