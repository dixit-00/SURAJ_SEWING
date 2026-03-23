import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../config/supabaseClient';
import ProductCard from '../../components/ProductCard';
import { Loader2, Search, Filter, Grid3X3, List } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const useQuery = () => new URLSearchParams(useLocation().search);

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');

  const query = useQuery();
  const navigate = useNavigate();
  const keywordParam = query.get('keyword') || '';
  const categoryParam = query.get('category') || '';

  const [searchTerm, setSearchTerm] = useState(keywordParam);
  const [category, setCategory] = useState(categoryParam);

  const pageSize = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const currentPage = Number(query.get('pageNumber')) || 1;
      const currentSearch = query.get('keyword') || '';
      const currentCategory = query.get('category') || '';

      // Build Supabase query
      let q = supabase.from('products').select('*', { count: 'exact' });

      if (currentSearch) {
        q = q.ilike('name', `%${currentSearch}%`);
      }
      if (currentCategory) {
        q = q.eq('category', currentCategory);
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await q
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setProducts(data || []);
      setPages(Math.ceil((count || 0) / pageSize));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [page, searchTerm, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== keywordParam) {
        navigate(searchTerm ? `/shop?keyword=${searchTerm}` : '/shop');
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, navigate, keywordParam]);

  const categories = ['Domestic', 'Industrial', 'Computerized', 'Overlock'];

  return (
    <div className="py-12 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 min-h-[85vh]">
      
      {/* Premium Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-center bg-gray-900 dark:bg-black rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden isolate animate-fade-up">
        <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[150%] bg-blue-600/30 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="relative z-10 w-full md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">The Machine Matrix.</h1>
          <p className="text-lg text-gray-400 font-medium max-w-lg">Discover precision-engineered sewing hardware built to redefine your entire workflow.</p>
        </div>
        
        {/* Advanced Control Panel within Header */}
        <div className="relative z-10 w-full md:w-[45%] flex flex-col gap-4">
           <div className="relative group">
             <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
             <div className="relative bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-full border border-white/20 p-2 flex items-center pr-4 shadow-xl">
               <div className="p-2.5 bg-white/20 rounded-full text-white mx-1"><Search size={18} /></div>
               <input
                 type="text"
                 placeholder="Search by model or feature..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-transparent border-none text-white placeholder-gray-300 focus:ring-0 px-3 outline-none font-medium"
               />
             </div>
           </div>

           <div className="flex gap-4">
              <div className="relative w-full group">
                 <div className="absolute inset-x-0 bottom-0 top-0 bg-purple-500 rounded-full blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
                 <div className="relative bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-full border border-white/20 flex items-center shadow-lg">
                   <div className="pl-5 text-gray-300"><Filter size={18} /></div>
                   <select
                     value={category}
                     onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                     className="w-full bg-transparent border-none py-4 px-4 text-white hover:text-gray-200 focus:ring-0 outline-none font-bold appearance-none cursor-pointer"
                   >
                     <option value="" className="text-gray-900">All Categories</option>
                     {categories.map((cat) => (
                       <option key={cat} value={cat} className="text-gray-900 font-semibold">{cat}</option>
                     ))}
                   </select>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
         <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">
           {loading ? 'Scanning DB...' : `Displaying ${products.length} active models`}
         </p>
         <div className="hidden md:flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition ${view === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><Grid3X3 size={20}/></button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><List size={20}/></button>
         </div>
      </div>

      {/* Product Grid Area */}
      {loading ? (
        <div className="flex justify-center items-center py-40 min-h-[50vh]">
           <div className="relative"><div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse"></div><Loader2 className="animate-spin text-blue-600 relative z-10" size={64} /></div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
           <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-6 shadow-inner">
             <Search size={40} />
           </div>
           <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Zero Matches Found</h3>
           <p className="text-gray-500 dark:text-gray-400 max-w-md text-center">We couldn't locate any hardware matching these exact specifications. Please adjust your telemetry filters.</p>
           <button onClick={() => {setSearchTerm(''); setCategory('');}} className="mt-8 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-full hover:scale-105 transition shadow-lg">Reset Matrix</button>
        </div>
      ) : (
        <div className="animate-fade-up animation-delay-200">
          <div className={`grid gap-8 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-5xl mx-auto'}`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} viewType={view} />
            ))}
          </div>

          {/* Premium Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-20">
              {[...Array(pages).keys()].map((x) => (
                <button
                  key={x + 1}
                  onClick={() => { setPage(x + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl font-bold transition-all duration-300 ${
                    x + 1 === page
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] scale-110'
                      : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {x + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Shop;
