<template>
  <div class="qr-scanner">
    <!-- Hidden File Input -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      style="display: none"
      @change="handleFileChange"
    />
    
    <!-- Upload Button -->
    <v-btn
      color="primary"
      variant="outlined"
      prepend-icon="mdi-qrcode-scan"
      block
      size="large"
      :loading="scanning"
      :disabled="scanning"
      @click="triggerFileInput"
    >
      {{ selectedFile ? selectedFile.name : t('keys.uploadQR', 'Upload QR Code') }}
    </v-btn>
    
    <!-- Clear Button (shown when file is selected) -->
    <v-btn
      v-if="selectedFile && !scanning"
      variant="text"
      size="small"
      color="error"
      class="mt-2"
      @click="handleClear"
    >
      {{ t('common.clear', 'Clear') }}
    </v-btn>

    <!-- Preview Image (Optional) -->
    <div v-if="previewUrl && showPreview" class="mt-4">
      <v-card variant="outlined">
        <v-card-text class="text-center">
          <img
            :src="previewUrl"
            alt="QR Code Preview"
            class="qr-preview"
          />
        </v-card-text>
      </v-card>
    </div>

    <!-- Scanning Status -->
    <v-alert
      v-if="scanning"
      type="info"
      variant="tonal"
      density="compact"
      class="mt-4"
    >
      <v-progress-circular
        indeterminate
        size="20"
        width="2"
        class="mr-2"
      />
      {{ t('qr.scanning', 'Scanning QR code...') }}
    </v-alert>

    <!-- Success Message -->
    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      density="compact"
      closable
      class="mt-4"
      @click:close="successMessage = ''"
    >
      {{ successMessage }}
    </v-alert>

    <!-- Error Message -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="mt-4"
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import jsQR from 'jsqr';
import { useKeyValidation } from '../composables/useKeyValidation';

/**
 * QRScanner 组件属性
 */
export interface QRScannerProps {
  /** 接受的文件类型 */
  accept?: string;
  /** 输入框标签 */
  label?: string;
  /** 输入框占位符 */
  placeholder?: string;
  /** 是否显示预览图片 */
  showPreview?: boolean;
  /** 是否自动扫描 */
  autoScan?: boolean;
}

/**
 * QRScanner 组件事件
 */
export interface QRScannerEmits {
  /** 扫描成功事件 */
  (e: 'scan', data: { secret: string; remark?: string }): void;
  /** 扫描错误事件 */
  (e: 'error', error: Error): void;
}

const props = withDefaults(defineProps<QRScannerProps>(), {
  accept: 'image/*',
  label: undefined,
  placeholder: undefined,
  showPreview: true,
  autoScan: true,
});

const emit = defineEmits<QRScannerEmits>();

const { t } = useI18n();
const { isOtpAuthUri, extractKeyData } = useKeyValidation();

// 组件状态
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>('');
const scanning = ref<boolean>(false);
const successMessage = ref<string>('');
const errorMessage = ref<string>('');

/**
 * 触发文件选择
 */
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

/**
 * 处理文件变化
 */
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0) {
    return;
  }
  
  const file = files[0];
  
  if (!file) {
    return;
  }
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    errorMessage.value = t('errors.invalidFileType', 'Please select an image file');
    selectedFile.value = null;
    return;
  }

  selectedFile.value = file;

  // 创建预览 URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrl.value = URL.createObjectURL(file);

  // 清除之前的消息
  successMessage.value = '';
  errorMessage.value = '';

  // 自动扫描
  if (props.autoScan) {
    scanQRCode();
  }
};

/**
 * 扫描二维码
 */
const scanQRCode = async () => {
  if (!selectedFile.value) {
    errorMessage.value = t('errors.noFileSelected', 'Please select a file first');
    return;
  }

  const file = selectedFile.value;
  
  scanning.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // 读取图片文件
    const imageData = await loadImage(file);
    
    // 使用 jsQR 解析二维码
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (!code || !code.data) {
      throw new Error(t('errors.qrNotFound', 'No QR code found in the image'));
    }

    // 解析二维码内容
    const qrContent = code.data;
    
    // 检查是否为 OTPAuth URI
    if (!isOtpAuthUri(qrContent)) {
      throw new Error(t('errors.invalidQRContent', 'QR code does not contain a valid OTPAuth URI'));
    }

    // 提取密钥和备注
    const extracted = extractKeyData(qrContent);
    if (!extracted) {
      throw new Error(t('errors.qrExtractionFailed', 'Failed to extract data from QR code'));
    }

    // 发送成功事件
    emit('scan', {
      secret: extracted.secret,
      remark: extracted.remark,
    });

    successMessage.value = t('success.qrScanned', 'QR code scanned successfully!');
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    errorMessage.value = err.message;
    emit('error', err);
  } finally {
    scanning.value = false;
  }
};

/**
 * 加载图片并转换为 ImageData
 */
const loadImage = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // 创建 canvas 并绘制图片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // 获取图片数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      };

      img.onerror = () => {
        reject(new Error(t('errors.imageLoadFailed', 'Failed to load image')));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error(t('errors.fileReadFailed', 'Failed to read file')));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * 处理清除
 */
const handleClear = () => {
  selectedFile.value = null;
  
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }

  successMessage.value = '';
  errorMessage.value = '';
};

/**
 * 清理资源
 */
const cleanup = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
};

// 组件卸载时清理
import { onUnmounted } from 'vue';
onUnmounted(() => {
  cleanup();
});

// 暴露方法给父组件
defineExpose({
  scanQRCode,
  handleClear,
});
</script>

<style scoped>
.qr-scanner {
  width: 100%;
}

.qr-preview {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
}
</style>
