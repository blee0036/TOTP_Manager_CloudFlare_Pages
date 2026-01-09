<template>
  <v-container class="add-key-container">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- Page Header -->
        <div class="mb-6">
          <v-btn
            variant="plain"
            prepend-icon="mdi-arrow-left"
            @click="handleBack"
            class="mb-4"
            color="on-surface"
          >
            {{ t('common.back', 'Back') }}
          </v-btn>
          <h1 class="text-h4 font-weight-bold">
            {{ t('keys.addKey', 'Add Key') }}
          </h1>
          <p class="text-subtitle-1 text-medium-emphasis mt-2">
            {{ isTemporaryMode 
              ? t('keys.addKeyTempDesc', 'Add a new 2FA key (stored locally)')
              : t('keys.addKeyDesc', 'Add a new 2FA key to your account')
            }}
          </p>
        </div>

        <!-- Main Card -->
        <v-card elevation="2" class="add-key-card">
          <v-card-text class="pa-6">
            <!-- QR Scanner Section -->
            <div class="mb-6">
              <h2 class="text-h6 mb-3">
                {{ t('keys.scanQR', 'Scan QR Code') }}
              </h2>
              <QRScanner
                @scan="handleQRScan"
                @error="handleQRError"
              />
            </div>

            <v-divider class="my-6" />

            <!-- Manual Entry Section -->
            <div>
              <h2 class="text-h6 mb-3">
                {{ t('keys.manualEntry', 'Manual Entry') }}
              </h2>
              <KeyForm
                mode="add"
                :loading="isSubmitting"
                :show-cancel="false"
                @submit="handleSubmit"
              />
            </div>
          </v-card-text>
        </v-card>

        <!-- Mode Info Card -->
        <v-card
          v-if="isTemporaryMode"
          variant="tonal"
          color="warning"
          class="mt-4"
        >
          <v-card-text class="d-flex align-start">
            <v-icon class="mr-3 mt-1">mdi-alert</v-icon>
            <div>
              <div class="font-weight-medium mb-1">
                {{ t('auth.temporaryMode', 'Temporary Mode') }}
              </div>
              <div class="text-body-2">
                {{ t('keys.tempModeWarning', 'Keys are stored in your browser only. They will be lost if you clear browser data.') }}
              </div>
              <v-btn
                variant="text"
                color="warning"
                size="small"
                class="mt-2 px-0"
                @click="handleGoToLogin"
              >
                {{ t('auth.createAccount', 'Create an account to sync keys') }}
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { useKeysStore } from '../stores/keys';
import { useLocalStorage } from '../composables/useLocalStorage';
import KeyForm from '../components/KeyForm.vue';
import QRScanner from '../components/QRScanner.vue';

/**
 * AddKey.vue 页面
 * 
 * 添加新的 TOTP 密钥，支持 QR 扫描和手动输入
 * 区分登录和临时模式
 * 
 * 需求: 6.1, 6.2, 6.3, 6.4, 6.7, 6.8, 7.2
 */

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const keysStore = useKeysStore();
const localStorage = useLocalStorage();

// Component state
const isSubmitting = ref(false);
const showError = ref(false);
const errorMessage = ref('');
const showSuccess = ref(false);
const successMessage = ref('');

/**
 * Check if in temporary mode (not authenticated)
 * 需求: 7.2
 */
const isTemporaryMode = computed(() => !authStore.isAuthenticated);

/**
 * Handle QR code scan
 * 需求: 6.3, 6.4
 */
const handleQRScan = (data: { secret: string; remark?: string }) => {
  // Show success message
  successMessage.value = t('success.qrScanned', 'QR code scanned successfully!');
  showSuccess.value = true;

  // Auto-submit if we have both secret and remark
  if (data.remark) {
    handleSubmit({
      secret: data.secret,
      remark: data.remark,
    });
  }
  // Otherwise, the KeyForm will be pre-filled via QRScanner component
};

/**
 * Handle QR scan error
 */
const handleQRError = (error: Error) => {
  errorMessage.value = error.message || t('errors.qrExtractionFailed', 'Failed to extract data from QR code');
  showError.value = true;
};

/**
 * Handle form submission
 * 需求: 6.7, 6.8, 7.2
 */
const handleSubmit = async (data: { remark: string; secret: string }) => {
  isSubmitting.value = true;

  try {
    if (isTemporaryMode.value) {
      // Add to local storage
      // 需求: 7.2
      localStorage.addKey({
        remark: data.remark,
        secret: data.secret,
      });

      successMessage.value = t('success.keyAdded', 'Key added successfully');
      showSuccess.value = true;

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      // Add to server
      // 需求: 6.7, 6.8
      await keysStore.addKey({
        remark: data.remark,
        secret: data.secret,
      });

      successMessage.value = t('success.keyAdded', 'Key added successfully');
      showSuccess.value = true;

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  } catch (error: any) {
    errorMessage.value = error.message || t('errors.addKeyFailed', 'Failed to add key');
    showError.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Handle back button
 */
const handleBack = () => {
  router.back();
};

/**
 * Handle go to login
 */
const handleGoToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.add-key-container {
  padding-top: 24px;
  padding-bottom: 24px;
}

.add-key-card {
  border-radius: 12px;
}
</style>
