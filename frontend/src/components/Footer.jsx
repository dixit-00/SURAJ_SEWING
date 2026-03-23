import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Twitter, Facebook, Instagram, Linkedin, ArrowRight, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0A0F1C] text-white pt-20 pb-10 border-t border-gray-800 relative overflow-hidden isolate">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-[30%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-10 w-[30%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-500/30">
                 <Cpu className="text-white" size={20} />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Suraj<span className="text-blue-500 font-light">Sewing</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed font-medium mb-8 max-w-sm">
              Suraj Sewing Machine is a trusted name in sewing machine sales and service, proudly serving customers since 1970. We have built a strong reputation for quality products, reliable service, and customer satisfaction over decades.
            </p>
            <div className="flex gap-4">
               <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-sm"><Twitter size={18}/></a>
               <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-sm"><Facebook size={18}/></a>
               <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-sm"><Instagram size={18}/></a>
               <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-sm"><Linkedin size={18}/></a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-sm font-black text-gray-200 uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/home" className="text-gray-400 hover:text-blue-400 font-medium transition-colors">Home Base</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-blue-400 font-medium transition-colors">Hardware Shop</Link></li>
              <li><Link to="/shop?category=Industrial" className="text-gray-400 hover:text-blue-400 font-medium transition-colors">Enterprise Systems</Link></li>
              <li><Link to="/cart" className="text-gray-400 hover:text-blue-400 font-medium transition-colors">Cart Checkout</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-sm font-black text-gray-200 uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-blue-400 font-medium transition-colors">About the Node</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 font-medium transition-colors">Careers & Operations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 font-medium transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 font-medium transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
             <h4 className="text-sm font-black text-gray-200 uppercase tracking-widest mb-6">Stay Connected</h4>
             <p className="text-gray-400 text-sm mb-4">Subscribe for the latest hardware specs and firmware updates.</p>
             <div className="relative mb-6">
               <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-sm text-white focus:outline-none focus:border-blue-500 font-medium placeholder-gray-500" />
               <button className="absolute right-1 top-1 bottom-1 bg-blue-600 rounded-full w-10 flex items-center justify-center hover:bg-blue-500 transition shadow-md">
                 <ArrowRight size={16} />
               </button>
             </div>
             <div className="mt-6 space-y-3">
               <p className="text-gray-400 text-sm font-medium flex items-start gap-3">
                 <MapPin size={18} className="text-blue-500 mt-0.5 shrink-0" /> 
                 Opp. Khalsa Hotel, Falna, Rajasthan – 306116
               </p>
               <p className="text-gray-400 text-sm font-medium flex items-center gap-3">
                 <Phone size={18} className="text-blue-500 shrink-0" /> 
                 +91 91161 23531 <br/> +91 94145 23531
               </p>
             </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} Suraj Sewing Core. All systems verified.
          </p>
          <div className="flex gap-6">
             <span className="flex items-center gap-2 text-xs font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Systems Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
