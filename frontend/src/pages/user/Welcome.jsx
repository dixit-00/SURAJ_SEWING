import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scissors, MapPin, Phone, Clock, Star, ShieldCheck, Wrench, Zap } from 'lucide-react';

const Welcome = () => {
  return (
    <div className="min-h-[90vh] flex flex-col items-center pb-20 pt-6 px-4 sm:px-6 animate-fade-up">

      {/* ─── Grand Hero ─── */}
      <section className="relative w-full max-w-[1200px] mx-auto rounded-[3rem] overflow-hidden bg-[#0A0F1C] shadow-2xl isolate">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-16 py-20 md:py-28">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/20">
            <Scissors size={44} className="text-blue-400" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-blue-200 text-xs font-bold uppercase tracking-widest mb-8">
            <Clock size={14} /> Serving Since 1970
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[1.1] mb-6">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Suraj Sewing Machine
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium mb-10">
            A trusted name in sewing machine sales and service, proudly serving customers since 1970 from Falna, Rajasthan. We offer a wide range of industrial and domestic sewing machines, including modern direct drive machines, along with expert repair and maintenance services.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/home"
              className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-blue-600 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]"
            >
              <span className="relative flex items-center gap-2">Explore Our Collection <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
            </Link>

            <Link
              to="/shop"
              className="group px-10 py-4 text-lg font-bold text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 backdrop-blur-sm transition-all flex items-center justify-center"
            >
              Browse Hardware
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Trust Badges ─── */}
      <section className="w-full max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {[
          { icon: <Star size={24} className="text-yellow-500" />, title: '55+ Years Legacy', desc: 'Trusted since 1970 in Rajasthan' },
          { icon: <ShieldCheck size={24} className="text-green-500" />, title: 'Quality Guaranteed', desc: 'Premium machines with warranty' },
          { icon: <Wrench size={24} className="text-blue-500" />, title: 'Expert Service', desc: 'Professional repair & maintenance' },
          { icon: <Zap size={24} className="text-purple-500" />, title: 'Modern Machines', desc: 'Direct drive & industrial models' }
        ].map((item, i) => (
          <div key={i} className="relative group bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] p-7 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all overflow-hidden cursor-default">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/15 transition-all"></div>
            <div className="bg-gray-50 dark:bg-gray-700/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* ─── Contact Strip ─── */}
      <section className="w-full max-w-[1200px] mx-auto mt-12">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-8 md:p-12 shadow-xl shadow-blue-600/20 flex flex-col md:flex-row justify-between items-center gap-8 text-white">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-2">Visit Our Store</h2>
            <p className="text-blue-100 font-medium flex items-center gap-2 flex-wrap">
              <MapPin size={18} /> Opp. Khalsa Hotel, Falna, Rajasthan – 306116
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <a href="tel:+919116123531" className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-md px-6 py-3 rounded-xl hover:bg-white/20 transition font-bold">
              <Phone size={18} /> 91161 23531
            </a>
            <a href="tel:+919414523531" className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-md px-6 py-3 rounded-xl hover:bg-white/20 transition font-bold">
              <Phone size={18} /> 94145 23531
            </a>
          </div>
        </div>
      </section>

      <div className="mt-10 text-gray-500 dark:text-gray-400 text-sm font-medium">
        Trusted by 10,000+ Tailors across India 🇮🇳
      </div>
    </div>
  );
};

export default Welcome;
