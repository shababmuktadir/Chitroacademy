import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Tag, 
  Maximize2, 
  X, 
  Sparkles, 
  Image as ImageIcon 
} from 'lucide-react';

export default function ArtworkGallery() {
  const [artworks, setArtworks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  // ফুল-স্ক্রিন ছবি দেখার জন্য মডাল স্টেট
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  useEffect(() => {
    // ফায়ারবেস থেকে রিয়েলটাইমে সব আর্টওয়ার্ক লোড করা
    const unsub = onSnapshot(collection(db, "artworks"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setArtworks(data);

      // ডাইনামিক ক্যাটাগরি লিস্ট তৈরি
      const uniqueCats = ['All', ...new Set(data.map(a => a.category).filter(Boolean))];
      setCategories(uniqueCats);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // সার্চ এবং ক্যাটাগরি ফিল্টার লজিক
  const filteredArtworks = artworks.filter(art => {
    const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch = art.title?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                          art.category?.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-950 text-cyan-400 space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black tracking-widest uppercase">Loading Art Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* ১. হিরো সেকশন */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Chitro Exclusive Exhibition
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Fine Art Portfolio Gallery
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Explore our captivating collection of handmade masterworks, oil paintings, and digital illustrations created with extreme dedication.
          </p>
        </div>

        {/* ২. সার্চ বার ও ক্যাটাগরি ট্যাব */}
        <div className="space-y-6 flex flex-col items-center">
          {/* সার্চ ইনপুট */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search artworks by title or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ক্যাটাগরি বাটন সমূহ */}
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ৩. আর্টওয়ার্ক গ্রিড (Masonry style look) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredArtworks.length > 0 ? (
              filteredArtworks.map(art => (
                <motion.div
                  key={art.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedArtwork(art)}
                  className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800/80 cursor-pointer shadow-xl aspect-[4/5]"
                >
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  
                  {/* হোভার ওভারলে */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {art.category}
                    </span>
                    <h3 className="font-extrabold text-base text-white line-clamp-1">{art.title}</h3>
                    {art.description && (
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">{art.description}</p>
                    )}
                  </div>

                  {/* জুম আইকন ব্যাজ */}
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                    <Maximize2 className="w-4 h-4 text-cyan-400" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 text-slate-400 space-y-2">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm font-bold">কোনো আর্টওয়ার্ক খুঁজে পাওয়া যায়নি!</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ================= ৪. ফুল-স্ক্রিন ছবি দেখার লাইটবক্স মডাল ================= */}
      <AnimatePresence>
        {selectedArtwork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col md:flex-row max-h-[85vh]"
            >
              {/* ক্লোজ বাটন */}
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition-colors flex items-center justify-center border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* বাম পাশে বড় ছবি */}
              <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-hidden min-h-[300px]">
                <img
                  src={selectedArtwork.imageUrl}
                  alt={selectedArtwork.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl"
                />
              </div>

              {/* ডান পাশে তথ্য */}
              <div className="w-full md:w-80 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 overflow-y-auto">
                <div className="space-y-3">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-black uppercase tracking-wider inline-block">
                    {selectedArtwork.category}
                  </span>
                  <h2 className="text-xl font-black text-white">{selectedArtwork.title}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedArtwork.description || "No specific background details provided for this artwork."}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                  Uploaded on: {selectedArtwork.createdAt ? new Date(selectedArtwork.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}