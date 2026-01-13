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
/* Auth Page Container */
.auth-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* Background Gradient Decorations */
.auth-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%);
  top: -150px;
  right: -100px;
  animation: float-slow 20s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, rgba(124, 58, 237, 0) 70%);
  bottom: -100px;
  left: -100px;
  animation: float-slow 25s ease-in-out infinite reverse;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, rgba(167, 139, 250, 0) 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-glow 8s ease-in-out infinite;
}

@keyframes float-slow {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(30px, 20px);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.auth-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  background: transparent;
}

/* Glassmorphism Auth Card */
.auth-card {
  border-radius: 24px !important;
  background: rgba(var(--v-theme-surface), 0.85) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.15) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset !important;
}

.v-theme--dark .auth-card {
  background: rgba(24, 24, 27, 0.9) !important;
  border-color: rgba(139, 92, 246, 0.2) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset !important;
}

/* Logo Styling */
.auth-logo-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.auth-logo-icon {
  color: rgb(var(--v-theme-primary));
  position: relative;
  z-index: 1;
}

.logo-glow {
  position: absolute;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(15px);
  z-index: 0;
}

.auth-title {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #A78BFA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 彻底移除输入框底部的所有元素 */
:deep(.v-input__details) {
  display: none !important;
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.v-messages) {
  display: none !important;
  min-height: 0 !important;
}

:deep(.v-text-field .v-field) {
  margin-bottom: 0 !important;
}

:deep(.v-input__control) {
  min-height: auto !important;
}

:deep(.v-field__underlay) {
  display: none !important;
}

/* 隐藏导致横线的outline notch */
:deep(.v-field__outline__notch) {
  display: none !important;
}

/* Auth Tabs Styling */
.auth-tabs {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.auth-tabs .v-tab) {
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: none;
  min-height: 44px;
}

:deep(.auth-tabs .v-tab--selected) {
  background: rgba(139, 92, 246, 0.1);
}

/* Auth Input Styling */
.auth-input :deep(.v-field) {
  border-radius: 12px !important;
  transition: all 0.2s ease;
}

.auth-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}

.auth-input :deep(.v-field__outline__start),
.auth-input :deep(.v-field__outline__end) {
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  transition: border-color 0.2s ease;
}

.auth-input :deep(.v-field--focused .v-field__outline__start),
.auth-input :deep(.v-field--focused .v-field__outline__end) {
  border-color: rgb(var(--v-theme-primary));
}

.v-theme--dark .auth-input :deep(.v-field__outline__start),
.v-theme--dark .auth-input :deep(.v-field__outline__end) {
  border-color: rgba(255, 255, 255, 0.12);
}

/* Primary Submit Button with Gradient */
.auth-submit-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  text-transform: none !important;
  min-height: 48px !important;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%) !important;
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35) !important;
  transition: all 0.2s ease !important;
}

.auth-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%) !important;
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45) !important;
  transform: translateY(-1px);
}

.auth-submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3) !important;
}

.auth-submit-btn:disabled {
  background: rgba(139, 92, 246, 0.4) !important;
  box-shadow: none !important;
}

/* Temporary Mode Button - Secondary Style */
.temp-mode-btn {
  border-radius: 12px !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px !important;
  text-transform: none !important;
  min-height: 48px !important;
  background: rgba(139, 92, 246, 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
  border: 1px solid rgba(139, 92, 246, 0.2) !important;
  transition: all 0.2s ease !important;
}

.temp-mode-btn:hover {
  background: rgba(139, 92, 246, 0.15) !important;
  border-color: rgba(139, 92, 246, 0.3) !important;
}

.v-theme--dark .temp-mode-btn {
  background: rgba(139, 92, 246, 0.08) !important;
  border-color: rgba(139, 92, 246, 0.15) !important;
}

.v-theme--dark .temp-mode-btn:hover {
  background: rgba(139, 92, 246, 0.12) !important;
  border-color: rgba(139, 92, 246, 0.25) !important;
}

/* Divider Styling */
:deep(.v-divider) {
  opacity: 0.15;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .gradient-orb {
    animation: none !important;
  }
  
  .auth-submit-btn,
  .temp-mode-btn {
    transition: none !important;
  }
}
</style>
