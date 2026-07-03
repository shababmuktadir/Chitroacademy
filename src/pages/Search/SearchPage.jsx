import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchEverything } from '../../services/searchService';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const data = await searchEverything(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-slate-800 dark:text-white">
        Search Results for: <span className="text-amber-500">"{query}"</span>
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          <p className="text-lg text-slate-500 dark:text-slate-400">No matching courses, artworks, or blogs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <span className="uppercase text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-full mb-3 inline-block">
                {item.type}
              </span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{item.description}</p>
              <Link
                to={`/${item.type}/${item.id}`}
                className="text-sm font-semibold text-amber-500 hover:underline"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}