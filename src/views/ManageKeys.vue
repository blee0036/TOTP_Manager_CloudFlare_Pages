<template>
  <v-container class="manage-keys-container">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <!-- Page Header -->
        <div class="mb-6">
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            @click="handleBack"
            class="mb-4"
          >
            {{ t('common.back', 'Back') }}
          </v-btn>
          <h1 class="text-h4 font-weight-bold">
            {{ t('nav.manage', 'Manage Keys') }}
          </h1>
          <p class="text-subtitle-1 text-medium-emphasis mt-2">
            {{ t('keys.manageDesc', 'Edit or delete your TOTP keys') }}
          </p>
        </div>

        <!-- Search Bar -->
        <v-row v-if="keys.length > 0" class="mb-4">
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
        <v-row v-else-if="keys.length === 0" class="mt-8">
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

        <!-- Keys List -->
        <v-row v-else>
          <v-col cols="12">
            <v-card elevation="2" class="keys-list-card">
              <v-list lines="two">
                <template v-for="(key, index) in filteredKeys" :key="key.id">
                  <v-list-item>
                    <template #prepend>
                      <v-avatar color="primary" variant="tonal">
                        <v-icon>mdi-key</v-icon>
                      </v-avatar>
                    </template>

                    <v-list-item-title class="font-weight-medium">
                      {{ key.remark }}
                    </v-list-item-title>

                    <v-list-item-subtitle class="text-caption">
                      {{ t('keys.addedOn', 'Added on') }}: {{ formatDate(key.createdAt) }}
                    </v-list-item-subtitle>

                    <template #append>
                      <div class="d-flex gap-2">
                        <v-btn
                          icon="mdi-pencil"
                          size="small"
                          variant="text"
                          color="primary"
                          @click="handleEditKey(key)"
                        />
                        <v-btn
                          icon="mdi-delete"
                          size="small"
                          variant="text"
                          color="error"
                          @click="handleDeleteKey(key)"
                        />
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider v-if="index < filteredKeys.length - 1" />
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- Edit Dialog -->
        <v-dialog
          v-model="showEditDialog"
          max-width="600"
          persistent
        >
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-h6">{{ t('keys.editKey', 'Edit Key') }}</span>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="handleCancelEdit"
              />
            </v-card-title>

            <v-card-text class="pt-4">
              <v-text-field
                v-model="editForm.remark"
                :label="t('keys.remark', 'Remark') + ' *'"
                :placeholder="t('keys.remarkPlaceholder', 'e.g., Google, GitHub')"
                :rules="remarkRules"
                :error-messages="editError"
                variant="outlined"
                density="comfortable"
                required
                @update:model-value="editError = ''"
              />
            </v-card-text>

            <v-card-actions class="px-6 pb-4">
              <v-spacer />
              <v-btn
                variant="text"
                @click="handleCancelEdit"
                :disabled="isSubmitting"
              >
                {{ t('common.cancel', 'Cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="elevated"
                @click="handleSaveEdit"
                :loading="isSubmitting"
                :disabled="!editForm.remark || isSubmitting"
              >
                {{ t('common.save', 'Save') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog
          v-model="showDeleteDialog"
          max-width="500"
        >
          <v-card>
            <v-card-title class="text-h6">
              {{ t('keys.confirmDeleteTitle', 'Confirm Delete') }}
            </v-card-title>

            <v-card-text>
              <p class="text-body-1">
                {{ t('keys.confirmDelete', { remark: deleteTarget?.remark || '' }, 'Are you sure you want to delete "{remark}"?') }}
              </p>
              <v-alert
                type="warning"
                variant="tonal"
                density="compact"
                class="mt-4"
              >
                {{ t('keys.deleteWarning', 'This action cannot be undone.') }}
              </v-alert>
            </v-card-text>

            <v-card-actions class="px-6 pb-4">
              <v-spacer />
              <v-btn
                variant="text"
                @click="handleCancelDelete"
                :disabled="isSubmitting"
              >
                {{ t('common.cancel', 'Cancel') }}
              </v-btn>
              <v-btn
                color="error"
                variant="elevated"
                @click="handleConfirmDelete"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                {{ t('common.delete', 'Delete') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Error Snackbar -->
        <v-snackbar
          v-model="showError"
          color="error"
          :timeout="5000"
          location="top"
        >
          {{ errorMessage }}
          <template #actions>
            <v-btn
              variant="text"
              @click="showError = false"
            >
              {{ t('common.close', 'Close') }}
            </v-btn>
          </template>
        </v-snackbar>

        <!-- Success Snackbar -->
        <v-snackbar
          v-model="showSuccess"
          color="success"
          :timeout="3000"
          location="top"
        >
          {{ successMessage }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { useKeysStore } from '../stores/keys';
import SearchBar from '../components/SearchBar.vue';
import type { TOTPKey } from '../types';

/**
 * ManageKeys.vue 页面
 * 
 * 管理 TOTP 密钥，支持编辑备注和删除
 * 
 * 需求: 6.9, 6.10, 6.11, 8.2
 */

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const keysStore = useKeysStore();

// Component state
const searchQuery = ref('');
const isLoading = ref(false);
const isSubmitting = ref(false);
const showError = ref(false);
const errorMessage = ref('');
const showSuccess = ref(false);
const successMessage = ref('');

// Edit dialog state
const showEditDialog = ref(false);
const editTarget = ref<TOTPKey | null>(null);
const editForm = reactive({
  remark: '',
});
const editError = ref('');

// Delete dialog state
const showDeleteDialog = ref(false);
const deleteTarget = ref<TOTPKey | null>(null);

/**
 * Get keys from store
 */
const keys = computed(() => keysStore.keys);

/**
 * Filter keys based on search query
 * 需求: 8.2
 */
const filteredKeys = computed(() => {
  if (!searchQuery.value || searchQuery.value.trim() === '') {
    return keys.value;
  }

  const normalizedQuery = searchQuery.value.toLowerCase().trim();
  
  return keys.value.filter(key => {
    const normalizedRemark = key.remark.toLowerCase();
    return normalizedRemark.includes(normalizedQuery);
  });
});

// Validation rules
const remarkRules = [
  (v: string) => !!v || t('errors.remarkRequired', 'Remark is required'),
  (v: string) => (v && v.trim().length > 0) || t('errors.remarkEmpty', 'Remark cannot be empty'),
];

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

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
 * Handle back button
 */
const handleBack = () => {
  router.back();
};

/**
 * Handle add key button
 */
const handleAddKey = () => {
  router.push('/add');
};

/**
 * Handle edit key
 * 需求: 6.9
 */
const handleEditKey = (key: TOTPKey) => {
  editTarget.value = key;
  editForm.remark = key.remark;
  editError.value = '';
  showEditDialog.value = true;
};

/**
 * Handle cancel edit
 */
const handleCancelEdit = () => {
  showEditDialog.value = false;
  editTarget.value = null;
  editForm.remark = '';
  editError.value = '';
};

/**
 * Handle save edit
 * 需求: 6.9, 6.11
 */
const handleSaveEdit = async () => {
  if (!editTarget.value) return;

  // Validate remark
  if (!editForm.remark.trim()) {
    editError.value = t('errors.remarkEmpty', 'Remark cannot be empty');
    return;
  }

  isSubmitting.value = true;

  try {
    await keysStore.updateKey(Number(editTarget.value.id), {
      remark: editForm.remark.trim(),
    });

    successMessage.value = t('success.keyUpdated', 'Key updated successfully');
    showSuccess.value = true;

    // Close dialog
    handleCancelEdit();
  } catch (error: any) {
    errorMessage.value = error.message || t('errors.updateKeyFailed', 'Failed to update key');
    showError.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Handle delete key
 * 需求: 6.10
 */
const handleDeleteKey = (key: TOTPKey) => {
  deleteTarget.value = key;
  showDeleteDialog.value = true;
};

/**
 * Handle cancel delete
 */
const handleCancelDelete = () => {
  showDeleteDialog.value = false;
  deleteTarget.value = null;
};

/**
 * Handle confirm delete
 * 需求: 6.10, 6.11
 */
const handleConfirmDelete = async () => {
  if (!deleteTarget.value) return;

  isSubmitting.value = true;

  try {
    await keysStore.deleteKey(Number(deleteTarget.value.id));

    successMessage.value = t('success.keyDeleted', 'Key deleted successfully');
    showSuccess.value = true;

    // Close dialog
    handleCancelDelete();
  } catch (error: any) {
    errorMessage.value = error.message || t('errors.deleteKeyFailed', 'Failed to delete key');
    showError.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Load keys on mount
 */
onMounted(async () => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Redirect to login
    router.push('/login');
    return;
  }

  // Fetch keys if not already loaded
  if (keys.value.length === 0) {
    isLoading.value = true;
    try {
      await keysStore.fetchKeys();
    } catch (error) {
      console.error('Failed to fetch keys:', error);
      errorMessage.value = t('errors.fetchKeysFailed', 'Failed to load keys');
      showError.value = true;
    } finally {
      isLoading.value = false;
    }
  }
});
</script>

<style scoped>
.manage-keys-container {
  padding-top: 24px;
  padding-bottom: 24px;
}

.empty-state-card {
  border-radius: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.keys-list-card {
  border-radius: 12px;
}

.gap-2 {
  gap: 8px;
}
</style>
