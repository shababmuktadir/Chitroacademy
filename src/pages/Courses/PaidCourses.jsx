import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Tv, 
  Tag, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  ShieldCheck,
  Award,
  Radio
} from 'lucide-react';

export default function PaidCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 'paid' এবং 'live' দুই ধরণের কোর্সই একসাথে ফায়ারবেস থেকে লোড করা হচ্ছে
    const q = query(
      collection(db, "courses"), 
      where("type", "in", ["paid", "live"])
    );
    
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCourses(data);

      // ডাইনামিক ক্যাটাগরি লিস্ট তৈরি করা
      const uniqueCats = ['All', ...new Set(data.map(c => c.category).filter(Boolean))];
      setCategories(uniqueCats);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredCourses = selectedCategory === 'All' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  // কিনুন বাটনে ক্লিক করলে চেকআউট পেজে কোর্স ডেটা সহ নিয়ে যাবে
  const handleBuyNow = (course) => {
    // কোর্সের আসল টাইপ (paid অথবা live) সহ পাঠানো হচ্ছে
    const courseToCheckout = {
      ...course,
      type: course.type || 'paid'
    };
    navigate('/checkout', { state: { course: courseToCheckout } });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-950 text-cyan-400">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold tracking-widest uppercase">Loading Masterclasses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* ১. হেডার ও হিরো সেকশন */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Premium & Live Art Masterclasses
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Unlock Your True Artistic Potential
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Enroll in recorded masterclasses or interactive live workshops from expert artists. Get personal feedback and lifetime access.
          </p>
        </div>

        {/* ২. ইউটিউব/কমিউনিটি চ্যানেল সাবস্ক্রাইব ব্যানার */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-r from-red-600/20 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Tv className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">Chitro Official Art Channel</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Subscribe for free art tutorials, live demos, and artist community discussions!</p>
            </div>
          </div>
          <a
            href="https://youtube.com/@yourchannel"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <span>Subscribe Now</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* ৩. ক্যাটাগরি ফিল্টার ট্যাব */}
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ৪. কোর্স কার্ড গ্রিড */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const isLive = course.type === 'live';

                return (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`rounded-3xl border overflow-hidden flex flex-col justify-between group transition-all shadow-xl ${
                      isLive 
                        ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/30 border-rose-500/40 hover:border-rose-500' 
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* থাম্বনেইল ও ব্যাজ */}
                      <div className="relative h-56 w-full overflow-hidden bg-slate-800">
                        <img
                          src={course.thumbnail || "https://via.placeholder.com/400x250"}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-400 text-xs font-bold border border-white/10 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          {course.category}
                        </span>

                        {/* লাইভ কোর্স হলে স্পেশাল লাইভ ব্যাজ দেখাবে */}
                        {isLive ? (
                          <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-pulse">
                            <Radio className="w-3.5 h-3.5" /> LIVE WORKSHOP
                          </span>
                        ) : (
                          <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md animate-pulse">
                            🔥 Few Seats Left
                          </span>
                        )}
                      </div>

                      {/* বিবরণ ও কুপন অফার */}
                      <div className="p-6 space-y-4">
                        <h3 className="font-extrabold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {course.title || "Untitled Masterclass"}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>

                        {/* কুপন থাকলে স্পেশাল অফার দেখাবে */}
                        {course.appliedCoupon && (
                          <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-bold text-emerald-400">
                            <span>🎟️ Use Coupon: <strong className="font-mono text-white">{course.appliedCoupon.code}</strong></span>
                            <span>-{course.appliedCoupon.discountAmount}{course.appliedCoupon.discountType === 'percentage' ? '%' : '৳'}</span>
                          </div>
                        )}

                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                          {isLive ? (
                            <>
                              <div className="flex items-center gap-2 text-rose-300 font-bold"><Clock className="w-4 h-4 text-rose-400" /> Interactive Live Class / Google Meet</div>
                              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-rose-400" /> Direct Instructor Feedback & Q&A</div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Lifetime Video Access & Resources</div>
                              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400" /> Certificate of Completion</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* প্রাইস ও Buy Now বাটন */}
                    <div className="p-6 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Course Fee</span>
                        <span className="text-2xl font-black text-white">৳ {course.price?.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => handleBuyNow(course)}
                        className={`px-6 py-3.5 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                          isLive 
                            ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 shadow-rose-500/20' 
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
                        }`}
                      >
                        <span>{isLive ? 'Book Live Seat' : 'Enroll Now'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400">
                এই মুহূর্তে এই ক্যাটাগরিতে কোনো কোর্স নেই!
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}