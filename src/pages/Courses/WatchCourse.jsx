import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Video, ExternalLink, Tag, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WatchCourse() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(!course);

  useEffect(() => {
    if (!course && id) {
      const fetchCourse = async () => {
        const cRef = doc(db, "courses", id);
        const cSnap = await getDoc(cRef);
        if (cSnap.exists()) {
          setCourse({ id: cSnap.id, ...cSnap.data() });
        }
        setLoading(false);
      };
      fetchCourse();
    }
  }, [id, course]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <h2 className="text-xl font-bold">কোর্সটি খুঁজে পাওয়া যায়নি!</h2>
        <button onClick={() => navigate('/dashboard/student')} className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ভিডিও এম্বেড ইউআরএল তৈরি করা (ইউটিউব লিংক হলে)
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(course.videoUrl);

  return (
    <div className="min-h-screen bg-slate-900 text-white select-none pb-12">
      {/* টপ বার */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => navigate('/dashboard/student')}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            {course.category}
          </span>
        </div>
      </div>

      {/* প্লেয়ার সেকশন */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        <div className="aspect-video w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={course.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="text-center p-8 space-y-4 max-w-md">
              <Video className="w-16 h-16 text-amber-500 mx-auto animate-pulse" />
              <h3 className="font-bold text-lg">Live Workshop Session</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                এই কোর্সের ভিডিও বা লাইভ সেশনের লিংক এখনো আপডেট করা হয়নি। নির্ধারিত সময়ে লিংকে প্রবেশ করতে নিচের বাটনে ক্লিক করুন।
              </p>
              {course.videoUrl && (
                <a
                  href={course.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
                >
                  <span>Open Workshop Meeting Link</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* কোর্সের বিস্তারিত তথ্য */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-4">
            <h1 className="text-xl sm:text-2xl font-black text-white">{course.title}</h1>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> Lifetime Access Active
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Masterclass Description</h4>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {course.description || "No specific instructions provided for this class."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}