import { useTranslation as useI18nTranslation } from 'react-i18next';
import i18n from '../config/i18n';

export function useTranslation() {
  const { t, i18n: i18nInstance } = useI18nTranslation();
  
  const changeLanguage = (lng: string) => {
    return i18nInstance.changeLanguage(lng);
  };
  
  const currentLanguage = i18nInstance.language;
  
  return {
    t,
    changeLanguage,
    currentLanguage,
    i18n: i18nInstance,
  };
}

export { i18n };

