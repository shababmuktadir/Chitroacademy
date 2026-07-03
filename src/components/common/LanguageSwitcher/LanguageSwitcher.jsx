import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'bn' ? 'en' : 'bn';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white/10 dark:bg-slate-900 text-white dark:text-amber-400 border border-white/20 dark:border-slate-800 hover:bg-white/20 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
      title="Change Language"
    >
      <span>{i18n.language === 'bn' ? 'বাংলা' : 'EN'}</span>
    </button>
  );
}