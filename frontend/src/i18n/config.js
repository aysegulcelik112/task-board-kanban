/**
 * i18next Configuration - Çoklu Dil Desteği
 * Türkçe ve İngilizce dillerini destekler
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import trTranslations from './locales/tr.json';
import enTranslations from './locales/en.json';

// LocalStorage'dan dil tercihini al, yoksa Türkçe kullan
const savedLanguage = localStorage.getItem('language') || 'tr';

i18n
  .use(initReactI18next) // React entegrasyonu için
  .init({
    resources: {
      tr: {
        translation: trTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    lng: savedLanguage, // Varsayılan dil
    fallbackLng: 'tr', // Çeviri bulunamazsa Türkçe'ye düş
    interpolation: {
      escapeValue: false // React zaten XSS koruması yapıyor
    },
    react: {
      useSuspense: false // Loading state'i manuel yönetmek için
    }
  });

// Dil değiştiğinde localStorage'a kaydet
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
