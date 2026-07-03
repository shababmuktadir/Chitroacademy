import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { 
  Calendar, User, Tag, ChevronLeft, ArrowLeft, ArrowRight,
  Share2, Link2, MessageSquare, Layers, 
  BookOpen, Sparkles, AlertCircle 
} from 'lucide-react';
import { fetchPostById } from '../services/blogService';

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [readingProgress, setReadingProgress] = useState(0);
  const [toc, setToc] = useState([]);
  const [copied, setCopied] = useState(false);
  
  const contentRef = useRef(null);

  // Core Data loading stream pipeline
  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        const resolved = await fetchPostById(id);
        setData(resolved);
        setError(null);
      } catch (err) {
        setError("The publication could not be localized. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id]);

  // Compute Reading Progress bar ratios
  useEffect(() => {
    const computeProgress = () => {
      if (!contentRef.current) return;
      const element = contentRef.current;
      const totalHeight = element.clientHeight - window.innerHeight;
      const scrolled = window.scrollY - element.offsetTop;
      if (totalHeight <= 0) {
        setReadingProgress(0);
        return;
      }
      const progress = (scrolled / totalHeight) * 100;
      setReadingProgress(Math.min(Math.max(progress, 0), 100));
    };

    window.addEventListener('scroll', computeProgress);
    return () => window.removeEventListener('scroll', computeProgress);
  }, [data]);

  // Generate Table of Contents from rendered DOM content
  useEffect(() => {
    if (!data || !contentRef.current) return;
    
    const headings = contentRef.current.querySelectorAll('h2, h3');
    const tocTree = Array.from(headings).map((heading, index) => {
      const cleanId = `heading-node-target-${index}`;
      heading.id = cleanId;
      return {
        id: cleanId,
        text: heading.innerText || heading.textContent,
        level: heading.tagName.toLowerCase()
      };
    });
    setToc(tocTree);
  }, [data]);

  // Compute clean related nodes metrics matrices
  const relatedPosts = React.useMemo(() => {
    if (!data) return [];
    const { post, allPosts } = data;
    if (!post.labels || post.labels.length === 0) return allPosts.filter(p => p.id !== post.id).slice(0, 3);
    
    return allPosts
      .filter(p => p.id !== post.id)
      .map(p => {
        const matches = p.labels ? p.labels.filter(l => post.labels.includes(l)).length : 0;
        return { ...p, matches };
      })
      .filter(p => p.matches > 0)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 3);
  }, [data]);

  // Compute sibling navigational reference pointer configurations
  const navigationPointers = React.useMemo(() => {
    if (!data) return { prev: null, next: null };
    const { post, allPosts } = data;
    const activeIndex = allPosts.findIndex(p => p.id === post.id);
    return {
      prev: activeIndex < allPosts.length - 1 ? allPosts[activeIndex + 1] : null,
      next: activeIndex > 0 ? allPosts[activeIndex - 1] : null
    };
  }, [data]);

  // Clipboard copy routing utility
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-400">
        <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase font-bold tracking-widest text-slate-500 animate-pulse">Streaming Article Nodes...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">Sync Broken</h2>
          <p className="text-slate-400 text-sm mb-6">{error || "Failed to parse publication asset."}</p>
          <button 
            onClick={() => navigate('/blog')} 
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-xl transition-all text-sm"
          >
            Return to Index
          </button>
        </div>
      </div>
    );
  }

  const { post } = data;
  
  const cleanHtmlContent = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 
      'img', 'blockquote', 'span', 'a', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
  });

  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(post.title);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 antialiased">
      <Helmet>
        <title>{`${post.title} | Chitro Journal`}</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.coverImage && <meta property="og:image" content={post.coverImage} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Synchronized Absolute Progress Bar header track */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-900 z-50">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-75"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Structural Post header element block */}
      <header className="relative bg-slate-900/30 border-b border-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Journal Index
          </Link>

          {/* Label Pills row */}
          {post.labels && post.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.labels.map((l, i) => (
                <span key={i} className="bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {l}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Author Meta Row */}
          <div className="flex flex-wrap items-center gap-6 mt-6 border-t border-slate-900 pt-6 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2.5">
              {post.authorAvatar ? (
                <img src={post.authorAvatar} alt={post.author} className="w-6 h-6 rounded-full border border-slate-800" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                  C
                </div>
              )}
              <span className="text-slate-200 font-semibold">{post.author}</span>
            </div>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              {post.published}
            </span>
          </div>
        </div>
      </header>

      {/* Primary Structural split-view grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: Table of Contents & Social Shares sidebar element */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-12 h-fit">
            {/* Table of Contents node cluster tracking block */}
            {toc.length > 0 && (
              <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-cyan-500" />
                  Outline
                </h3>
                <nav className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                  {toc.map((item, i) => (
                    <a 
                      key={i} 
                      href={`#${item.id}`}
                      className={`block text-xs font-medium leading-normal transition-colors ${
                        item.level === 'h3' 
                          ? 'pl-3 text-slate-500 border-l border-slate-800 hover:text-slate-300' 
                          : 'text-slate-400 hover:text-cyan-400'
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Social Sharing Router Block */}
            <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-blue-500" />
                Share Document
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {/* Custom Inline SVG for Facebook */}
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-blue-500 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                  </svg>
                  Facebook
                </a>
                <a 
                  href={`https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  WhatsApp
                </a>
                {/* Custom Inline SVG for X (Twitter) */}
                <a 
                  href={`https://twitter.com/intent/tweet?text=${pageTitle}&url=${pageUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-slate-200 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X App
                </a>
                <button 
                  onClick={copyLinkToClipboard}
                  className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                >
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Full Main Image Render Payload & Typography text area content */}
          <main className="col-span-1 lg:col-span-9 max-w-3xl mx-auto w-full">
            {post.coverImage && (
              <div className="aspect-video bg-slate-955 rounded-2xl overflow-hidden border border-slate-900 mb-10 shadow-2xl">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Content box template parsing */}
            <div 
              ref={contentRef}
              dangerouslySetInnerHTML={{ __html: cleanHtmlContent }}
              className="prose prose-invert max-w-none prose-sm md:prose-base
                prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight prose-headings:scroll-mt-6
                prose-h2:text-xl md:prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-900 prose-h2:pb-2 prose-h2:mt-10
                prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-6
                prose-p:text-slate-300 prose-p:leading-relaxed prose-p:font-medium prose-p:mb-5
                prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-slate-900/30 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-400 prose-blockquote:font-medium
                prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-li:text-slate-300 prose-li:mb-1.5
                prose-img:rounded-2xl prose-img:border prose-img:border-slate-900 prose-img:my-8 prose-img:mx-auto
                prose-table:w-full prose-table:text-xs md:prose-table:text-sm prose-th:bg-slate-900 prose-th:p-2.5 prose-th:text-white prose-td:p-2.5 prose-td:border-b prose-td:border-slate-900
              "
            />

            {/* Mobile Adaptive Social Sharing component view block */}
            <div className="lg:hidden mt-12 pt-6 border-t border-slate-900 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">Share:</span>
              <button onClick={copyLinkToClipboard} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" /> {copied ? "Copied" : "Copy Link"}
              </button>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`} target="_blank" rel="noopener noreferrer" className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-slate-400 flex items-center gap-1 text-xs font-semibold">
                <svg className="w-3.5 h-3.5 text-blue-500 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
                Facebook
              </a>
            </div>

            {/* Sibling Navigational Blocks context mapping section */}
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 pt-8 border-t border-slate-900">
              {navigationPointers.prev ? (
                <Link 
                  to={`/blog/${navigationPointers.prev.id}`}
                  className="group bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-5 rounded-2xl flex flex-col items-start gap-1 text-left transition-all"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Previous Entry
                  </span>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 line-clamp-1 transition-colors">
                    {navigationPointers.prev.title}
                  </span>
                </Link>
              ) : <div className="hidden md:block" />}
              
              {navigationPointers.next ? (
                <Link 
                  to={`/blog/${navigationPointers.next.id}`}
                  className="group bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-5 rounded-2xl flex flex-col items-end gap-1 text-right transition-all"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    Next Entry <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 line-clamp-1 transition-colors">
                    {navigationPointers.next.title}
                  </span>
                </Link>
              ) : <div className="hidden md:block" />}
            </nav>
          </main>
        </div>
      </div>

      {/* Segment block: Related items cluster feed block list */}
      {relatedPosts.length > 0 && (
        <section className="bg-slate-900/20 border-t border-slate-900 py-16 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-black tracking-tight text-white mb-8 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Related Publications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map(rPost => (
                <Link 
                  key={rPost.id}
                  to={`/blog/${rPost.id}`}
                  className="group bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 p-4 rounded-2xl block transition-all"
                >
                  <div className="aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-900 mb-4">
                    {rPost.coverImage ? (
                      <img src={rPost.coverImage} alt={rPost.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-700 bg-slate-900 uppercase tracking-widest">No Image</div>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">
                    {rPost.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium block mt-2">{rPost.published}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER CALL-TO-ACTION ELEMENT BANNER BLOCK */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(6,182,212,0.05),transparent_60%)]" />
          <div className="relative z-10 max-w-xl mx-auto">
            <BookOpen className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Join Chitro Academy
            </h2>
            <p className="mt-2 text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
              Learn Fine Arts from experienced mentors through structured masterclasses.
            </p>
            <div className="mt-6">
              <Link 
                to="/courses"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all uppercase tracking-wider"
              >
                Explore Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}