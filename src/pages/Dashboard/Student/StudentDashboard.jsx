import React, { useEffect, useState } from 'react';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  CreditCard,
  CheckCircle2,
  User,
  Play,
  DollarSign,
  ShieldCheck,
  Layers,
  Video,
  Sparkles,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState([]);
  const [unlockedCourses, setUnlockedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ইউজার লগইন না থাকলে লোডিং বন্ধ করে রিটার্ন করবে
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // ১. ফায়ারবেস সিকিউরিটি রুলস অনুযায়ী ইউজারের নিজস্ব 'uid' দিয়ে পেমেন্ট কুয়েরি করা হচ্ছে
    const q = query(collection(db, 'payments'), where('uid', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snap) => {
        const paymentData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPayments(paymentData);

        // ২. শুধুমাত্র 'verified' স্ট্যাটাসের কোর্সগুলোর বিস্তারিত ডেটাবেস থেকে লোড করা
        const verifiedIds = paymentData
          .filter((p) => p.status === 'verified')
          .map((p) => p.courseId)
          .filter(Boolean);

        const uniqueIds = [...new Set(verifiedIds)];

        const coursePromises = uniqueIds.map(async (courseId) => {
          try {
            const courseRef = doc(db, 'courses', courseId);
            const cSnap = await getDoc(courseRef);
            return cSnap.exists() ? { id: cSnap.id, ...cSnap.data() } : null;
          } catch (e) {
            return null;
          }
        });

        const fetchedCourses = (await Promise.all(coursePromises)).filter(Boolean);
        setUnlockedCourses(fetchedCourses);
        setLoading(false);
      },
      (error) => {
        console.error('Payment snapshot error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // ফিল্টার করা পেমেন্ট লিস্ট ও হিসাব
  const verifiedPayments = payments.filter((p) => p.status === 'verified');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const totalSpent = verifiedPayments.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // ক্লাসের ভিডিও বা ওয়ার্কশপ পেজে নিয়ে যাওয়ার ফাংশন
  const handleWatchClass = (course) => {
    navigate(`/courses/play/${course.id}`, { state: { course } });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-amber-500 space-y-4 transition-colors duration-300">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
          Loading Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col md:flex-row select-none transition-colors duration-300">
      
      {/* ================= ফিক্সড ও স্টিকি সাইডবার (Sticky Sidebar) ================= */}
      <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between md:sticky md:top-0 md:h-screen md:overflow-y-auto z-20 shadow-sm transition-colors duration-300">
        <div className="space-y-6">
          {/* জিমেইল প্রোফাইল হেডার কার্ড */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile Avatar"
                className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md flex-shrink-0">
                {user?.displayName ? user.displayName[0].toUpperCase() : 'S'}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold text-amber-500 uppercase block tracking-wider">
                Student Panel
              </span>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white truncate">
                {user?.displayName || 'Student'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* মেনু নেভিগেশন */}
          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: t('overview', 'Dashboard Overview'), icon: Layers },
              {
                id: 'my-courses',
                label: `${t('myCourses', 'My Enrolled Courses')} (${unlockedCourses.length})`,
                icon: BookOpen,
              },
              {
                id: 'pending',
                label: `${t('pending', 'Pending Approvals')} (${pendingPayments.length})`,
                icon: Clock,
              },
              { id: 'billing', label: t('billing', 'Payment History'), icon: CreditCard },
              { id: 'profile', label: t('profile', 'Profile Details'), icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'}`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* সাইডবার নিচের বাটনসমূহ */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Website</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 dark:text-rose-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= মূল কনটেন্ট এরিয়া ================= */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-8 max-w-6xl">
        {/* টপ ব্যানার */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-white">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Chitro Learning Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {t(
                'subtitle',
                'Track your fine art masterclasses, live schedules, and payment verification status.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300">Account Verified</span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* পরিসংখ্যান কার্ড */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm transition-colors duration-300">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase">
                    {t('stats.unlocked', 'Unlocked Courses')}
                  </span>
                  <BookOpen className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                  {unlockedCourses.length}
                </h3>
                <p className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold">
                  {t('stats.unlockedSub', 'Active Lifetime Access')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm transition-colors duration-300">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase">
                    {t('stats.pending', 'Pending Verifications')}
                  </span>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-3xl font-black text-amber-500">
                  {pendingPayments.length}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('stats.pendingSub', 'Awaiting Admin Approval')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm transition-colors duration-300">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase">
                    {t('stats.investment', 'Total Investment')}
                  </span>
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                  ৳ {totalSpent.toLocaleString()}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('stats.investmentSub', 'Verified Transactions')}
                </p>
              </div>
            </div>

            {/* সম্প্রতি আনলক হওয়া কোর্স প্রিভিউ */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  {t('recentCourses', 'Recently Unlocked Masterclasses')}
                </h3>
                <button
                  onClick={() => setActiveTab('my-courses')}
                  className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                >
                  {t('viewAll', 'View All')}
                </button>
              </div>

              {unlockedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {unlockedCourses.slice(0, 2).map((course) => (
                    <div
                      key={course.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm transition-colors duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={course.thumbnail}
                          alt=""
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-extrabold text-amber-500 uppercase">
                            {course.category}
                          </span>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1">
                            {course.title}
                          </h4>
                          <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                            {t('stats.unlockedSub', 'Active Lifetime Access')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleWatchClass(course)}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />{' '}
                        {t('watch', 'Watch')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-xs space-y-2">
                  <p>
                    {t(
                      'noCoursesSub',
                      'If you purchased a course, please wait for admin verification.'
                    )}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: ENROLLED COURSES */}
        {activeTab === 'my-courses' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">
                {t('myCourses', 'My Enrolled Courses')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('stats.unlockedSub', 'Active Lifetime Access')}
              </p>
            </div>

            {unlockedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-sm group transition-colors duration-300"
                  >
                    <div>
                      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 text-[11px] font-bold border border-white/10">
                          {course.category}
                        </span>
                      </div>
                      <div className="p-5 space-y-2">
                        <h4 className="font-extrabold text-base text-slate-800 dark:text-white line-clamp-1">
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />{' '}
                        {t('stats.unlocked', 'Unlocked Courses')}
                      </span>
                      <button
                        onClick={() => handleWatchClass(course)}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />{' '}
                        {t('startClass', 'Start Class')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-100 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold">
                  {t('noCourses', 'No verified courses found yet!')}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: PENDING APPROVALS */}
        {activeTab === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">
                {t('pending', 'Pending Approvals')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('stats.pendingSub', 'Awaiting Admin Approval')}
              </p>
            </div>

            {pendingPayments.length > 0 ? (
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm transition-colors duration-300"
                  >
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 inline-block">
                        ⏳ {t('stats.pendingSub', 'Awaiting Admin Approval')}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
                        {payment.courseTitle}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        TrxID: <strong className="text-amber-500">{payment.transactionId}</strong> • Method:{' '}
                        <span className="uppercase font-bold">{payment.paymentMethod}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">
                        {t('table.amount', 'Amount')}
                      </span>
                      <span className="text-xl font-black text-slate-800 dark:text-white">
                        ৳ {payment.amount}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(payment.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-100 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {t('noCourses', 'No verified courses found yet!')}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: BILLING HISTORY */}
        {activeTab === 'billing' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">
                {t('billing', 'Payment History')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('stats.investmentSub', 'Verified Transactions')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-950/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4">{t('table.courseDetails', 'Course Details')}</th>
                      <th className="p-4">{t('table.trxAndMethod', 'TrxID & Method')}</th>
                      <th className="p-4">{t('table.date', 'Date')}</th>
                      <th className="p-4">{t('table.amount', 'Amount')}</th>
                      <th className="p-4">{t('table.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="p-4 font-bold text-slate-800 dark:text-white">
                            {payment.courseTitle}
                          </td>
                          <td className="p-4 font-mono text-amber-500 font-bold">
                            {payment.transactionId}{' '}
                            <span className="text-[10px] text-slate-400 block uppercase font-sans font-medium">
                              {payment.paymentMethod}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 dark:text-slate-400">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-black text-slate-800 dark:text-white">
                            ৳ {payment.amount}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                                payment.status === 'verified'
                                  ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20'
                                  : payment.status === 'rejected'
                                    ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {payment.status === 'verified' && (
                                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                              )}
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-slate-400">
                          {t('noCourses', 'No verified courses found yet!')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: PROFILE DETAILS */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl space-y-6 shadow-sm transition-colors duration-300"
          >
            <h3 className="text-xl font-black text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
              {t('profileInfo.title', 'Personal Account Information')}
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 py-3 border-b border-slate-200 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {t('profileInfo.fullName', 'Full Name')}
                </span>
                <span className="col-span-2 font-bold text-slate-800 dark:text-white">
                  {user?.displayName || 'Not Provided'}
                </span>
              </div>
              <div className="grid grid-cols-3 py-3 border-b border-slate-200 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {t('profileInfo.email', 'Email Address')}
                </span>
                <span className="col-span-2 font-bold text-amber-500">{user?.email}</span>
              </div>
              <div className="grid grid-cols-3 py-3 border-b border-slate-200 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  {t('profileInfo.uid', 'UID')}
                </span>
                <span className="col-span-2 font-mono text-slate-500 dark:text-slate-400">
                  {user?.uid}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}