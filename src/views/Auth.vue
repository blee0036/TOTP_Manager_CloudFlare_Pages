<template>
  <v-container class="auth-container fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card elevation="4" class="auth-card">
          <!-- App Title -->
          <v-card-title class="text-center py-6">
            <div class="text-h4 font-weight-bold primary--text">
              {{ t('app.title', 'TOTP Manager') }}
            </div>
            <div class="text-subtitle-2 text-medium-emphasis mt-2">
              {{ t('app.description', 'Secure Time-based One-Time Password Manager') }}
            </div>
          </v-card-title>

          <v-card-text>
            <!-- Tabs for Login/Register -->
            <v-tabs
              v-model="activeTab"
              grow
              color="primary"
              class="mb-6"
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
                  <div class="mb-10">
                    <v-text-field
                      v-model="loginForm.username"
                      :label="t('auth.username', 'Username')"
                      :rules="usernameRules"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account"
                      hide-details
                      required
                    />
                  </div>

                  <div class="mb-10">
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
                      @click:append-inner="showLoginPassword = !showLoginPassword"
                    />
                  </div>

                  <v-btn
                    type="submit"
                    color="primary"
                    variant="elevated"
                    size="large"
                    block
                    elevation="2"
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
                  <div class="mb-10">
                    <v-text-field
                      v-model="registerForm.username"
                      :label="t('auth.username', 'Username')"
                      :rules="usernameRules"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account"
                      hide-details
                      required
                    />
                  </div>

                  <div class="mb-10">
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
                      @click:append-inner="showRegisterPassword = !showRegisterPassword"
                    />
                  </div>

                  <div class="mb-10">
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
                      @click:append-inner="showConfirmPassword = !showConfirmPassword"
                    />
                  </div>

                  <v-btn
                    type="submit"
                    color="primary"
                    variant="elevated"
                    size="large"
                    block
                    elevation="2"
                    :loading="authStore.isLoading"
                    :disabled="!registerValid || authStore.isLoading"
                  >
                    {{ t('auth.registerButton', 'Sign Up') }}
                  </v-btn>
                </v-form>
              </v-window-item>
            </v-window>

            <!-- Divider -->
            <v-divider class="my-6" />

            <!-- Temporary Mode Section -->
            <v-card
              variant="tonal"
              color="info"
              class="temporary-mode-card"
            >
              <v-card-title class="text-subtitle-1 d-flex align-center">
                <v-icon class="mr-2">mdi-information</v-icon>
                {{ t('auth.temporaryMode', 'Temporary Mode') }}
              </v-card-title>
              <v-card-text class="text-body-2">
                {{ t('auth.temporaryModeDesc', 'Keys stored in browser only') }}
              </v-card-text>
              <v-card-actions>
                <v-btn
                  variant="text"
                  color="info"
                  @click="handleTemporaryMode"
                >
                  {{ t('common.continue', 'Continue') }}
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
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
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
}

.auth-card {
  border-radius: 12px;
}

.temporary-mode-card {
  border-radius: 8px;
}

.primary--text {
  color: rgb(var(--v-theme-primary));
}

/* 强制移除输入框底部的任何边框和间距 */
:deep(.v-input__details) {
  display: none !important;
  min-height: 0 !important;
  padding: 0 !important;
}

:deep(.v-text-field .v-field) {
  margin-bottom: 0 !important;
}
</style>
