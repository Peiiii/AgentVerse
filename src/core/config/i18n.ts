import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';

const LANGUAGE_STORAGE_KEY = 'app:language';

// 从 localStorage 获取保存的语言，如果没有则使用浏览器语言
const getInitialLanguage = (): string => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved) return saved;
  
  // 检测浏览器语言
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  if (browserLang.startsWith('zh')) return 'zh-CN';
  return 'en-US';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
      'en-US': {
        translation: enUS,
      },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false, // React 已经转义了
    },
  });

// 监听语言变化，保存到 localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
});

export default i18n;

