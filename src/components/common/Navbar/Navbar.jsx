import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../app/providers/ThemeProvider'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t, i18n } = useTranslation('navbar')
  const isBangla = i18n.language === 'bn'
  const navigate = useNavigate()
  
  const [isCourseOpen, setIsCourseOpen] = useState(false)
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileCourseOpen, setIsMobileCourseOpen] = useState(false)
  const [isMobileExploreOpen, setIsMobileExploreOpen] = useState(false)
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false)
  const [navSearchQuery, setNavSearchQuery] = useState('')

  const logoUrl = "https://res.cloudinary.com/do1dejkkk/image/upload/v1782663084/trace_3_d1bgh2.svg"
  const defaultProfileIcon = "https://cdn-icons-png.flaticon.com/512/847/847969.png"

  const handleGlobalSearch = (e) => {
    e.preventDefault()
    const currentQuery = navSearchQuery.trim()
    if (!currentQuery) return
    navigate(`/search?query=${encodeURIComponent(currentQuery)}`)
    setNavSearchQuery('') 
    setIsMobileMenuOpen(false) 
  }

  // রোল অনুযায়ী ড্যাশবোর্ড রাউট নির্ধারণ
  const getDashboardRoute = () => {
    if (!user) return '/login';
    return user.role === 'mentor' ? '/dashboard/mentor' : '/dashboard/student';
  };

  return (
    <nav className="bg-[#7393B3] dark:bg-slate-950 border-b border-slate-400 dark:border-slate-800 text-white dark:text-slate-100 sticky top-0 z-[999] shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* ড্যাশবোর্ড পেজগুলোতে সাইডবার টগল করার বাটন */}
            {user && onMenuClick && (
              <button onClick={onMenuClick} className="p-2 -ml-2 rounded-xl hover:bg-white/10 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            )}
            <Link to="/"><img className="h-10 w-auto filter brightness-0 invert dark:filter-none" src={logoUrl} alt="Logo" /></Link>
          </div>

          <form onSubmit={handleGlobalSearch} className="flex-shrink-0 w-full max-w-[140px] sm:max-w-[260px] relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-100 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input type="text" value={navSearchQuery} onChange={(e) => setNavSearchQuery(e.target.value)} placeholder={t('searchPlaceholder')} className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white/20 dark:bg-slate-900 text-white dark:text-slate-200 placeholder-slate-200 dark:placeholder-slate-500 border border-white/20 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-cyan-500 transition-all" />
          </form>

          <div className="flex items-center space-x-3 md:space-x-5 ml-auto">
            <div className="hidden lg:flex items-center space-x-6">
              <Link to="/" className="hover:text-slate-200 font-medium text-sm">{t('home')}</Link>
              
              {/* Desktop Course Dropdown */}
              <div className="relative" onMouseEnter={() => setIsCourseOpen(true)} onMouseLeave={() => setIsCourseOpen(false)}>
                <button className="flex items-center space-x-1 font-medium text-sm cursor-pointer py-2">
                  <span>{t('course')}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${isCourseOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isCourseOpen && (
                  <div className="absolute left-0 mt-0 w-40 bg-[#6383a3] dark:bg-slate-900 border border-slate-500 dark:border-slate-800 rounded-xl shadow-xl py-2 z-[1000]">
                    <Link to="/courses?type=free" className="block px-4 py-2 text-sm hover:bg-[#537393] dark:hover:bg-slate-800">{t('freeCourse')}</Link>
                    <Link to="/courses?type=paid" className="block px-4 py-2 text-sm hover:bg-[#537393] dark:hover:bg-slate-800">{t('paidCourse')}</Link>
                  </div>
                )}
              </div>

              {/* Desktop Explore Dropdown */}
              <div className="relative" onMouseEnter={() => setIsExploreOpen(true)} onMouseLeave={() => setIsExploreOpen(false)}>
                <button className="flex items-center space-x-1 font-medium text-sm cursor-pointer py-2">
                  <span>{t('explore')}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isExploreOpen && (
                  <div className="absolute left-0 mt-0 w-40 bg-[#6383a3] dark:bg-slate-900 border border-slate-500 dark:border-slate-800 rounded-xl shadow-xl py-2 z-[1000]">
                    <Link to="/artwork" className="block px-4 py-2 text-sm hover:bg-[#537393] dark:hover:bg-slate-800">{t('artwork')}</Link>
                    <Link to="/exhibition" className="block px-4 py-2 text-sm hover:bg-[#537393] dark:hover:bg-slate-800">{t('exhibition')}</Link>
                    <Link to="/blog" className="block px-4 py-2 text-sm hover:bg-[#537393] dark:hover:bg-slate-800">{t('blog')}</Link>
                  </div>
                )}
              </div>
              <Link to="/contact" className="hover:text-slate-200 font-medium text-sm">{t('contact')}</Link>
            </div>

            {/* Avatar & Auth */}
            <div className="flex items-center">
              {user ? (
                <div className="relative">
                  <button onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)} className="flex items-center focus:outline-none">
                    <img className="h-10 w-10 bg-white rounded-full border-2 border-white/40 object-cover cursor-pointer shadow-md" src={user?.photoURL || defaultProfileIcon} referrerPolicy="no-referrer" onError={(e) => { e.target.onerror = null; e.target.src = defaultProfileIcon; }} alt="Avatar" />
                  </button>
                  {isAvatarDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-2xl py-3 z-[1050]">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm truncate">{user.displayName || "User"}</p>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#7393B3]/20 text-[#537393] dark:bg-amber-500/20 dark:text-amber-400">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      {/* 🔥 ডাইনামিক ড্যাশবোর্ড লিংক */}
                      <Link 
                        to={getDashboardRoute()} 
                        onClick={() => setIsAvatarDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm font-semibold text-[#537393] dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        ⚡ {user.role === 'mentor' ? (isBangla ? 'মেন্টর ড্যাশবোর্ড' : 'Mentor Dashboard') : (isBangla ? 'স্টুডেন্ট ড্যাশবোর্ড' : 'Student Dashboard')}
                      </Link>

                      <button onClick={async () => { setIsAvatarDropdownOpen(false); await logout(); navigate('/'); }} className="w-full text-left block px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold cursor-pointer">Log out</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-3 pl-2 border-l border-slate-400">
                  <Link to="/login" className="text-sm font-medium hover:text-slate-200 px-3 py-2">Log in</Link>
                  <Link to="/signup" className="text-sm font-semibold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl shadow-md">Sign up</Link>
                </div>
              )}
            </div>

            {/* Desktop Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <button onClick={toggleTheme} className="p-2 rounded-xl bg-white/10 dark:bg-slate-900 text-slate-100 border border-white/20 dark:border-slate-800 cursor-pointer">
              {theme === 'dark' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.364l.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>}
            </button>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-10 h-10 flex flex-col justify-center items-center relative focus:outline-none cursor-pointer">
                <span className={`w-6 h-0.5 bg-white rounded transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`}></span>
                <span className={`w-6 h-0.5 bg-white rounded transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-0' : 'translate-y-1'}`}></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE EXPANDED MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#6383a3] dark:bg-slate-950 border-t border-slate-500 dark:border-slate-900 px-6 py-5 space-y-4 shadow-xl">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-base font-semibold text-white">{t('home')}</Link>
          
          {/* Mobile Course Dropdown */}
          <div>
            <button onClick={() => setIsMobileCourseOpen(!isMobileCourseOpen)} className="w-full flex items-center justify-between py-1 text-base font-semibold text-white text-left">
              <span>{t('course')}</span>
              <svg className={`w-4 h-4 transition-transform ${isMobileCourseOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isMobileCourseOpen && (
              <div className="pl-4 mt-1 space-y-2 border-l-2 border-white/50 ml-1">
                <Link to="/courses?type=free" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-sm text-slate-100">{t('freeCourse')}</Link>
                <Link to="/courses?type=paid" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-sm text-slate-100">{t('paidCourse')}</Link>
              </div>
            )}
          </div>

          {/* Mobile Explore Dropdown */}
          <div>
            <button onClick={() => setIsMobileExploreOpen(!isMobileExploreOpen)} className="w-full flex items-center justify-between py-1 text-base font-semibold text-white text-left">
              <span>{t('explore')}</span>
              <svg className={`w-4 h-4 transition-transform ${isMobileExploreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isMobileExploreOpen && (
              <div className="pl-4 mt-1 space-y-2 border-l-2 border-white/50 ml-1">
                <Link to="/artwork" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-sm text-slate-100">{t('artwork')}</Link>
                <Link to="/exhibition" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-sm text-slate-100">{t('exhibition')}</Link>
                <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-sm text-slate-100">{t('blog')}</Link>
              </div>
            )}
          </div>

          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-base font-semibold text-white">{t('contact')}</Link>

          {user && (
            <Link to={getDashboardRoute()} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-4 rounded-xl bg-white/20 text-center font-bold text-white shadow-md">
              ⚡ {user.role === 'mentor' ? (isBangla ? 'মেন্টর ড্যাশবোর্ড' : 'Mentor Dashboard') : (isBangla ? 'স্টুডেন্ট ড্যাশবোর্ড' : 'Student Dashboard')}
            </Link>
          )}

          {/* Mobile Language Switcher */}
          <div className="pt-2 border-t border-white/20 flex items-center justify-between">
            <span className="text-sm font-semibold">Switch Language:</span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  )
}