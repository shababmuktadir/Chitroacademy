import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../../config/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CreditCard, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  X,
  AlertCircle,
  Sparkles,
  Lock,
  Clock
} from 'lucide-react';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course || null;
  const currentUser = auth.currentUser;

  // স্টেপ কন্ট্রোলার: 1 = Billing & Coupon, 2 = Payment Submit, 3 = Success Screen
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // ফর্মের ডেটা স্টেট (ইউজার লগইন থাকলে ডিফল্ট ডেটা অটোমেটিক বসে যাবে)
  const [studentData, setStudentData] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    batch: 'Batch-1 (Morning)',
    paymentMethod: 'bKash',
    senderPhone: '',
    transactionId: '',
    agreeTerms: false,
    agreeRefund: false
  });

  // কুপন ভ্যালিডেশন স্টেট
  const [inputCoupon, setInputCoupon] = useState('');
  const [discountInfo, setDiscountInfo] = useState({ discount: 0, code: '' });
  const [couponError, setCouponError] = useState('');

  // ইউজার যদি লগইন না থাকে, তবে তাকে আগে সাইন-ইন করতে বলা হবে
  useEffect(() => {
    if (!currentUser) {
      alert("দয়া করে পেমেন্ট করার আগে আপনার অ্যাকাউন্টে লগইন করুন!");
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-slate-900 dark:text-white space-y-4 transition-colors duration-300">
        <AlertCircle className="w-16 h-16 text-rose-500 animate-bounce" />
        <h2 className="text-2xl font-bold">কোনো কোর্স সিলেক্ট করা হয়নি!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">দয়া করে কোর্স লিস্ট পেজ থেকে আপনার পছন্দের কোর্সটি বেছে নিন।</p>
        <button onClick={() => navigate('/courses/paid')} className="px-6 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold text-sm cursor-pointer shadow-md">
          Go to Paid Courses
        </button>
      </div>
    );
  }

  const originalPrice = Number(course.price || 0);
  const finalPrice = originalPrice - discountInfo.discount;

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!inputCoupon.trim()) return;

    try {
      const codeKey = inputCoupon.trim().toUpperCase();
      const couponRef = doc(db, "coupons", codeKey);
      const docSnap = await getDoc(couponRef);

      if (docSnap.exists() && docSnap.data().active) {
        const data = docSnap.data();
        if (data.courseId === course.id || data.courseId === 'ALL_COURSES') {
          let calcDiscount = 0;
          if (data.discountType === 'percentage') {
            calcDiscount = originalPrice * (data.discountAmount / 100);
          } else {
            calcDiscount = data.discountAmount;
          }
          setDiscountInfo({ discount: calcDiscount, code: codeKey });
          return;
        }
      }
      setCouponError("ভুল অথবা মেয়াদোত্তীর্ণ কুপন কোড!");
    } catch (err) {
      setCouponError("কুপন চেক করতে সমস্যা হয়েছে!");
    }
  };

  const getMerchantNumber = (method) => {
    switch (method) {
      case 'bKash': return '01700-000000 (bKash Personal)';
      case 'Nagad': return '01800-000000 (Nagad Personal)';
      case 'Rocket': return '01900-000000-9 (Rocket Personal)';
      default: return 'Bank: City Bank, A/C: 1234567890 (Chitro)';
    }
  };

  const proceedToStep2 = (e) => {
    e.preventDefault();
    if (!studentData.agreeTerms || !studentData.agreeRefund) {
      alert("দয়া করে Terms and Refund Policy-তে সম্মতি দিন!");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    const paymentPayload = {
      uid: currentUser.uid, // 🔥 সিকিউরিটি রুলসের সাথে ম্যাচ করার জন্য ফিক্সড 'uid'
      courseId: course.id,
      courseTitle: course.title,
      studentName: studentData.fullName,
      studentEmail: currentUser.email.toLowerCase().trim(),
      studentPhone: studentData.phone,
      address: studentData.address,
      avatarUrl: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
      batch: studentData.batch,
      amount: finalPrice,
      originalPrice: originalPrice,
      appliedCoupon: discountInfo.code || null,
      paymentMethod: studentData.paymentMethod,
      senderPhone: studentData.senderPhone,
      transactionId: studentData.transactionId.toUpperCase().trim(),
      status: 'pending',
      date: new Date().toISOString()
    };

    try {
      // ১. ফায়ারবেস ডেটাবেসে পেমেন্ট ডকুমেন্ট ক্রিয়েট করা (রুল এটি শতভাগ পাস করবে)
      await addDoc(collection(db, "payments"), paymentPayload);

      // ২. সফলভাবে সেভ হওয়ার পর গুগল শিটে ডেটা পাঠানো
      const scriptURL = "https://script.google.com/macros/s/AKfycbzXOmYL6gpBTUqRmFJcrKlyHrJHMcQl276-VHyelNkqWdeWN7C8eLi2QYpoTVjEGHWWoQ/exec"; 
      
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_checkout",
          studentName: paymentPayload.studentName,
          email: paymentPayload.studentEmail,
          phone: paymentPayload.studentPhone,
          courseName: paymentPayload.courseTitle,
          amount: paymentPayload.amount,
          paymentMethod: paymentPayload.paymentMethod,
          transactionId: paymentPayload.transactionId,
          status: "Pending"
        })
      });

      setLoading(false);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert("পেমেন্ট সাবমিট করতে সমস্যা হয়েছে: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white py-12 px-4 sm:px-6 lg:px-8 select-none transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* স্টেপ প্রোগ্রেস বার */}
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-10 h-10 rounded-full font-black text-sm flex items-center justify-center relative z-10 transition-colors ${
                step >= num 
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
            </div>
          ))}
        </div>

        {/* ================= STEP 1: BILLING & COUPON ================= */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <form onSubmit={proceedToStep2} className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm transition-colors duration-300">
              <h3 className="text-xl font-black flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 text-slate-800 dark:text-white">
                <User className="w-5 h-5 text-amber-500" />
                <span>Student Enrollment Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Full Name *</label>
                  <input type="text" required placeholder="MD NAZMUL ISLAM" value={studentData.fullName} onChange={e => setStudentData({...studentData, fullName: e.target.value})} className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Mobile Number *</label>
                  <input type="tel" required placeholder="018XXXXXXXX" value={studentData.phone} onChange={e => setStudentData({...studentData, phone: e.target.value})} className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Email Address (Read Only)</label>
                  <input type="email" readOnly disabled value={studentData.email} className="w-full p-3.5 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Select Batch Schedule *</label>
                  <select value={studentData.batch} onChange={e => setStudentData({...studentData, batch: e.target.value})} className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none cursor-pointer transition-colors">
                    <option value="Batch-1 (Morning)">🌞 Batch-1 (Morning: Fri & Sat)</option>
                    <option value="Batch-2 (Evening)">🌙 Batch-2 (Evening: Fri & Sat)</option>
                    <option value="Self-Paced Recorded">🎬 Self-Paced (Only Recorded Videos)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Full Address *</label>
                <input type="text" required placeholder="Chittagong, Bangladesh" value={studentData.address} onChange={e => setStudentData({...studentData, address: e.target.value})} className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none transition-colors" />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" required checked={studentData.agreeTerms} onChange={e => setStudentData({...studentData, agreeTerms: e.target.checked})} className="w-4 h-4 accent-amber-500 rounded" />
                  <span>I agree to the <strong className="text-amber-500">Terms of Service</strong> & Privacy Policy.</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" required checked={studentData.agreeRefund} onChange={e => setStudentData({...studentData, agreeRefund: e.target.checked})} className="w-4 h-4 accent-amber-500 rounded" />
                  <span>I understand the <strong className="text-amber-500">7-Day Refund Policy</strong> guidelines.</span>
                </label>
              </div>

              <button type="submit" className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer">
                <span>Proceed To Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 h-fit space-y-6 shadow-sm transition-colors duration-300">
              <h4 className="text-base font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Selected Course Summary</h4>
              
              <div className="flex gap-4 items-center">
                <img src={course.thumbnail} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-800" />
                <div className="min-w-0">
                  <h5 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1">{course.title}</h5>
                  <span className="text-xs text-amber-500 uppercase font-extrabold">{course.category}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Have a Promo Coupon?</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. CHITRO50" value={inputCoupon} onChange={e => setInputCoupon(e.target.value.toUpperCase())} className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold uppercase text-slate-800 dark:text-white focus:outline-none focus:border-amber-500" />
                  <button type="button" onClick={handleApplyCoupon} className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-xs text-amber-500 cursor-pointer transition-colors">Apply</button>
                </div>
                {couponError && <p className="text-[11px] text-rose-500">{couponError}</p>}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Course Fee:</span>
                  <span>৳ {originalPrice.toLocaleString()}</span>
                </div>
                {discountInfo.discount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>Coupon Discount:</span>
                    <span>- ৳ {discountInfo.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-800 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Total Payable:</span>
                  <span className="text-amber-500">৳ {finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ================= STEP 2: PAYMENT VERIFICATION FORM ================= */}
        {step === 2 && (
          <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleFinalSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto space-y-6 shadow-sm transition-colors duration-300">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Select Gateway & Send Payment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Send exact amount <strong className="text-amber-500">৳{finalPrice}</strong> to complete enrollment.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['bKash', 'Nagad', 'Rocket', 'Bank'].map(method => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setStudentData({...studentData, paymentMethod: method})}
                  className={`p-3 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                    studentData.paymentMethod === method 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm' 
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-center transition-colors">
              <p className="text-xs text-slate-500 dark:text-slate-400">Please send <strong className="text-slate-800 dark:text-white">৳{finalPrice}</strong> to our official account below:</p>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono font-black text-base text-amber-500 select-all shadow-inner transition-colors">
                {getMerchantNumber(studentData.paymentMethod)}
              </div>
              <p className="text-[11px] text-slate-400">Use 'Personal Send Money' or 'Merchant Payment' option.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Sender Mobile / Account Number *</label>
                <input type="text" required placeholder="018XXXXXXXX" value={studentData.senderPhone} onChange={e => setStudentData({...studentData, senderPhone: e.target.value})} className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Transaction ID (TrxID) *</label>
                <input type="text" required placeholder="e.g. BJJ8921KLM" value={studentData.transactionId} onChange={e => setStudentData({...studentData, transactionId: e.target.value.toUpperCase()})} className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-amber-500 uppercase focus:border-amber-500 focus:outline-none transition-colors" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-2xl text-xs cursor-pointer transition-colors">
                Back
              </button>
              <button type="submit" disabled={loading} className="w-2/3 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                {loading ? "Verifying & Saving..." : "Submit Payment Record"}
              </button>
            </div>
          </motion.form>
        )}

        {/* ================= STEP 3: SUCCESS CONFIRMATION RECEIPT ================= */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto text-center space-y-6 shadow-xl transition-colors duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">Enrollment Application Submitted!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your payment record has been sent to our Admin Panel for verification.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 transition-colors">
              <div className="flex justify-between gap-4"><span className="text-slate-500">Course:</span><strong className="text-slate-800 dark:text-white text-right truncate">{course.title}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Amount Paid:</span><strong className="text-amber-500">৳{finalPrice}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">TrxID:</span><strong className="font-mono text-slate-800 dark:text-white">{studentData.transactionId}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Status:</span><span className="text-amber-500 font-bold flex items-center gap-1">⏳ Pending Approval</span></div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              💡 সাধারণত ১৫ থেকে ৩০ মিনিটের মধ্যে অ্যাডমিন আপনার পেমেন্ট অ্যাপ্রুভ করবে। অ্যাপ্রুভ হওয়ার সাথে সাথেই আপনার স্টুডেন্ট ড্যাশবোর্ডে কোর্সটি আনলক হয়ে যাবে।
            </p>

            <button onClick={() => navigate('/dashboard/student')} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/10">
              Go To Student Dashboard
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}