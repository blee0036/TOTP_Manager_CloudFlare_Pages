<template>
  <div
    class="token-card"
    :class="{ 'token-card--warning': isTimeWarning }"
  >
    <!-- Header: Remark and Settings -->
    <div class="token-header">
      <span class="service-name">{{ remark }}</span>
      <v-btn
        icon
        size="small"
        variant="text"
        color="on-surface-variant"
        class="menu-btn"
        @click="handleManage"
      >
        <v-icon size="20">mdi-dots-vertical</v-icon>
      </v-btn>
    </div>

    <!-- TOTP Token Display -->
    <div class="token-display">
      <div v-if="loading" class="token-loading">
        <v-progress-circular indeterminate color="primary" size="32" />
      </div>
      <div v-else-if="error" class="token-error">
        <v-icon color="error" size="20">mdi-alert-circle</v-icon>
        <span class="error-text">{{ error }}</span>
      </div>
      <div v-else class="token-code">
        <span class="code-digits">{{ formattedToken }}</span>
        <button
          class="copy-btn"
          :class="{ 'copy-btn--copied': copied }"
          @click="handleCopy"
          :disabled="!token"
          :aria-label="copied ? 'Copied' : 'Copy token'"
        >
          <v-icon size="20">{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
          <span class="copy-feedback" v-if="copied">{{ $t('token.copied', 'Copied!') }}</span>
        </button>
      </div>
    </div>

    <!-- Circular Progress Ring -->
    <div class="progress-ring-container">
      <svg class="progress-ring" viewBox="0 0 36 36">
        <circle
          class="progress-ring__bg"
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke-width="2"
        />
        <circle
          class="progress-ring__bar"
          :class="{ 'progress-ring__bar--warning': isTimeWarning }"
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
        />
      </svg>
      <span class="time-remaining" :class="{ 'time-remaining--warning': isTimeWarning }">
        {{ timeRemaining }}s
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useTOTP } from '../composables/useTOTP';
import { useI18n } from 'vue-i18n';

/**
 * TokenCard 组件属性
 */
export interface TokenCardProps {
  /** 密钥 ID */
  id: string | number;
  /** 备注 */
  remark: string;
  /** Base32 密钥 */
  secret: string;
}

/**
 * TokenCard 组件事件
 */
export interface TokenCardEmits {
  /** 复制令牌事件 */
  (e: 'copy', token: string): void;
  /** 管理密钥事件 */
  (e: 'manage', id: string | number): void;
}

const props = defineProps<TokenCardProps>();
const emit = defineEmits<TokenCardEmits>();

const { t } = useI18n();
const { getCurrentToken, timeRemaining, progress: totpProgress } = useTOTP();

// 组件状态
const token = ref<string>('');
const loading = ref<boolean>(false);
const error = ref<string>('');
const copied = ref<boolean>(false);

// 环形进度条常量
const circumference = 2 * Math.PI * 16; // r=16

// 计算属性
const formattedToken = computed(() => {
  if (!token.value) return '• • • • • •';
  // 格式化为 3-3 格式，例如 123 456
  return token.value.slice(0, 3) + ' ' + token.value.slice(3);
});

const progressOffset = computed(() => {
  // 计算进度偏移量 (从满到空)
  const progress = totpProgress.value / 100;
  return circumference * (1 - progress);
});

const isTimeWarning = computed(() => timeRemaining.value <= 5);

/**
 * 生成 TOTP 令牌
 */
const generateToken = async () => {
  try {
    loading.value = true;
    error.value = '';
    token.value = await getCurrentToken(props.secret);
  } catch (err) {
    console.error('Failed to generate token:', err);
    error.value = t('errors.invalidSecret', 'Invalid secret');
    token.value = '';
  } finally {
    loading.value = false;
  }
};

/**
 * 处理复制令牌
 */
const handleCopy = async () => {
  if (!token.value) return;

  try {
    await navigator.clipboard.writeText(token.value);
    copied.value = true;
    emit('copy', token.value);

    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy token:', err);
  }
};

/**
 * 处理管理按钮点击
 */
const handleManage = () => {
  emit('manage', props.id);
};

/**
 * 监听时间剩余，当新周期开始时重新生成令牌
 */
watch(timeRemaining, (remaining, oldRemaining) => {
  if (oldRemaining === 0 && remaining === 30) {
    generateToken();
  }
  if (oldRemaining !== undefined && oldRemaining < 30 && remaining === 30) {
    generateToken();
  }
});

// 组件挂载时生成初始令牌
onMounted(() => {
  generateToken();
});
</script>

<style scoped>
.token-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all var(--duration-normal, 300ms) var(--ease-out, ease-out);
  position: relative;
  overflow: hidden;
}

.token-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.2);
}

.token-card--warning {
  animation: pulse-card 1s ease-in-out infinite;
}

@keyframes pulse-card {
  0%, 100% {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 4px 20px -1px rgba(239, 68, 68, 0.3);
  }
}

/* Header */
.token-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.service-name {
  font-size: 16px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.menu-btn {
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity var(--duration-fast, 200ms) ease;
}

.token-card:hover .menu-btn {
  opacity: 1;
}

/* Token Display */
.token-display {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.token-loading,
.token-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.token-error {
  color: rgb(var(--v-theme-error));
}

.error-text {
  font-size: 12px;
}

.token-code {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.code-digits {
  font-size: 32px;
  font-weight: 500;
  font-family: var(--font-mono, 'JetBrains Mono', 'Fira Code', monospace);
  letter-spacing: 0.1em;
  color: rgb(var(--v-theme-on-surface));
  flex: 1;
  text-align: center;
  user-select: all;
}

/* Copy Button */
.copy-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--duration-fast, 200ms) var(--ease-out, ease-out);
}

.copy-btn:hover:not(:disabled) {
  background: rgba(var(--v-theme-primary), 0.2);
  transform: scale(1.05);
}

.copy-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.copy-btn--copied {
  background: rgba(var(--v-theme-success), 0.15);
  color: rgb(var(--v-theme-success));
}

.copy-feedback {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgb(var(--v-theme-success));
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  animation: fadeInUp var(--duration-fast, 200ms) var(--ease-out, ease-out);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.copy-feedback::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgb(var(--v-theme-success));
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Progress Ring */
.progress-ring-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.progress-ring {
  width: 36px;
  height: 36px;
  transform: rotate(-90deg);
}

.progress-ring__bg {
  stroke: rgba(var(--v-theme-on-surface), 0.1);
}

.progress-ring__bar {
  stroke: rgb(var(--v-theme-primary));
  transition: stroke-dashoffset var(--duration-normal, 300ms) linear,
              stroke var(--duration-fast, 200ms) ease;
}

.progress-ring__bar--warning {
  stroke: rgb(var(--v-theme-error));
  animation: pulse-ring 0.5s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.time-remaining {
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: rgb(var(--v-theme-on-surface-variant));
  min-width: 28px;
  text-align: center;
  transition: color var(--duration-fast, 200ms) ease;
}

.time-remaining--warning {
  color: rgb(var(--v-theme-error));
  font-weight: 600;
}

/* Dark theme adjustments */
.v-theme--dark .token-card {
  background: rgb(var(--v-theme-surface));
  border-color: rgba(var(--v-theme-primary), 0.15);
}

.v-theme--dark .token-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  box-shadow: 0 10px 25px -3px rgba(139, 92, 246, 0.25);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .token-card,
  .copy-btn,
  .progress-ring__bar,
  .time-remaining {
    transition: none;
  }
  
  .token-card--warning,
  .progress-ring__bar--warning {
    animation: none;
  }
  
  .copy-feedback {
    animation: none;
  }
}
</style>
