import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function Reviews() {
  const { t, i18n } = useTranslation('home');
  const isBangla = i18n.language === 'bn';

  const reviewsList = [
    {
      name: t('reviews.rev1Name'),
      role: t('reviews.rev1Role'),
      text: t('reviews.rev1Text'),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir"
    },
    {
      name: t('reviews.rev2Name'),
      role: t('reviews.rev2Role'),
      text: t('reviews.rev2Text'),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sumaiya"
    },
    {
      name: t('reviews.rev3Name'),
      role: t('reviews.rev3Role'),
      text: t('reviews.rev3Text'),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fahim"
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#121212] transition-colors duration-300 relative">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs sm:text-sm font-bold tracking-widest text-[#7393B3] dark:text-amber-400 uppercase"
          >
            {t('reviews.tagline')}
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
            {t('reviews.heading')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400"
          >
            {t('reviews.subheading')}
          </motion.p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviewsList.map((rev, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative"
            >
              {/* Star Rating */}
              <div>
                <div className="flex items-center space-x-1 text-amber-500 text-sm mb-4">
                  {"★".repeat(5)}
                </div>

                {/* Review Text */}
                <p className="text-slate-700 dark:text-slate-300 italic text-sm sm:text-base leading-relaxed mb-6">
                  "{rev.text}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center space-x-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 p-1 border border-slate-300 dark:border-slate-700"
                />
                <div>
                  <h4 className={`font-bold text-slate-900 dark:text-white ${
                    isBangla ? 'font-bangla' : 'font-montserrat'
                  }`}>
                    {rev.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {rev.role}
                  </p>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}