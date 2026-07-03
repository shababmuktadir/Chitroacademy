import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Image as ImageIcon, 
  CheckCircle2, 
  Ticket, 
  ArrowRight, 
  Lock, 
  AlertCircle 
} from 'lucide-react';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course || null;

  // স্টেপ কন্ট্রোলার: 1 = Billing & Coupon, 2 = Payment Submit, 3 = Success Screen[cite: 2]
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // ফর্মের ডেটা স্টেট[cite: 2]
  const [studentData, setStudentData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: '',
    batch: 'Batch-1 (Morning)',
    paymentMethod: 'bKash',
    senderPhone: '',
    transactionId: '',
    agreeTerms: false,
    agreeRefund: false
  });

  // কুপন ভ্যালিডেশন স্টেট[cite: 2]
  const [inputCoupon, setInputCoupon] = useState('');
  const [discountInfo, setDiscountInfo] = useState({ discount: 0, code: '' });
  const [couponError, setCouponError] = useState('');

  // যদি কোর্স ডেটা না থাকে (সরাসরি ইউআরএল ভিজিট করলে)[cite: 2]
  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-white space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 animate-bounce" />
        <h2 className="text-2xl font-bold">কোনো কোর্স সিলেক্ট করা হয়নি!</h2>
        <p className="text-slate-400 text-sm">দয়া করে কোর্স লিস্ট পেজ থেকে আপনার পছন্দের কোর্সটি বেছে নিন。</p>
        <button onClick={() => navigate('/courses/paid')} className="px-6 py-3 bg-cyan-500 rounded-xl font-bold text-sm cursor-pointer">
          Go to Paid Courses
        </button>
      </div>
    );
  }

  // মূল প্রাইস ও ডিসকাউন্ট হিসাব[cite: 2]
  const originalPrice = Number(course.price || 0);
  const finalPrice = originalPrice - discountInfo.discount;

  // কুপন ভ্যালিডেট করার লজিক[cite: 2]
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
          alert(`🎉 কুপন সফল! আপনি ৳${calcDiscount} ছাড় পেয়েছেন।`);
          return;
        }
      }
      setCouponError("ভুল অথবা মেয়াদোত্তীর্ণ কুপন কোড!");
    } catch (err) {
      setCouponError("কুপন চেক করতে সমস্যা হয়েছে!");
    }
  };

  // পেমেন্ট মেথড অনুযায়ী অ্যাডমিনের নাম্বার[cite: 2]
  const getMerchantNumber = (method) => {
    switch (method) {
      case 'bKash': return '01700-000000 (bKash Personal / Merchant)';
      case 'Nagad': return '01800-000000 (Nagad Personal)';
      case 'Rocket': return '01900-000000-9 (Rocket Personal)';
      default: return 'Bank: City Bank, A/C: 1234567890 (Chitro Art Platform)';
    }
  };

  // স্টেপ ১ থেকে স্টেপ ২-এ যাওয়া[cite: 2]
  const proceedToStep2 = (e) => {
    e.preventDefault();
    if (!studentData.agreeTerms || !studentData.agreeRefund) {
      alert("দয়া করে Terms and Refund Policy-তে সম্মতি দিন!");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ডেটাবেসে পেমেন্ট ও এনরোলমেন্ট সাবমিট করা[cite: 2]
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ১. ফায়ারবেসের 'payments' কালেকশনে রেকর্ড জমা দেওয়া (অ্যাডমিন প্যানেলের সাথে সিঙ্ক)[cite: 2]
      await addDoc(collection(db, "payments"), {
        courseId: course.id,
        courseTitle: course.title,
        studentName: studentData.fullName,
        studentEmail: studentData.email.toLowerCase().trim(),
        studentPhone: studentData.phone,
        address: studentData.address,
        avatarUrl: studentData.avatarUrl || 'https://via.placeholder.com/150',
        batch: studentData.batch,
        amount: finalPrice,
        originalPrice: originalPrice,
        appliedCoupon: discountInfo.code || null,
        paymentMethod: studentData.paymentMethod,
        senderPhone: studentData.senderPhone,
        transactionId: studentData.transactionId.toUpperCase().trim(),
        status: 'pending', // অ্যাডমিন ভেরিফাই না করা পর্যন্ত 'pending' থাকবে[cite: 2]
        date: new Date().toISOString()
      });

      // ২. Google Sheet-এ ডেটা পাঠানো (Automated Checkouts)
      const scriptURL = "https://script.google.com/macros/s/AKfycbzXOmYL6gpBTUqRmFJcrKlyHrJHMcQl276-VHyelNkqWdeWN7C8eLi2QYpoTVjEGHWWoQ/exec"; 
      
      // Google Apps Script এ POST রিকোয়েস্ট পাঠানো হচ্ছে
      await fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify({
          action: "save_checkout",
          studentName: studentData.fullName,
          email: studentData.email.toLowerCase().trim(),
          phone: studentData.phone,
          courseName: course.title,
          amount: finalPrice,
          paymentMethod: studentData.paymentMethod,
          transactionId: studentData.transactionId.toUpperCase().trim(),
          status: "Pending"
        })
      });

      setLoading(false);
      setStep(3); // সাকসেস পেজে নিয়ে যাওয়া[cite: 2]
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert("পেমেন্ট সাবমিট করতে সমস্যা হয়েছে: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* স্টেপ প্রোগ্রেস বার[cite: 2] */}
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -z-0"></div>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-10 h-10 rounded-full font-black text-sm flex items-center justify-center relative z-10 transition-colors ${
                step >= num ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30' : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
            </div>
          ))}
        </div>

        {/* ================= STEP 1: BILLING & COUPON ================= */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* বাম পাশে: স্টুডেন্ট তথ্য ফর্ম[cite: 2] */}
            <form onSubmit={proceedToStep2} className="lg:col-span-2 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
              <h3 className="text-xl font-black flex items-center gap-2 border-b border-slate-800 pb-4">
                <User className="w-5 h-5 text-cyan-400" />
                <span>Student Enrollment Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Full Name *</label>
                  <input type="text" required placeholder="MD NAZMUL ISLAM" value={studentData.fullName} onChange={e => setStudentData({...studentData, fullName: e.target.value})} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-cyan-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Mobile Number *</label>
                  <input type="tel" required placeholder="018XXXXXXXX" value={studentData.phone} onChange={e => setStudentData({...studentData, phone: e.target.value})} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-cyan-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Email Address *</label>
                  <input type="email" required placeholder="nazmul@gmail.com" value={studentData.email} onChange={e => setStudentData({...studentData, email: e.target.value})} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-cyan-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Select Batch Schedule *</label>
                  <select value={studentData.batch} onChange={e => setStudentData({...studentData, batch: e.target.value})} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-cyan-500 focus:outline-none cursor-pointer">
                    <option value="Batch-1 (Morning)">🌞 Batch-1 (Morning: Fri & Sat)</option>
                    <option value="Batch-2 (Evening)">🌙 Batch-2 (Evening: Fri & Sat)</option>
                    <option value="Self-Paced Recorded">🎬 Self-Paced (Only Recorded Videos)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Full Address *</label>
                <input type="text" required placeholder="Chittagong, Bangladesh" value={studentData.address} onChange={e => setStudentData({...studentData, address: e.target.value})} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-cyan-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Profile Avatar / Photo URL (Optional)</label>
                <input type="url" placeholder="https://..." value={studentData.avatarUrl} onChange={e => setStudentData({...studentData, avatarUrl: e.target.value})} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:border-cyan-500 focus:outline-none" />
              </div>

              {/* পলিসি ও সম্মতি চেকবাক্স[cite: 2] */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" required checked={studentData.agreeTerms} onChange={e => setStudentData({...studentData, agreeTerms: e.target.checked})} className="w-4 h-4 accent-cyan-500 rounded" />
                  <span>I agree to the <strong className="text-cyan-400">Terms of Service</strong> & Privacy Policy.</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" required checked={studentData.agreeRefund} onChange={e => setStudentData({...studentData, agreeRefund: e.target.checked})} className="w-4 h-4 accent-cyan-500 rounded" />
                  <span>I understand the <strong className="text-cyan-400">7-Day Refund Policy</strong> guidelines.</span>
                </label>
              </div>

              <button type="submit" className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer">
                <span>Proceed To Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* ডান পাশে: অর্ডার সামারি ও কুপন[cite: 2] */}
            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 h-fit space-y-6">
              <h4 className="text-base font-black text-white border-b border-slate-800 pb-3">Selected Course Summary</h4>
              
              <div className="flex gap-4 items-center">
                <img src={course.thumbnail} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-800" />
                <div>
                  <h5 className="font-bold text-sm text-white line-clamp-1">{course.title}</h5>
                  <span className="text-xs text-cyan-400 uppercase font-extrabold">{course.category}</span>
                </div>
              </div>

              {/* কুপন ইনপুট[cite: 2] */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Have a Promo Coupon?</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. CHITRO50" value={inputCoupon} onChange={e => setInputCoupon(e.target.value.toUpperCase())} className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold uppercase text-white focus:outline-none" />
                  <button type="button" onClick={handleApplyCoupon} className="px-4 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-xs text-cyan-400 cursor-pointer">Apply</button>
                </div>
                {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
              </div>

              {/* প্রাইস হিসাব[cite: 2] */}
              <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Course Fee:</span>
                  <span>৳ {originalPrice.toLocaleString()}</span>
                </div>
                {discountInfo.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Coupon Discount ({discountInfo.code}):</span>
                    <span>- ৳ {discountInfo.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total Payable:</span>
                  <span className="text-cyan-400">৳ {finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ================= STEP 2: PAYMENT VERIFICATION FORM ================= */}
        {step === 2 && (
          <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleFinalSubmit} className="bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-800 max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white">Select Gateway & Send Payment</h3>
              <p className="text-xs text-slate-400">Send exact amount <strong className="text-cyan-400">৳{finalPrice}</strong> to complete enrollment.</p>
            </div>

            {/* পেমেন্ট মেথড সিলেক্ট বাটন[cite: 2] */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['bKash', 'Nagad', 'Rocket', 'Bank'].map(method => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setStudentData({...studentData, paymentMethod: method})}
                  className={`p-3 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                    studentData.paymentMethod === method ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* মার্চেন্ট পেমেন্ট ইন্সট্রাকশন বক্স[cite: 2] */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-center">
              <p className="text-xs text-slate-400">Please send <strong className="text-white">৳{finalPrice}</strong> to our official number below:</p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono font-black text-base text-cyan-400 select-all">
                {getMerchantNumber(studentData.paymentMethod)}
              </div>
              <p className="text-[11px] text-slate-500">Use 'Personal Send Money' or 'Merchant Payment' option.</p>
            </div>

            {/* ট্রানজ্যাকশন আইডি ও সেন্ডার নাম্বার ইনপুট[cite: 2] */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Sender Mobile / Account Number *</label>
                <input type="text" required placeholder="018XXXXXXXX (যে নাম্বার থেকে টাকা পাঠিয়েছেন)" value={studentData.senderPhone} onChange={e => setStudentData({...studentData, senderPhone: e.target.value})} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-cyan-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Transaction ID (TrxID) *</label>
                <input type="text" required placeholder="e.g. BJJ8921KLM" value={studentData.transactionId} onChange={e => setStudentData({...studentData, transactionId: e.target.value.toUpperCase()})} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-cyan-400 uppercase focus:border-cyan-500 focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs cursor-pointer">
                Back
              </button>
              <button type="submit" disabled={loading} className="w-2/3 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                {loading ? "Verifying & Saving..." : "Submit Payment Record"}
              </button>
            </div>
          </motion.form>
        )}

        {/* ================= STEP 3: SUCCESS CONFIRMATION RECEIPT ================= */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-800 max-w-xl mx-auto text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Enrollment Application Submitted!</h3>
              <p className="text-xs text-slate-400">Your payment record has been sent to our Admin Panel for verification.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Course:</span><strong className="text-white">{course.title}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Amount Paid:</span><strong className="text-cyan-400">৳{finalPrice}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">TrxID:</span><strong className="font-mono text-white">{studentData.transactionId}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Status:</span><span className="text-amber-400 font-bold animate-pulse">⏳ Pending Approval</span></div>
            </div>

            <p className="text-[11px] text-slate-500">
              💡 সাধারণত ১৫ থেকে ৩০ মিনিটের মধ্যে অ্যাডমিন আপনার পেমেন্ট অ্যাপ্রুভ করবে। অ্যাপ্রুভ হওয়ার সাথে সাথেই আপনার স্টুডেন্ট ড্যাশবোর্ডে কোর্সটি আনলক হয়ে যাবে।
            </p>

            <button onClick={() => navigate('/dashboard/student')} className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-cyan-500/20">
              Go To Student Dashboard
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}