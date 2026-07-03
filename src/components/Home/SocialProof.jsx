import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function SocialProof() {
  const { t, i18n } = useTranslation('home');
  const isBangla = i18n.language === 'bn';

  const stats = [
    {
      num: t('socialProof.stat1Num'),
      title: t('socialProof.stat1Title'),
      desc: t('socialProof.stat1Desc'),
      icon: "👨‍🎨"
    },
    {
      num: t('socialProof.stat2Num'),
      title: t('socialProof.stat2Title'),
      desc: t('socialProof.stat2Desc'),
      icon: "⭐"
    },
    {
      num: t('socialProof.stat3Num'),
      title: t('socialProof.stat3Title'),
      desc: t('socialProof.stat3Desc'),
      icon: "📖"
    }
  ];

  const brandNames = ["Publishing Houses", "Creative Studios", "Steadfast Merchant", "Vector Agencies", "Art Guilds"];

  return (
    <section className="py-20 lg:py-24 bg-slate-100 dark:bg-slate-900/40 border-t border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs sm:text-sm font-bold tracking-widest text-[#7393B3] dark:text-amber-400 uppercase"
          >
            {t('socialProof.tagline')}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mt-3 mb-4 ${
              isBangla ? 'font-bangla' : 'font-montserrat'
            }`}
          >
            {t('socialProof.heading')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400"
          >
            {t('socialProof.subheading')}
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-shadow text-center relative overflow-hidden"
            >
              <span className="text-3xl absolute top-4 right-4 opacity-20">{item.icon}</span>
              <h3 className="text-4xl sm:text-5xl font-extrabold text-[#7393B3] dark:text-amber-400 mb-2">
                {item.num}
              </h3>
              <h4 className={`text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 ${
                isBangla ? 'font-bangla' : 'font-montserrat'
              }`}>
                {item.title}
              </h4>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Brand Bar / Industry Proof */}
        <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider mb-6">
            {t('socialProof.brandTitle')}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-70 dark:opacity-60">
            {brandNames.map((brand, i) => (
              <div
                key={i}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm tracking-wide shadow-sm"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}