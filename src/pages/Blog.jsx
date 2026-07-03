import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, User, Tag, ArrowRight, AlertCircle, Inbox } from 'lucide-react';
import { fetchBlogPosts } from '../services/blogService';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchBlogPosts();
        setPosts(data);
        setError(null);
      } catch (err) {
        setError("Failed to stream publications. Please verify internet connectivity.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute all unique labels across all items
  const uniqueLabels = useMemo(() => {
    const labelsSet = new Set();
    posts.forEach(post => {
      if (post.labels) post.labels.forEach(l => labelsSet.add(l));
    });
    return Array.from(labelsSet).sort();
  }, [posts]);

  // Compute filtering pipelines matrix
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLabel = selectedLabel ? post.labels.includes(selectedLabel) : true;
      return matchesSearch && matchesLabel;
    });
  }, [posts, searchQuery, selectedLabel]);

  // Handle page segmentation boundaries
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLabel]);

  const paginatedPosts = useMemo(() => {
    const offset = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(offset, offset + postsPerPage);
  }, [filteredPosts, currentPage]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">Sync Error</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-md shadow-cyan-500/10"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Helmet>
        <title>Chitro Journal | Masterclasses, Insights & Fine Arts Resources</title>
        <meta name="description" content="Explore fine arts resources, tutorial breakdowns, art academy updates, and masterclass articles from Chitro." />
      </Helmet>

      {/* Hero Banner Section */}
      <div className="relative border-b border-slate-800/60 bg-slate-900/40 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_45%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full">
            Chitro Publications
          </span>
          <h1 className="text-3xl md:text-5xl font-black mt-4 text-white tracking-tight leading-none">
            The Fine Arts <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Journal</span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Discover instructional deep dives, visual design insights, and creative news cultivated directly by our studio mentors.
          </p>
        </div>
      </div>

      {/* Controller Controls (Search & Filtering Matrix) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md">
          {/* Dynamic Search Box Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1.5/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search resource titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Filtering Badges Loop Scroll container */}
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 max-w-full scrollbar-none">
            <button
              onClick={() => setSelectedLabel("")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedLabel === "" 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-sm' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              All Topics
            </button>
            {uniqueLabels.map(label => (
              <button
                key={label}
                onClick={() => setSelectedLabel(label)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedLabel === label
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Render Loop Stream */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          /* Grid Skeleton Frame Grid Blocks */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-slate-900" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-900 rounded w-1/3" />
                  <div className="h-6 bg-slate-900 rounded w-5/6" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-900 rounded" />
                    <div className="h-3 bg-slate-900 rounded w-11/12" />
                  </div>
                  <div className="h-8 bg-slate-900 rounded w-1/4 pt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedPosts.length === 0 ? (
          /* Empty Output Search Matrix fallback */
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-16 text-center max-w-xl mx-auto">
            <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No entries matched query matrix</h3>
            <p className="text-slate-500 text-sm mt-1">Refine your search term variables or filter inputs to fetch results.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedLabel(""); }}
              className="mt-5 text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-4 py-2 rounded-xl hover:bg-cyan-950/80 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Real Data Layout Grid Output Cards */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPosts.map((post) => (
                <article 
                  key={post.id}
                  className="group bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-cyan-950/5"
                >
                  <div>
                    {/* Cover Asset Placement block */}
                    <Link to={`/blog/${post.id}`} className="block relative aspect-video bg-slate-950 overflow-hidden border-b border-slate-800/40">
                      {post.coverImage ? (
                        <img 
                          src={post.coverImage} 
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-600 p-4">
                          <span className="font-black text-4xl opacity-10 select-none">CHITRO</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider mt-2 opacity-40">Fine Arts Resource</span>
                        </div>
                      )}
                    </Link>

                    {/* Metadata Content area */}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {post.published}
                        </span>
                        <span className="flex items-center gap-1.5 truncate max-w-[120px]">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {post.author}
                        </span>
                      </div>

                      <Link to={`/blog/${post.id}`}>
                        <h2 className="text-lg font-bold text-white tracking-tight leading-snug hover:text-cyan-400 line-clamp-2 transition-colors">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="mt-3 text-slate-400 text-xs md:text-sm font-medium line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Footer Categorization Tag Row block */}
                  <div className="px-6 pb-6 pt-2 flex flex-col gap-4">
                    {post.labels && post.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Tag className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {post.labels.slice(0, 3).map((l, idx) => (
                            <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded-md">
                              {l}
                            </span>
                          ))}
                          {post.labels.length > 3 && (
                            <span className="text-[9px] text-slate-500 pl-1 font-semibold">+{post.labels.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    <Link 
                      to={`/blog/${post.id}`}
                      className="w-full text-center flex items-center justify-center gap-2 bg-slate-950 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300 hover:text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all group/btn"
                    >
                      Read Publication
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls block Footer */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2 border-t border-slate-900 pt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:hover:border-slate-800 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pageNum 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/10' 
                          : 'bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:hover:border-slate-800 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}