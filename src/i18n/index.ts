import { createI18n } from 'vue-i18n';

// 支持的语言列表
export interface LocaleConfig {
  code: string;
  name: string;
  flag: string;
  rtl?: boolean;
}

export const supportedLocales: LocaleConfig[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

// 懒加载语言文件
const loadLocaleMessages = async (locale: string) => {
  const messages = await import(`./locales/${locale}.json`);
  return messages.default;
};

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {},
});

// 设置语言
export async function setLocale(locale: string) {
  // 加载语言文件（如果尚未加载）
  if (!i18n.global.availableLocales.includes(locale)) {
    const messages = await loadLocaleMessages(locale);
    i18n.global.setLocaleMessage(locale, messages);
  }
  
  i18n.global.locale.value = locale;
  
  // 设置 HTML lang 属性
  document.querySelector('html')?.setAttribute('lang', locale);
  
  // 设置 RTL 方向（阿拉伯语）
  const localeConfig = supportedLocales.find(l => l.code === locale);
  if (localeConfig?.rtl) {
    document.querySelector('html')?.setAttribute('dir', 'rtl');
  } else {
    document.querySelector('html')?.setAttribute('dir', 'ltr');
  }
  
  // 保存到 LocalStorage
  localStorage.setItem('totp_locale', locale);
}

// 获取浏览器语言
export function getBrowserLocale(): string {
  const browserLocale = navigator.language || (navigator.languages && navigator.languages[0]);
  
  if (!browserLocale) {
    return 'en';
  }
  
  // 精确匹配
  if (supportedLocales.some(l => l.code === browserLocale)) {
    return browserLocale;
  }
  
  // 语言代码匹配（例如 en-US -> en）
  const languageCode = browserLocale.split('-')[0];
  if (languageCode) {
    const match = supportedLocales.find(l => l.code.startsWith(languageCode));
    if (match) {
      return match.code;
    }
  }
  
  return 'en';
}

// 初始化 i18n
export async function initI18n() {
  // 从 LocalStorage 获取保存的语言偏好
  const savedLocale = localStorage.getItem('totp_locale');
  
  // 确定要使用的语言
  let locale = 'en';
  if (savedLocale && supportedLocales.some(l => l.code === savedLocale)) {
    locale = savedLocale;
  } else {
    locale = getBrowserLocale();
  }
  
  // 加载并设置语言
  await setLocale(locale);
}
