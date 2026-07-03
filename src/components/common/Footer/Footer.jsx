import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { socialConfig } from '../../../config/socialConfig'; // 🔥 কনফিগ ফাইল ইম্পোর্ট

export default function Footer() {
  const { t, i18n } = useTranslation('footer');
  const isBangla = i18n.language === 'bn';
  const logoUrl = "https://res.cloudinary.com/do1dejkkk/image/upload/v1782663084/trace_3_d1bgh2.svg";

  // সোশ্যাল মিডিয়া লিস্ট (SVG আইকন ও কনফিগ লিংকসহ)
  const socialLinks = [
    { name: 'Facebook', url: socialConfig.facebook, icon: 'FB', color: 'hover:bg-blue-600 hover:text-white' },
    { name: 'Instagram', url: socialConfig.instagram, icon: 'IG', color: 'hover:bg-pink-600 hover:text-white' },
    { name: 'YouTube', url: socialConfig.youtube, icon: 'YT', color: 'hover:bg-red-600 hover:text-white' },
    { name: 'Dribbble', url: socialConfig.dribbble, icon: 'DR', color: 'hover:bg-rose-500 hover:text-white' },
    { name: 'Medium', url: socialConfig.medium, icon: 'MD', color: 'hover:bg-emerald-600 hover:text-white' },
    { name: 'Reddit', url: socialConfig.reddit, icon: 'RD', color: 'hover:bg-orange-600 hover:text-white' },
    { name: 'WhatsApp', url: socialConfig.whatsapp, icon: 'WA', color: 'hover:bg-green-500 hover:text-white' },
    { name: 'Email', url: socialConfig.email, icon: 'EM', color: 'hover:bg-cyan-600 hover:text-white' },
    { name: 'Website', url: socialConfig.website, icon: 'WEB', color: 'hover:bg-indigo-600 hover:text-white' }
  ];

  return (
    <footer className="bg-[#537393] dark:bg-slate-950 text-white dark:text-slate-300 border-t border-slate-400 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Brand Info & Social Icons (Span 4 columns) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <img className="h-10 w-auto filter brightness-0 invert" src={logoUrl} alt="Chitro Academy Logo" />
            </Link>
            <h3 className={`text-lg font-bold text-white mt-2 ${isBangla ? 'font-bangla' : 'font-montserrat'}`}>
              {t('aboutTitle')}
            </h3>
            <p className="text-sm text-slate-100 dark:text-slate-400 leading-relaxed pr-4">
              {t('aboutDesc')}
            </p>

            {/* Social Media Connected Grid */}
            <div className="pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-200 dark:text-amber-400 mb-3">
                {t('followUs')}
              </p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    title={social.name}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 dark:bg-slate-900 border border-white/10 dark:border-slate-800 text-slate-100 dark:text-slate-300 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm ${social.color}`}
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (Span 2 columns) */}
          <div className="lg:col-span-2">
            <h4 className={`text-base font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-3 ${isBangla ? 'font-bangla' : 'font-montserrat'}`}>
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/courses" className="hover:text-amber-400 transition-colors">{t('courses')}</Link></li>
              <li><Link to="/artwork" className="hover:text-amber-400 transition-colors">{t('artworks')}</Link></li>
              <li><Link to="/exhibition" className="hover:text-amber-400 transition-colors">{t('exhibitions')}</Link></li>
              <li><Link to="/blog" className="hover:text-amber-400 transition-colors">{t('blog')}</Link></li>
            </ul>
          </div>

          {/* Column 3: All Policy Pages Linked (Span 3 columns) */}
          <div className="lg:col-span-3">
            <h4 className={`text-base font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-3 ${isBangla ? 'font-bangla' : 'font-montserrat'}`}>
              {t('legal')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/policies/privacy-policy" className="hover:text-amber-400 transition-colors block">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link to="/policies/terms-condition" className="hover:text-amber-400 transition-colors block">
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link to="/policies/refund-policy" className="hover:text-amber-400 transition-colors block">
                  {t('refund')}
                </Link>
              </li>
              <li>
                <Link to="/policies/copyright-policy" className="hover:text-amber-400 transition-colors block">
                  {t('copyrightPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info (Span 3 columns) */}
          <div className="lg:col-span-3">
            <h4 className={`text-base font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-3 ${isBangla ? 'font-bangla' : 'font-montserrat'}`}>
              {t('contactTitle')}
            </h4>
            <div className="space-y-3 text-sm text-slate-100 dark:text-slate-400">
              <a href={`mailto:${socialConfig.contactInfo.displayEmail}`} className="flex items-center gap-2.5 hover:text-amber-400 transition-colors">
                <span className="text-base">📧</span> {socialConfig.contactInfo.displayEmail}
              </a>
              <a href={`tel:${socialConfig.contactInfo.phone}`} className="flex items-center gap-2.5 hover:text-amber-400 transition-colors">
                <span className="text-base">📞</span> {socialConfig.contactInfo.phone}
              </a>
              <p className="flex items-center gap-2.5">
                <span className="text-base">📍</span> {isBangla ? socialConfig.contactInfo.locationBn : socialConfig.contactInfo.locationEn}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Policy Shortcuts */}
        <div className="mt-12 pt-8 border-t border-white/20 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-slate-200 dark:text-slate-500 gap-4">
          <p>{t('rights')}</p>
          
          <div className="flex items-center space-x-4">
            <Link to="/policies/privacy-policy" className="hover:underline">{t('privacy')}</Link>
            <span>•</span>
            <Link to="/policies/terms-condition" className="hover:underline">{t('terms')}</Link>
            <span>•</span>
            <Link to="/policies/refund-policy" className="hover:underline">{t('refund')}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}