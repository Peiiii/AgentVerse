import { useTranslation as useI18nTranslation } from "react-i18next";
import i18n from "../config/i18n";

const LANGUAGE_STORAGE_KEY = "app:language";

async function applyLanguageChange(targetI18n: typeof i18n, lng: string) {
  // Persist to localStorage for initial i18n boot.
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);

  await targetI18n.changeLanguage(lng);

  window.location.reload();
}

export function useTranslation() {
  const { t, i18n: i18nInstance } = useI18nTranslation();

  const changeLanguage = (lng: string) => applyLanguageChange(i18nInstance, lng);

  const currentLanguage = i18nInstance.language;

  return {
    t,
    changeLanguage,
    currentLanguage,
    i18n: i18nInstance,
  };
}

export function changeLanguage(lng: string) {
  return applyLanguageChange(i18n, lng);
}

export { i18n };
