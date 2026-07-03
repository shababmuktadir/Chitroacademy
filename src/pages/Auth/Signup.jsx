// src/pages/Auth/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/common/Navbar/Navbar';

export default function Signup() {
  const { signup, socialLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // ইমেইল ভেরিফিকেশন পপ-আপ দেখানোর স্টেট
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // ইমেইল দিয়ে সাইনআপ
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      return setErrorMsg('পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে!');
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      setLoading(false);
      
      // যদি অ্যাডমিন ইমেইল হয় তবে সরাসরি ড্যাশবোর্ডে যাবে, নইলে ভেরিফিকেশন মডাল দেখাবে
      if (email === "shababmuktadir@gmail.com") {
        navigate('/dashboard', { replace: true });
      } else {
        setShowVerificationModal(true);
      }
    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('এই ইমেইল দিয়ে আগে থেকেই একটি অ্যাকাউন্ট রয়েছে! অনুগ্রহ করে Log In করুন।');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('ইমেইল ঠিকানাটি সঠিক নয়!');
      } else {
        setErrorMsg(err.message || 'অ্যাকাউন্ট তৈরি করা যায়নি! আবার চেষ্টা করুন।');
      }
    }
  };

  // গুগল বা অ্যাপল দিয়ে সাইনআপ
  const handleSocialAuth = async (provider) => {
    setErrorMsg('');
    setLoading(true);
    try {
      await socialLogin(provider);
      setLoading(false);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setLoading(false);
      setErrorMsg(`${provider === 'google' ? 'Google' : 'Apple'} সাইনআপ সফল হয়নি!`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative z-10"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-[#7393B3] to-cyan-500 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              Create Account 🚀
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              বিনামূল্যে অ্যাকাউন্ট তৈরি করুন এবং শেখা শুরু করুন
            </p>
          </div>

          {/* এরর মেসেজ */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* সোশ্যাল লগইন বাটনসমূহ */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.3 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/><path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.8z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.2L1.6 15.9C3.5 19.7 7.4 23 12 23z"/></svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialAuth('apple')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.71 1.39-.58.68-.98 1.78-.84 2.84 1.04.08 2.1-.45 2.59-1.29z"/></svg>
              Apple
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-extrabold"><span className="bg-white dark:bg-slate-900 px-3 text-slate-400">Or sign up with email</span></div>
          </div>

          {/* ইমেইল সাইনআপ ফর্ম */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                placeholder="MD Nazmul Islam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#7393B3] dark:focus:ring-cyan-500 outline-none text-sm transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#7393B3] dark:focus:ring-cyan-500 outline-none text-sm transition-all font-medium"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#7393B3] dark:focus:ring-cyan-500 outline-none text-sm transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-[#7393B3] to-[#5a7691] dark:from-cyan-500 dark:to-blue-600 text-white shadow-lg hover:opacity-95 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2 mt-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              <span>{loading ? "Creating Account..." : "Sign Up"}</span>
            </button>
          </form>

          <p className="text-center mt-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#7393B3] dark:text-cyan-400 font-bold hover:underline">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ইমেইল ভেরিফিকেশন মডাল */}
      <AnimatePresence>
        {showVerificationModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 max-w-sm w-full p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto mb-4 text-3xl">
                ✉️
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                Verify Your Email
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                আমরা আপনার <strong>{email}</strong> ঠিকানায় একটি অ্যাক্টিভেশন লিংক পাঠিয়েছি। দয়া করে ইনবক্স চেক করে লিংকে ক্লিক করুন, এরপর লগইন করুন।
              </p>
              
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  navigate('/login');
                }}
                className="w-full py-3.5 rounded-2xl font-bold bg-[#7393B3] dark:bg-cyan-500 text-white shadow-lg cursor-pointer text-sm"
              >
                Go to Login Page →
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}