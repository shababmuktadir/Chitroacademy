// src/pages/Courses/FreeCourses.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function FreeCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null); // যে ভিডিওটি প্লে হচ্ছে তা ট্র্যাক করবে

  useEffect(() => {
    const fetchFreeCourses = async () => {
      try {
        const coursesRef = collection(db, 'courses'); 
        const q = query(coursesRef, where('type', '==', 'free'));
        
        const querySnapshot = await getDocs(q);
        const fetchedCourses = [];
        
        querySnapshot.forEach((doc) => {
          fetchedCourses.push({ id: doc.id, ...doc.data() });
        });
        
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching free courses: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreeCourses();
  }, []);

  // ইউটিউব ইউআরএল থেকে ভিডিও আইডি (Video ID) বের করার ফাংশন
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return <div className="text-center p-10 text-xl dark:text-white">Loading Free Courses...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 text-center">ফ্রি কোর্সসমূহ</h1>

      {/* ⚡ ভিডিও প্লেয়ার মডাল (যখন কোনো ভিডিওতে ক্লিক করা হবে) */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 z-[1100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl border border-slate-800 relative">
            
            {/* মডাল বন্ধ করার বাটন */}
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* ভিডিও কন্টেইনার এস্পেক্ট রেশিও ১৬:৯ */}
            <div className="aspect-video w-full bg-black">
              {activeVideo.videoSource === 'youtube' ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.videoUrl)}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                /* ক্লাউডিনারি বা ডিরেক্ট ভিডিওর জন্য HTML5 প্লেয়ার (সব কন্ট্রোলসহ) */
                <video 
                  className="w-full h-full" 
                  src={activeVideo.videoUrl} 
                  controls 
                  autoPlay 
                  controlsList="nodownload" // ডাউনলোড অপশন বন্ধ করার জন্য (ঐচ্ছিক)
                />
              )}
            </div>

            {/* ভিডিওর তথ্য */}
            <div className="p-5 text-white">
              <span className="text-xs font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                {activeVideo.category}
              </span>
              <h2 className="text-xl font-bold mt-2">{activeVideo.title}</h2>
              <p className="text-slate-400 text-sm mt-1">{activeVideo.description || "এই কোর্সের কোনো বিবরণ নেই।"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ কোর্সের গ্রিড লিস্ট */}
      {courses.length === 0 ? (
        <p className="text-center text-slate-500">কোনো ফ্রি কোর্স পাওয়া যায়নি।</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col">
              <div className="relative group cursor-pointer" onClick={() => setActiveVideo(course)}>
                <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                {/* হোভার করলে প্লে বাটন দেখাবে */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white border border-white/40">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md self-start mb-2">
                  {course.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{course.description || "No description available."}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">Free</span>
                  <button 
                    onClick={() => setActiveVideo(course)}
                    className="bg-[#7393B3] hover:bg-[#537393] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Watch Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}