<template>
  <div class="auth-page">
    <!-- Background Decorations -->
    <div class="auth-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <v-container class="auth-container fill-height" fluid>
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="10" md="6" lg="4" xl="3">
          <!-- Auth Card with Glassmorphism -->
          <v-card elevation="0" class="auth-card pa-6 pa-sm-8">
            <!-- Logo and Title -->
            <div class="text-center mb-6">
              <div class="auth-logo-wrapper mb-4">
                <v-icon size="56" class="auth-logo-icon">mdi-shield-key</v-icon>
                <div class="logo-glow"></div>
              </div>
              <h1 class="text-h5 font-weight-bold auth-title">
                {{ t('app.title', 'TOTP Manager') }}
              </h1>
              <p class="text-body-2 text-medium-emphasis mt-2">
                {{ t('app.description', 'Secure Time-based One-Time Password Manager') }}
              </p>
            </div>
          <!-- Tabs for Login/Register -->
          <v-tabs
            v-model="activeTab"
            grow
            color="primary"
            class="mb-6 auth-tabs"
          >
            <v-tab value="login">
              {{ t('auth.login', 'Login') }}
            </v-tab>
            <v-tab value="register">
              {{ t('auth.register', 'Register') }}
            </v-tab>
          </v-tabs>

          <!-- Tab Content -->
          <v-window v-model="activeTab">
            <!-- Login Tab -->
            <v-window-item value="login">
              <v-form ref="loginFormRef" v-model="loginValid" @submit.prevent="handleLogin">
                <v-text-field
                  v-model="loginForm.username"
                  :label="t('auth.username', 'Username')"
                  :rules="usernameRules"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account"
                  hide-details
                  required
                  class="mb-6 auth-input"
                />

                <v-text-field
                  v-model="loginForm.password"
                  :label="t('auth.password', 'Password')"
                  :rules="passwordRules"
                  :type="showLoginPassword ? 'text' : 'password'"
                  :append-inner-icon="showLoginPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock"
                  hide-details
                  required
                  class="mb-8 auth-input"
                  @click:append-inner="showLoginPassword = !showLoginPassword"
                />

                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  class="auth-submit-btn"
                  :loading="authStore.isLoading"
                  :disabled="!loginValid || authStore.isLoading"
                >
                  {{ t('auth.loginButton', 'Sign In') }}
                </v-btn>
              </v-form>
            </v-window-item>

            <!-- Register Tab -->
            <v-window-item value="register">
              <v-form ref="registerFormRef" v-model="registerValid" @submit.prevent="handleRegister">
                <v-text-field
                  v-model="registerForm.username"
                  :label="t('auth.username', 'Username')"
                  :rules="usernameRules"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account"
                  hide-details
                  required
                  class="mb-6 auth-input"
                />

                <v-text-field
                  v-model="registerForm.password"
                  :label="t('auth.password', 'Password')"
                  :rules="passwordRules"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  :append-inner-icon="showRegisterPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock"
                  hide-details
                  required
                  class="mb-6 auth-input"
                  @click:append-inner="showRegisterPassword = !showRegisterPassword"
                />

                <v-text-field
                  v-model="registerForm.confirmPassword"
                  :label="t('auth.confirmPassword', 'Confirm Password')"
                  :rules="confirmPasswordRules"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock"
                  hide-details
                  required
                  class="mb-8 auth-input"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                />

                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  class="auth-submit-btn"
                  :loading="authStore.isLoading"
                  :disabled="!registerValid || authStore.isLoading"
                >
                  {{ t('auth.registerButton', 'Sign Up') }}
                </v-btn>
              </v-form>
            </v-window-item>
          </v-window>

          <!-- Divider -->
          <div class="d-flex align-center my-6">
            <v-divider />
            <span class="px-4 text-body-2 text-medium-emphasis">{{ t('common.or', 'or') }}</span>
            <v-divider />
          </div>

          <!-- Temporary Mode Button -->
          <v-btn
            variant="tonal"
            color="primary"
            size="large"
            block
            class="temp-mode-btn"
            @click="handleTemporaryMode"
          >
            <v-icon start>mdi-incognito</v-icon>
            {{ t('auth.temporaryMode', 'Temporary Mode') }}
          </v-btn>
          <p class="text-caption text-medium-emphasis text-center mt-3">
            {{ t('auth.temporaryModeDesc', 'Keys stored in browser only') }}
          </p>
        </v-card>
      </v-col>
    </v-row>

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
  </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';

/**
 * Auth.vue 页面
 * 
 * 实现用户登录和注册功能，支持临时模式
 * 
 * 需求: 5.6, 7.4
 */

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();

// Tab state
const activeTab = ref<'login' | 'register'>('login');

// Form refs
const loginFormRef = ref<any>(null);
const registerFormRef = ref<any>(null);

// Form validity
const loginValid = ref(false);
const registerValid = ref(false);

// Password visibility
const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const showConfirmPassword = ref(false);

// Login form data
const loginForm = reactive({
  username: '',
  password: '',
});

// Register form data
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});

// Notification state
const showError = ref(false);
const errorMessage = ref('');
const showSuccess = ref(false);
const successMessage = ref('');

// Validation rules
const usernameRules = [
  (v: string) => !!v || t('errors.usernameRequired', 'Username is required'),
  (v: string) => (v && v.length >= 3) || t('auth.usernameMinLength', 'Username must be at least 3 characters'),
];

const passwordRules = [
  (v: string) => !!v || t('errors.passwordRequired', 'Password is required'),
  (v: string) => (v && v.length >= 6) || t('auth.passwordMinLength', 'Password must be at least 6 characters'),
];

const confirmPasswordRules = [
  (v: string) => !!v || t('errors.confirmPasswordRequired', 'Please confirm your password'),
  (v: string) => v === registerForm.password || t('auth.passwordMismatch', 'Passwords do not match'),
];

/**
 * Handle login form submission
 * 需求: 5.2, 5.3
 */
const handleLogin = async () => {
  // Validate form
  const { valid } = await loginFormRef.value?.validate();
  if (!valid) return;

  try {
    await authStore.login(loginForm.username, loginForm.password);
    
    // Show success message
    successMessage.value = t('success.loginSuccess', 'Login successful');
    showSuccess.value = true;

    // Redirect to home page
    setTimeout(() => {
      router.push('/');
    }, 500);
  } catch (error: any) {
    errorMessage.value = error.message || t('errors.invalidCredentials', 'Invalid username or password');
    showError.value = true;
  }
};

/**
 * Handle register form submission
 * 需求: 5.1, 5.6
 */
const handleRegister = async () => {
  // Validate form
  const { valid } = await registerFormRef.value?.validate();
  if (!valid) return;

  try {
    await authStore.register(registerForm.username, registerForm.password);
    
    // Show success message
    successMessage.value = t('success.registerSuccess', 'Registration successful');
    showSuccess.value = true;

    // Clear register form
    registerForm.username = '';
    registerForm.password = '';
    registerForm.confirmPassword = '';
    registerFormRef.value?.resetValidation();

    // Switch to login tab
    setTimeout(() => {
      activeTab.value = 'login';
    }, 1000);
  } catch (error: any) {
    errorMessage.value = error.message || t('errors.registrationFailed', 'Registration failed');
    showError.value = true;
  }
};

/**
 * Handle temporary mode
 * 需求: 7.4
 */
const handleTemporaryMode = () => {
  // Redirect to home page without authentication
  router.push('/');
};
</script>

<style scoped>
/* ========== 页面容器 ========== */
.auth-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== 背景装饰 ========== */
.auth-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: rgba(139, 92, 246, 0.25);
  top: -100px;
  right: -50px;
}

.orb-2 {
  width: 350px;
  height: 350px;
  background: rgba(124, 58, 237, 0.2);
  bottom: -80px;
  left: -80px;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: rgba(167, 139, 250, 0.15);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* ========== 主容器 - 居中 ========== */
.auth-container {
  position: relative;
  z-index: 1;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 100vh;
  padding: 24px 16px;
}

.auth-container :deep(.v-row) {
  width: 100%;
  margin: 0 !important;
  justify-content: center !important;
}

.auth-container :deep(.v-col) {
  display: flex;
  justify-content: center;
}

/* ========== 登录卡片 ========== */
.auth-card {
  width: 100%;
  max-width: 420px;
  border-radius: 20px !important;
  background: rgba(24, 24, 27, 0.95) !important;
  border: 1px solid rgba(139, 92, 246, 0.2) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4) !important;
}

/* ========== Logo ========== */
.auth-logo-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.auth-logo-icon {
  color: #A78BFA;
}

.logo-glow {
  position: absolute;
  width: 70px;
  height: 70px;
  background: rgba(139, 92, 246, 0.4);
  border-radius: 50%;
  filter: blur(20px);
}

.auth-title {
  color: #E4E4E7 !important;
  -webkit-text-fill-color: #E4E4E7 !important;
}

/* ========== 标签页 ========== */
.auth-tabs {
  background: rgba(39, 39, 42, 0.5);
  border-radius: 10px;
  padding: 4px;
}

:deep(.auth-tabs .v-tab) {
  font-weight: 500;
  text-transform: none;
  min-height: 40px;
  border-radius: 8px;
  color: #A1A1AA !important;
}

:deep(.auth-tabs .v-tab--selected) {
  background: rgba(139, 92, 246, 0.2) !important;
  color: #A78BFA !important;
}

:deep(.v-tabs-slider-wrapper) {
  display: none;
}

/* ========== 输入框 ========== */
.auth-input {
  margin-bottom: 20px !important;
}

.auth-input:last-of-type {
  margin-bottom: 24px !important;
}

:deep(.v-field) {
  border-radius: 10px !important;
  background: rgba(39, 39, 42, 0.6) !important;
}

:deep(.v-field__outline) {
  color: rgba(161, 161, 170, 0.3) !important;
}

:deep(.v-field--focused .v-field__outline) {
  color: #8B5CF6 !important;
}

/* 移除输入框底部多余元素和白线 */
:deep(.v-input__details) {
  display: none !important;
}

:deep(.v-field__outline__notch::before),
:deep(.v-field__outline__notch::after) {
  border: none !important;
}

/* ========== 提交按钮 ========== */
.auth-submit-btn {
  border-radius: 10px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  min-height: 46px !important;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED) !important;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4) !important;
}

.auth-submit-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5) !important;
}

.auth-submit-btn:disabled {
  opacity: 0.5 !important;
  box-shadow: none !important;
}

/* ========== 临时模式按钮 ========== */
.temp-mode-btn {
  border-radius: 10px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  min-height: 46px !important;
  background: rgba(139, 92, 246, 0.1) !important;
  color: #A78BFA !important;
  border: 1px solid rgba(139, 92, 246, 0.25) !important;
}

.temp-mode-btn:hover {
  background: rgba(139, 92, 246, 0.15) !important;
}

/* ========== 分隔线 ========== */
:deep(.v-divider) {
  border-color: rgba(161, 161, 170, 0.15) !important;
}
</style>
