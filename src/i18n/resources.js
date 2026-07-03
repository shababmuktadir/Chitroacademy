import enNavbar from './locales/en/navbar.json';
import bnNavbar from './locales/bn/navbar.json';
import enHome from './locales/en/home.json';
import bnHome from './locales/bn/home.json';
import enFooter from './locales/en/footer.json';
import bnFooter from './locales/bn/footer.json';
import enAuth from './locales/en/auth.json';
import bnAuth from './locales/bn/auth.json';
import enDashboard from './locales/en/dashboard.json'; // 🔥 Dashboard ইম্পোর্ট
import bnDashboard from './locales/bn/dashboard.json';

export const resources = {
  en: { navbar: enNavbar, home: enHome, footer: enFooter, auth: enAuth, dashboard: enDashboard },
  bn: { navbar: bnNavbar, home: bnHome, footer: bnFooter, auth: bnAuth, dashboard: bnDashboard }
};