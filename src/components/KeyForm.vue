<template>
  <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
    <!-- Remark Field -->
    <div class="mb-10">
      <v-text-field
        v-model="formData.remark"
        :label="t('keys.remark', 'Remark') + ' *'"
        :placeholder="t('keys.remarkPlaceholder', 'e.g., Google, GitHub')"
        :rules="remarkRules"
        :error-messages="remarkError"
        variant="outlined"
        density="comfortable"
        hide-details
        required
        @update:model-value="clearRemarkError"
      />
    </div>

    <!-- Secret Field -->
    <div class="mb-8">
      <v-textarea
        v-model="formData.secret"
        :label="t('keys.secret', 'Secret Key') + ' *'"
        :placeholder="t('keys.secretPlaceholder', 'Enter Base32 key or paste URI')"
        :rules="secretRules"
        :error-messages="secretError"
        variant="outlined"
        density="comfortable"
        rows="3"
        hide-details
        required
        @update:model-value="handleSecretInput"
        @blur="handleSecretBlur"
      />
    </div>

    <!-- Secret Format Hint -->
    <v-alert
      v-if="secretFormatHint"
      type="info"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ secretFormatHint }}
    </v-alert>

    <!-- Validation Error -->
    <v-alert
      v-if="validationError"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="mb-4"
      @click:close="validationError = ''"
    >
      {{ validationError }}
    </v-alert>

    <!-- Action Buttons -->
    <div class="d-flex justify-end gap-2">
      <v-btn
        v-if="mode === 'add' || showCancel"
        variant="text"
        @click="handleCancel"
      >
        {{ t('common.cancel', 'Cancel') }}
      </v-btn>
      <v-btn
        type="submit"
        color="primary"
        variant="elevated"
        :loading="loading"
        :disabled="!isValid || loading"
      >
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
.gap-2 {
  gap: 8px;
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

:deep(.v-textarea .v-field) {
  margin-bottom: 0 !important;
}
</style>
