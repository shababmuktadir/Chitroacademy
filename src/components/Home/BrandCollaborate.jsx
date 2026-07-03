import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function BrandCollaborate() {
  const { t, i18n } = useTranslation('home');
  const isBangla = i18n.language === 'bn';

  return (
    <section className="py-20 lg:py-24 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#7393B3] to-[#4A6B8A] dark:from-slate-900 dark:to-slate-950 border border-slate-300/40 dark:border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 text-white">
              <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-slate-200 dark:text-amber-400">
                {t('collaborate.tagline')}
              </span>

              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-3 mb-4 leading-tight ${
                isBangla ? 'font-bangla' : 'font-montserrat'
              }`}>
                {t('collaborate.heading')}
              </h2>

              <p className="text-sm sm:text-base text-slate-100 dark:text-slate-300 leading-relaxed mb-6 max-w-2xl">
                {t('collaborate.description')}
              </p>

              {/* Bullet Features */}
              <div className="space-y-2.5 mb-8 lg:mb-0">
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-300 dark:text-amber-400 font-bold">✔</span>
                  <span className="text-sm sm:text-base font-medium">{t('collaborate.bullet1')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-300 dark:text-amber-400 font-bold">✔</span>
                  <span className="text-sm sm:text-base font-medium">{t('collaborate.bullet2')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-300 dark:text-amber-400 font-bold">✔</span>
                  <span className="text-sm sm:text-base font-medium">{t('collaborate.bullet3')}</span>
                </div>
              </div>
            </div>

            {/* Right Action Column */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-5 rounded-2xl font-bold text-center bg-white dark:bg-amber-500 text-[#4A6B8A] dark:text-slate-950 hover:bg-slate-100 dark:hover:bg-amber-600 shadow-xl transition-all duration-300 transform hover:scale-105 text-base"
              >
                {t('collaborate.ctaBtn')} →
              </Link>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}