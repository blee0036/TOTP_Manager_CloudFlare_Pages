import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Settings Store
 * 管理应用设置（语言、主题）
 * 
 * 需求: 14.3, 14.5
 */
export const useSettingsStore = defineStore('settings', () => {
  // State
  const locale = ref<string>('en');
  const theme = ref<'light' | 'dark' | 'auto'>('auto');

  /**
   * 设置语言
   * 需求: 14.3
   */
  function setLocale(newLocale: string): void {
    locale.value = newLocale;
    saveSettings();
  }

  /**
   * 设置主题
   * 需求: 14.5
   */
  function setTheme(newTheme: 'light' | 'dark' | 'auto'): void {
    theme.value = newTheme;
    saveSettings();
  }

  /**
   * 从 LocalStorage 加载设置
   * 需求: 14.5
   */
  function loadSettings(): void {
    try {
      // 加载语言设置
      const savedLocale = localStorage.getItem('totp_locale');
      if (savedLocale) {
        locale.value = savedLocale;
      } else {
        // 使用浏览器语言作为默认值
        const browserLocale = getBrowserLocale();
        locale.value = browserLocale;
      }

      // 加载主题设置
      const savedTheme = localStorage.getItem('totp_theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
        theme.value = savedTheme;
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }

  /**
   * 保存设置到 LocalStorage
   * 需求: 14.5
   */
  function saveSettings(): void {
    try {
      localStorage.setItem('totp_locale', locale.value);
      localStorage.setItem('totp_theme', theme.value);
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  /**
   * 获取浏览器语言
   * 需求: 14.4, 14.6
   */
  function getBrowserLocale(): string {
    const supportedLocales = [
      'zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru',
      'it', 'nl', 'pl', 'tr', 'ar', 'id', 'th', 'vi'
    ];

    const browserLocale = navigator.language || (navigator.languages && navigator.languages[0]);
    
    if (!browserLocale) {
      return 'en';
    }

    // 精确匹配
    if (supportedLocales.includes(browserLocale)) {
      return browserLocale;
    }

    // 语言代码匹配（例如 en-US -> en）
    const languageCode = browserLocale.split('-')[0];
    if (languageCode) {
      const match = supportedLocales.find(l => l.startsWith(languageCode));
      if (match) {
        return match;
      }
    }
    
    return 'en';
  }

  /**
   * 获取实际应用的主题（解析 auto）
   */
  function getEffectiveTheme(): 'light' | 'dark' {
    if (theme.value === 'auto') {
      // 检测系统主题偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }
    return theme.value;
  }

  /**
   * 监听系统主题变化（当主题设置为 auto 时）
   */
  function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handler = (e: MediaQueryListEvent) => {
        if (theme.value === 'auto') {
          callback(e.matches ? 'dark' : 'light');
        }
      };

      // 现代浏览器
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
      } else {
        // 旧浏览器兼容
        mediaQuery.addListener(handler);
      }
    }
  }

  // 初始化时加载设置
  loadSettings();

  return {
    // State
    locale,
    theme,
    // Actions
    setLocale,
    setTheme,
    loadSettings,
    saveSettings,
    getBrowserLocale,
    getEffectiveTheme,
    watchSystemTheme,
  };
});
