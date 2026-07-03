import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function NewsletterCTA() {
  const { t, i18n } = useTranslation('home');
  const isBangla = i18n.language === 'bn';
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  // 🔥 আপনার Google Apps Script Web App URL টি এখানে বসান:
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwepJlct6hwAPLUxUJtXXWO4Ubtu8XJ3Jv3NxT_JTpgXPvSbUdFhi2xgdqKPspcFNNfrg/exec";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setStatus(null);

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script CORS এড়াতে no-cors ব্যবহার করা হয়
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          language: i18n.language
        })
      });

      // no-cors থাকার কারণে সরাসরি response check করা যায় না, তাই request send হলেই success ধরা হয়
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error("Newsletter submission error:", error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 lg:py-24 bg-slate-100 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
      
      {/* Subtle Glow */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#7393B3]/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl"
        >
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#7393B3] dark:text-amber-400 uppercase">
            {t('newsletter.tagline')}
          </span>

          <h2 className={`text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3 mb-4 leading-tight ${
            isBangla ? 'font-bangla' : 'font-montserrat'
          }`}>
            {t('newsletter.heading')}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('newsletter.description')}
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm sm:text-base max-w-xl mx-auto"
            >
              {t('newsletter.successMsg')}
            </motion.div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletter.placeholder')}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7393B3] dark:focus:ring-amber-500 transition-all text-sm sm:text-base disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-[#7393B3] hover:bg-[#6383a3] dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 cursor-pointer text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      {t('newsletter.loadingText')}
                    </span>
                  ) : (
                    t('newsletter.btnText')
                  )}
                </button>
              </form>

              {status === 'error' && (
                <p className="text-sm font-semibold text-rose-500 mt-3">
                  {t('newsletter.errorMsg')}
                </p>
              )}
            </>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            🔒 {t('newsletter.disclaimer')}
          </p>
        </motion.div>

      </div>
    </section>
  );
}