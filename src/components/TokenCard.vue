<template>
  <v-card
    class="token-card"
    :elevation="hover ? 4 : 2"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">{{ remark }}</span>
      <v-btn
        v-if="onManage"
        icon="mdi-cog"
        size="small"
        variant="text"
        @click="handleManage"
      />
    </v-card-title>

    <v-card-text>
      <!-- TOTP Token Display -->
      <div class="token-display">
        <div v-if="loading" class="text-center">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else-if="error" class="error-message">
          <v-icon color="error">mdi-alert-circle</v-icon>
          <span class="ml-2">{{ error }}</span>
        </div>
        <div v-else class="token-value">
          <span class="token-digits">{{ formattedToken }}</span>
          <v-btn
            icon="mdi-content-copy"
            size="small"
            variant="text"
            color="primary"
            @click="handleCopy"
            :disabled="!token"
          >
            <v-icon>{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Progress Bar and Time Remaining -->
      <div class="mt-4">
        <v-progress-linear
          :model-value="progress"
          :color="progressColor"
          height="6"
          rounded
        />
        <div class="text-caption text-center mt-1">
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
const hover = ref<boolean>(false);

// 计算属性
const formattedToken = computed(() => {
  if (!token.value) return '------';
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
  return t('token.timeRemaining', { seconds: timeRemaining.value }, `${timeRemaining.value}s remaining`);
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
    error.value = t('errors.invalidSecret', 'Invalid secret key format');
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

    // 2 秒后重置复制状态
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
  // 当从 0 变为 30 时，表示新周期开始
  if (oldRemaining === 0 && remaining === 30) {
    generateToken();
  }
  // 或者当剩余时间从小于 30 变为 30 时
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
  transition: all 0.3s ease;
}

.token-display {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.token-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.token-digits {
  font-size: 2rem;
  font-weight: 500;
  font-family: 'Roboto Mono', monospace;
  letter-spacing: 0.1em;
  color: rgb(var(--v-theme-primary));
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-error));
}
</style>
