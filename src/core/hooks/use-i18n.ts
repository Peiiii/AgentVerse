import { settingsService } from "@/core/services/settings.service";
import { useTranslation as useI18nTranslation } from "react-i18next";
import i18n from "../config/i18n";

const LANGUAGE_STORAGE_KEY = "app:language";
const APP_LANGUAGE_SETTING_KEY = "app.language";

// Keep i18n's current language and the settings entry `app.language` in sync.
// Otherwise settings load can override the language back to the old value.
async function syncAppLanguageSetting(lng: string) {
  try {
    const settings = await settingsService.listSettings();
    const languageSetting = settings.find(
      (setting) => setting.key === APP_LANGUAGE_SETTING_KEY
    );

    if (!languageSetting || languageSetting.value === lng) {
      return;
    }

    await settingsService.updateSetting(languageSetting.id, { value: lng });
  } catch (error) {
    // Failing to sync the settings should not block language switching.
    console.error("Failed to sync app.language setting", error);
  }
}

async function applyLanguageChange(targetI18n: typeof i18n, lng: string) {
  // Persist to localStorage for initial i18n boot.
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);

  await targetI18n.changeLanguage(lng);
  await syncAppLanguageSetting(lng);

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
