<template>
  <v-text-field
    v-model="searchQuery"
    :label="label"
    :placeholder="placeholder"
    prepend-inner-icon="mdi-magnify"
    variant="outlined"
    density="comfortable"
    clearable
    hide-details
    @update:model-value="handleSearch"
    @click:clear="handleClear"
    class="search-bar"
  >
    <template v-if="showResultCount && resultCount !== null" #append-inner>
      <v-chip size="small" color="primary" variant="tonal">
        {{ resultCount }}
      </v-chip>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * SearchBar 组件属性
 */
export interface SearchBarProps {
  /** 初始搜索查询 */
  modelValue?: string;
  /** 输入框标签 */
  label?: string;
  /** 输入框占位符 */
  placeholder?: string;
  /** 是否显示结果计数 */
  showResultCount?: boolean;
  /** 结果计数 */
  resultCount?: number | null;
  /** 防抖延迟（毫秒） */
  debounce?: number;
}

/**
 * SearchBar 组件事件
 */
export interface SearchBarEmits {
  /** 搜索查询更新事件 */
  (e: 'update:modelValue', query: string): void;
  /** 搜索事件（防抖后触发） */
  (e: 'search', query: string): void;
  /** 清除搜索事件 */
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  modelValue: '',
  label: undefined,
  placeholder: undefined,
  showResultCount: false,
  resultCount: null,
  debounce: 300,
});

const emit = defineEmits<SearchBarEmits>();

const { t } = useI18n();

// 组件状态
const searchQuery = ref<string>(props.modelValue);
let debounceTimer: number | null = null;

// 默认标签和占位符
const label = props.label || t('keys.search', 'Search keys...');
const placeholder = props.placeholder || t('keys.search', 'Search keys...');

/**
 * 处理搜索输入（带防抖）
 */
const handleSearch = (value: string) => {
  // 立即更新 v-model
  emit('update:modelValue', value);

  // 清除之前的定时器
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }

  // 设置新的防抖定时器
  debounceTimer = window.setTimeout(() => {
    emit('search', value);
  }, props.debounce);
};

/**
 * 处理清除按钮点击
 */
const handleClear = () => {
  searchQuery.value = '';
  emit('update:modelValue', '');
  emit('clear');
  
  // 清除防抖定时器
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
};

/**
 * 监听 modelValue 变化（外部更新）
 */
watch(() => props.modelValue, (newValue) => {
  if (newValue !== searchQuery.value) {
    searchQuery.value = newValue;
  }
});
</script>

<style scoped>
.search-bar {
  max-width: 600px;
}
</style>
