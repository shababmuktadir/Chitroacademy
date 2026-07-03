import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function BrandOverview() {
  const { t, i18n } = useTranslation('home');
  const isBangla = i18n.language === 'bn';

  return (
    <section className="py-20 lg:py-28 bg-slate-100 dark:bg-slate-900/50 border-t border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Artistic Visual Mock Box */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Decorative Background Frame */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#7393B3] to-[#4A6B8A] dark:from-amber-500 dark:to-orange-600 opacity-20 blur-xl"></div>
            
            <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-[#7393B3]/20 via-slate-200 to-white dark:from-slate-800 dark:via-slate-900 dark:to-black flex flex-col items-center justify-center border border-slate-300/50 dark:border-slate-700/50 p-6 text-center">
                <span className="text-5xl mb-4">🎨✨</span>
                <h3 className={`text-xl sm:text-2xl font-bold text-slate-800 dark:text-white ${isBangla ? 'font-bangla' : 'font-almendra'}`}>
                  {isBangla ? 'ডিজিটাল আর্ট ও ইলাস্ট্রেশন' : 'Digital Art & Illustration'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                  Vector Graphics • Book Covers • Style Replication
                </p>
              </div>

              {/* Floating Badge inside Card */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {isBangla ? 'প্রফেশনাল মান বজায় রাখা হয়' : 'Industry Standard Workflow'}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#7393B3] dark:text-amber-400 uppercase tracking-wider">
                  Chitro Academy
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Content Details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#7393B3] dark:text-amber-400 uppercase">
              {t('brandOverview.tagline')}
            </span>

            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mt-3 mb-6 leading-tight ${
              isBangla ? 'font-bangla' : 'font-montserrat'
            }`}>
              {t('brandOverview.heading')}{' '}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r from-[#7393B3] to-[#4A6B8A] dark:from-amber-400 dark:to-orange-500 ${
                isBangla ? 'font-bangla' : 'font-almendra font-normal block sm:inline'
              }`}>
                {t('brandOverview.headingHighlight')}
              </span>
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-4 leading-relaxed">
              {t('brandOverview.description1')}
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
              {t('brandOverview.description2')}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-[#7393B3] dark:text-amber-400">
                  {t('brandOverview.stat1Number')}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {t('brandOverview.stat1Label')}
                </p>
              </div>
              <div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-[#7393B3] dark:text-amber-400">
                  {t('brandOverview.stat2Number')}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {t('brandOverview.stat2Label')}
                </p>
              </div>
              <div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-[#7393B3] dark:text-amber-400">
                  {t('brandOverview.stat3Number')}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {t('brandOverview.stat3Label')}
                </p>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}