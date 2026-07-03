import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function Features() {
  const { t, i18n } = useTranslation('home');
  const isBangla = i18n.language === 'bn';

  const featureCards = [
    {
      icon: "🖌️",
      title: t('features.card1Title'),
      desc: t('features.card1Desc'),
      borderHover: "hover:border-[#7393B3] dark:hover:border-cyan-500"
    },
    {
      icon: "📚",
      title: t('features.card2Title'),
      desc: t('features.card2Desc'),
      borderHover: "hover:border-[#7393B3] dark:hover:border-amber-500"
    },
    {
      icon: "🎭",
      title: t('features.card3Title'),
      desc: t('features.card3Desc'),
      borderHover: "hover:border-[#7393B3] dark:hover:border-rose-500"
    },
    {
      icon: "🎯",
      title: t('features.card4Title'),
      desc: t('features.card4Desc'),
      borderHover: "hover:border-[#7393B3] dark:hover:border-emerald-500"
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#121212] transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#7393B3]/5 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs sm:text-sm font-bold tracking-widest text-[#7393B3] dark:text-amber-400 uppercase"
          >
            {t('features.tagline')}
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
            {t('features.heading')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400"
          >
            {t('features.subheading')}
          </motion.p>
        </div>

        {/* Features Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featureCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${card.borderHover}`}
            >
              <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl shadow-sm mb-6">
                {card.icon}
              </div>

              <h3 className={`text-xl font-bold text-slate-900 dark:text-white mb-3 ${
                isBangla ? 'font-bangla' : 'font-montserrat'
              }`}>
                {card.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}