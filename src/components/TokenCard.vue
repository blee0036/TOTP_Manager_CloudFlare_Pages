<template>
  <v-card
    class="token-card"
    elevation="0"
    color="surface"
  >
    <v-card-text class="pa-5">
      <!-- Header: Remark and Settings -->
      <div class="d-flex justify-space-between align-center mb-4">
        <span class="text-subtitle-1 font-weight-medium" style="color: rgb(var(--v-theme-on-surface));">
          {{ remark }}
        </span>
        <v-btn
          icon
          size="small"
          variant="text"
          color="on-surface-variant"
          @click="handleManage"
        >
          <v-icon size="20">mdi-dots-vertical</v-icon>
        </v-btn>
      </div>

      <!-- TOTP Token Display -->
      <div class="token-display mb-3">
        <div v-if="loading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary" size="32" />
        </div>
        <div v-else-if="error" class="error-message py-4">
          <v-icon color="error" size="20">mdi-alert-circle</v-icon>
          <span class="ml-2 text-caption">{{ error }}</span>
        </div>
        <div v-else class="token-value-wrapper">
          <div class="token-digits-large">
            {{ formattedToken }}
          </div>
          <v-btn
            icon
            size="small"
            variant="text"
            color="primary"
            class="copy-btn"
            @click="handleCopy"
            :disabled="!token"
          >
            <v-icon size="20">{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Progress Bar and Time -->
      <div class="progress-section">
        <v-progress-linear
          :model-value="progress"
          :color="progressColor"
          height="4"
          rounded
          bg-color="surface-variant"
        />
        <div class="text-caption text-center mt-2" style="color: rgb(var(--v-theme-on-surface-variant));">
          {{ timeRemainingText }}
        </div>
      </div>
    </v-card-text>
  </v-card>
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

// 计算属性
const formattedToken = computed(() => {
  if (!token.value) return '• • • • • •';
  // 格式化为 3-3 格式，例如 123 456
  return token.value.slice(0, 3) + ' ' + token.value.slice(3);
});

const progress = computed(() => totpProgress.value);

const progressColor = computed(() => {
  if (timeRemaining.value <= 5) return 'error';
  if (timeRemaining.value <= 10) return 'warning';
  return 'primary';
});

const timeRemainingText = computed(() => {
  if (timeRemaining.value === 0) {
    return t('token.expired', 'Generating new token...');
  }
  return `${timeRemaining.value}s`;
});

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
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.2s ease;
}

.token-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.token-display {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.token-value-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

.token-digits-large {
  font-size: 2.25rem;
  font-weight: 400;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  letter-spacing: 0.15em;
  color: rgb(var(--v-theme-on-surface));
  flex: 1;
  text-align: center;
}

.copy-btn {
  flex-shrink: 0;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-error));
}

.progress-section {
  margin-top: 4px;
}
</style>
