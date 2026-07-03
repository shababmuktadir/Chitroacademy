import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t, i18n } = useTranslation('home');
  const { user } = useAuth();
  const isBangla = i18n.language === 'bn';

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-[#121212] py-20 lg:py-32 transition-colors duration-300">
      
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7393B3]/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block px-4 py-1.5 rounded-full bg-[#7393B3]/10 dark:bg-slate-800/80 border border-[#7393B3]/20 dark:border-slate-700 text-xs sm:text-sm font-semibold text-[#6383a3] dark:text-amber-400 mb-6 shadow-sm"
        >
          {t('hero.badge')}
        </motion.div>

        {/* Hero Title with Almendra & Bangla font logic */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-6 ${
            isBangla ? 'font-bangla' : 'font-montserrat'
          }`}
        >
          {t('hero.title1')}{' '}
          <span className={`block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[#7393B3] to-[#4A6B8A] dark:from-amber-400 dark:to-orange-500 ${
            isBangla ? 'font-bangla' : 'font-almendra font-normal'
          }`}>
            {t('hero.titleHighlight')}
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed"
        >
          {t('hero.description')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-[#7393B3] hover:bg-[#6383a3] dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {t('hero.ctaDashboard')}
            </Link>
          ) : (
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-[#7393B3] hover:bg-[#6383a3] dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {t('hero.ctaStart')}
            </Link>
          )}

          <Link
            to="/artwork"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-md transition-all duration-300"
          >
            {t('hero.ctaExplore')}
          </Link>
        </motion.div>

      </div>
    </div>
  );
}