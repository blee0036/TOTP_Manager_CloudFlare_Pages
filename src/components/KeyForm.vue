<template>
  <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit" class="key-form">
    <!-- Remark Field -->
    <v-text-field
      v-model="formData.remark"
      :label="t('keys.remark', 'Remark') + ' *'"
      :placeholder="t('keys.remarkPlaceholder', 'e.g., Google, GitHub')"
      :rules="remarkRules"
      :error-messages="remarkError"
      :error="!!remarkError"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="mdi-tag-outline"
      hide-details
      required
      class="form-input mb-6"
      @update:model-value="clearRemarkError"
    />

    <!-- Secret Field -->
    <v-textarea
      v-model="formData.secret"
      :label="t('keys.secret', 'Secret Key') + ' *'"
      :placeholder="t('keys.secretPlaceholder', 'Enter Base32 key or paste URI')"
      :rules="secretRules"
      :error-messages="secretError"
      :error="!!secretError"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="mdi-key-outline"
      rows="3"
      hide-details
      required
      class="form-input mb-5"
      @update:model-value="handleSecretInput"
      @blur="handleSecretBlur"
    />

    <!-- Secret Format Hint -->
    <v-alert
      v-if="secretFormatHint"
      type="info"
      variant="tonal"
      density="compact"
      class="mb-4 form-alert"
    >
      <template #prepend>
        <v-icon size="18">mdi-information-outline</v-icon>
      </template>
      {{ secretFormatHint }}
    </v-alert>

    <!-- Validation Error -->
    <v-alert
      v-if="validationError"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="mb-4 form-alert form-alert-error"
      @click:close="validationError = ''"
    >
      <template #prepend>
        <v-icon size="18">mdi-alert-circle-outline</v-icon>
      </template>
      {{ validationError }}
    </v-alert>

    <!-- Action Buttons -->
    <div class="d-flex justify-end gap-3 mt-6">
      <v-btn
        v-if="mode === 'add' || showCancel"
        variant="text"
        class="form-btn-cancel"
        @click="handleCancel"
      >
        {{ t('common.cancel', 'Cancel') }}
      </v-btn>
      <v-btn
        type="submit"
        color="primary"
        variant="flat"
        class="form-btn-submit"
        :loading="loading"
        :disabled="!isValid || loading"
      >
        <v-icon start size="18">{{ mode === 'add' ? 'mdi-plus' : 'mdi-check' }}</v-icon>
        {{ mode === 'add' ? t('keys.addKey', 'Add Key') : t('keys.updateKey', 'Update') }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useKeyValidation } from '../composables/useKeyValidation';

/**
 * KeyForm 组件属性
 */
export interface KeyFormProps {
  /** 表单模式 */
  mode: 'add' | 'edit';
  /** 初始数据 */
  initialData?: {
    remark: string;
    secret: string;
  };
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 是否正在加载 */
  loading?: boolean;
}

/**
 * KeyForm 组件事件
 */
export interface KeyFormEmits {
  /** 提交表单事件 */
  (e: 'submit', data: { remark: string; secret: string }): void;
  /** 取消事件 */
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<KeyFormProps>(), {
  initialData: undefined,
  showCancel: true,
  loading: false,
});

const emit = defineEmits<KeyFormEmits>();

const { t } = useI18n();
const { validateSecret, isOtpAuthUri, extractKeyData } = useKeyValidation();

// 表单引用
const formRef = ref<any>(null);
const isValid = ref<boolean>(false);

// 表单数据
const formData = reactive({
  remark: '',
  secret: '',
});

// 错误状态
const remarkError = ref<string>('');
const secretError = ref<string>('');
const validationError = ref<string>('');
const secretFormatHint = ref<string>('');

// 验证规则
const remarkRules = [
  (v: string) => !!v || t('errors.remarkRequired', 'Remark is required'),
  (v: string) => (v && v.trim().length > 0) || t('errors.remarkEmpty', 'Remark cannot be empty'),
];

const secretRules = [
  (v: string) => !!v || t('errors.secretRequired', 'Secret key is required'),
  (v: string) => {
    if (!v) return true;
    const result = validateSecret(v);
    return result.isValid || result.error || t('errors.invalidSecret', 'Invalid secret key format');
  },
];

/**
 * 处理密钥输入
 */
const handleSecretInput = (value: string) => {
  secretError.value = '';
  validationError.value = '';
  secretFormatHint.value = '';

  if (!value) return;

  // 检查是否为 OTPAuth URI
  if (isOtpAuthUri(value)) {
    secretFormatHint.value = t('keys.otpauthDetected', 'OTPAuth URI detected. Secret and remark will be extracted.');
    
    // 尝试提取数据
    const extracted = extractKeyData(value);
    if (extracted) {
      formData.secret = extracted.secret;
      if (extracted.remark && !formData.remark) {
        formData.remark = extracted.remark;
      }
      secretFormatHint.value = t('keys.otpauthExtracted', 'Secret extracted from OTPAuth URI');
    }
  }
};

/**
 * 处理密钥失焦（验证和规范化）
 */
const handleSecretBlur = () => {
  if (!formData.secret) return;

  const result = validateSecret(formData.secret);
  if (result.isValid) {
    // 规范化密钥
    formData.secret = result.normalizedSecret;
    secretError.value = '';
  } else {
    secretError.value = result.error || t('errors.invalidSecret', 'Invalid secret key format');
  }
};

/**
 * 清除备注错误
 */
const clearRemarkError = () => {
  remarkError.value = '';
};

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  // 验证表单
  const { valid } = await formRef.value?.validate();
  if (!valid) {
    validationError.value = t('errors.formValidationFailed', 'Please fix the errors above');
    return;
  }

  // 验证备注不为空
  if (!formData.remark.trim()) {
    remarkError.value = t('errors.remarkEmpty', 'Remark cannot be empty');
    validationError.value = t('errors.formValidationFailed', 'Please fix the errors above');
    return;
  }

  // 验证密钥格式
  const secretValidation = validateSecret(formData.secret);
  if (!secretValidation.isValid) {
    secretError.value = secretValidation.error || t('errors.invalidSecret', 'Invalid secret key format');
    validationError.value = t('errors.formValidationFailed', 'Please fix the errors above');
    return;
  }

  // 提交数据
  emit('submit', {
    remark: formData.remark.trim(),
    secret: secretValidation.normalizedSecret,
  });
};

/**
 * 处理取消
 */
const handleCancel = () => {
  emit('cancel');
};

/**
 * 重置表单
 */
const resetForm = () => {
  formData.remark = '';
  formData.secret = '';
  remarkError.value = '';
  secretError.value = '';
  validationError.value = '';
  secretFormatHint.value = '';
  formRef.value?.resetValidation();
};

/**
 * 初始化表单数据
 */
const initializeForm = () => {
  if (props.initialData) {
    formData.remark = props.initialData.remark;
    formData.secret = props.initialData.secret;
  }
};

// 监听初始数据变化
watch(() => props.initialData, () => {
  initializeForm();
}, { deep: true });

// 组件挂载时初始化
onMounted(() => {
  initializeForm();
});

// 暴露方法给父组件
defineExpose({
  resetForm,
});
</script>

<style scoped>
/**
 * KeyForm Component Styles
 * Modern black-purple theme with glassmorphism effects
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */

.key-form {
  width: 100%;
}

.gap-3 {
  gap: 12px;
}

/* Form Input Styling - Requirement 5.1, 5.2 */
.form-input :deep(.v-field) {
  border-radius: 12px !important;
  transition: all var(--duration-fast, 200ms) ease;
}

/* Floating label animation - Requirement 5.1 */
.form-input :deep(.v-field--focused .v-label),
.form-input :deep(.v-field--dirty .v-label) {
  transform: translateY(-50%) scale(0.75);
  color: rgb(var(--v-theme-primary));
}

/* Focus state with primary color border - Requirement 5.2 */
.form-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}

.form-input :deep(.v-field__outline__start),
.form-input :deep(.v-field__outline__end) {
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  transition: border-color var(--duration-fast, 200ms) ease;
}

.form-input :deep(.v-field--focused .v-field__outline__start),
.form-input :deep(.v-field--focused .v-field__outline__end) {
  border-color: rgb(var(--v-theme-primary));
  border-width: 2px;
}

/* Error state styling - Requirement 5.3 */
.form-input :deep(.v-field--error .v-field__outline__start),
.form-input :deep(.v-field--error .v-field__outline__end) {
  border-color: rgb(var(--v-theme-error)) !important;
  border-width: 2px;
}

.form-input :deep(.v-field--error) {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
}

.form-input :deep(.v-field--error .v-label) {
  color: rgb(var(--v-theme-error));
}

/* Dark theme adjustments */
.v-theme--dark .form-input :deep(.v-field__outline__start),
.v-theme--dark .form-input :deep(.v-field__outline__end) {
  border-color: rgba(255, 255, 255, 0.12);
}

/* Input icon styling */
.form-input :deep(.v-field__prepend-inner) {
  color: rgba(var(--v-theme-on-surface), 0.5);
  transition: color var(--duration-fast, 200ms) ease;
}

.form-input :deep(.v-field--focused .v-field__prepend-inner) {
  color: rgb(var(--v-theme-primary));
}

.form-input :deep(.v-field--error .v-field__prepend-inner) {
  color: rgb(var(--v-theme-error));
}

/* Hide input details and messages */
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

:deep(.v-textarea .v-field) {
  margin-bottom: 0 !important;
}

:deep(.v-input__control) {
  min-height: auto !important;
}

:deep(.v-field__underlay) {
  display: none !important;
}

:deep(.v-field__outline__notch) {
  display: none !important;
}

/* Alert Styling */
.form-alert {
  border-radius: 12px !important;
  font-size: 14px;
}

.form-alert :deep(.v-alert__prepend) {
  margin-right: 12px;
}

.form-alert-error {
  background: rgba(239, 68, 68, 0.1) !important;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.v-theme--dark .form-alert-error {
  background: rgba(248, 113, 113, 0.1) !important;
  border-color: rgba(248, 113, 113, 0.2);
}

/* Cancel Button - Secondary Style */
.form-btn-cancel {
  border-radius: 12px !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px !important;
  text-transform: none !important;
  min-height: 44px !important;
  padding: 0 20px !important;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  transition: all var(--duration-fast, 200ms) ease !important;
}

.form-btn-cancel:hover {
  background: rgba(var(--v-theme-on-surface), 0.08) !important;
  color: rgba(var(--v-theme-on-surface), 0.9) !important;
}

/* Submit Button - Primary Gradient Style - Requirement 5.5 */
.form-btn-submit {
  border-radius: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  text-transform: none !important;
  min-height: 44px !important;
  padding: 0 24px !important;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%) !important;
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35) !important;
  transition: all var(--duration-fast, 200ms) ease !important;
}

.form-btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%) !important;
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45) !important;
  transform: translateY(-1px);
}

.form-btn-submit:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3) !important;
}

.form-btn-submit:disabled {
  background: rgba(139, 92, 246, 0.4) !important;
  box-shadow: none !important;
  color: rgba(255, 255, 255, 0.6) !important;
}

/* Spacing utilities */
.mb-5 {
  margin-bottom: 20px !important;
}

.mb-6 {
  margin-bottom: 24px !important;
}

.mt-6 {
  margin-top: 24px !important;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .form-input :deep(.v-field),
  .form-btn-submit,
  .form-btn-cancel {
    transition: none !important;
  }
}
</style>
