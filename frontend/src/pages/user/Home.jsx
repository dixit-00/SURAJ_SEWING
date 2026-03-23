import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import ProductCard from '../../components/ProductCard';
import { Loader2, ArrowRight, Zap, Target, ShieldCheck, Sparkles, MoveRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setProducts(data || []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-32 pb-20 pt-10">

      {/* Mega Hero Section */}
      <section className="relative w-full max-w-[1400px] mx-auto min-h-[80vh] flex items-center justify-center rounded-[3rem] overflow-hidden bg-[#0A0F1C] shadow-2xl isolate px-6 md:px-16 animate-fade-up">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div className="text-left space-y-8 animate-slide-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-blue-200 text-sm font-bold uppercase tracking-widest">
              <Sparkles size={16} className="text-blue-400" /> Next-Gen Hardware
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[1.1]">
              Engineered for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Absolute Precision.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed font-medium">
              A trusted name in sewing machine sales and service, proudly serving customers since 1970. We offer a wide range of industrial and domestic machines, including modern direct drive models, along with expert repair and maintenance. Our decades of dedication make us the preferred choice for tailors, boutiques, and garment businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={() => navigate('/shop')} className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-600 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                <span className="relative flex items-center gap-2">Explore Hardware <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
              </button>

              <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="group px-8 py-4 text-base font-bold text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 backdrop-blur-sm transition-all flex items-center justify-center">
                View Capabilities
              </button>
            </div>
          </div>

          <div className="relative hidden lg:block h-full min-h-[600px] animate-float">
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Industrial Machine" className="w-[120%] h-auto object-cover rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 rotate-[-4deg] hover:rotate-0 hover:scale-105 transition-all duration-700 ease-out z-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hardware Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">Precision Architecture.</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">Explore the flagship line of our most advanced, highly-rated models designed for extreme endurance.</p>
          </div>
          <Link to="/shop" className="group inline-flex items-center text-lg font-bold text-blue-600 hover:text-blue-700 transition">
            View the Matrix <MoveRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-40">
            <div className="relative"><div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div><Loader2 className="animate-spin text-blue-600 relative z-10" size={64} /></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Modern Bento Grid - Why Choose Us */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6">Built for the Absolute Best.</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">Our infrastructure is designed to provide unmatched reliability and customer success from checkout to production.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Bento Box 1 - spans 2 cols on md */}
          <div className="md:col-span-2 relative group rounded-[2.5rem] p-10 overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl border border-gray-800 isolate">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-600/40 transition-all duration-700"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <ShieldCheck size={32} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-3">Enterprise Durability</h3>
                <p className="text-gray-400 text-lg max-w-md">Every machine passes rigorous 50-point stress tests under peak operational loads before deployment.</p>
              </div>
            </div>
          </div>

          {/* Bento Box 2 */}
          <div className="relative group rounded-[2.5rem] p-10 overflow-hidden bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none group-hover:scale-150 transition-all duration-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shadow-inner">
              <Zap size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">High Velocity</h3>
              <p className="text-gray-500 dark:text-gray-400">Achieve maximum stitch rates with zero latency and mechanical friction.</p>
            </div>
          </div>

          {/* Bento Box 3 */}
          <div className="relative group rounded-[2.5rem] p-10 overflow-hidden bg-blue-50 dark:bg-blue-900/10 shadow-xl border border-blue-100 dark:border-blue-900/30 h-full flex flex-col justify-between">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)] group-hover:scale-110 transition-transform">
              <Target size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Laser Accuracy</h3>
              <p className="text-blue-800/70 dark:text-blue-300">Computerized needle precision to the micrometer level.</p>
            </div>
          </div>

          {/* Bento Box 4 - spans 2 cols on md */}
          <div className="md:col-span-2 relative group rounded-[2.5rem] p-10 overflow-hidden bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-indigo-900/20 shadow-xl border border-indigo-100 dark:border-indigo-800/30 isolate">
            <div className="relative z-10 h-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div className="max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg mb-6">
                  <Sparkles size={32} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">24/7 AI Terminal</h3>
                <p className="text-indigo-900/70 dark:text-indigo-200 text-lg">Harness the power of Gemini AI. Our smart agent is online 24/7 to resolve technical queries instantly.</p>
              </div>
              <button className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full font-bold shadow-md hover:shadow-xl transition">Ask Gemini Now</button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
