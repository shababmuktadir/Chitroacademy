// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';
import { LANGUAGE_KEYS, LOCAL_STORAGE_KEY } from './constants';

// ব্রাউজারে আগে থেকে সেভ থাকা ল্যাঙ্গুয়েজ চেক করা, না থাকলে ডিফল্ট 'en'
const savedLanguage = localStorage.getItem(LOCAL_STORAGE_KEY) || LANGUAGE_KEYS.EN;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: LANGUAGE_KEYS.EN,
    // 🔥 এখানে সব namespace যুক্ত করা হলো, যাতে কোনোটা বাদ না পড়ে:
    ns: ['navbar', 'home', 'footer', 'auth', 'dashboard'], 
    defaultNS: 'navbar',
    interpolation: {
      escapeValue: false
    }
  });

// ল্যাঙ্গুয়েজ চেঞ্জ হলে লোকাল স্টোরেজে সেভ করা এবং বডিতে ফন্ট ফ্যামিলি ডাইনামিক করা
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, lng);
  const body = document.body;
  if (lng === 'bn') {
    body.style.fontFamily = "'Noto Serif Bengali', serif";
  } else {
    body.style.fontFamily = "'Montserrat', sans-serif";
  }
});

export default i18n;