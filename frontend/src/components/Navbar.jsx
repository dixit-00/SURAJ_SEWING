import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, User, LogOut, Menu, X, Settings, 
  ChevronDown, Cpu, Heart, MessageSquare, Bell,
  Home, Package, Wrench, ShieldCheck
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { currentUser, dbUser, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/home', icon: <Home size={18} /> },
    { name: 'Shop Machines', path: '/shop', icon: <Package size={18} /> },
    { name: 'Repair Service', path: '/service', icon: <Wrench size={18} /> },
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${scrolled ? 'py-2 px-4' : 'py-4'}`}>
      <nav className={`mx-auto max-w-7xl transition-all duration-500 overflow-visible ${scrolled ? 'rounded-[2rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 border border-white/20 dark:border-gray-800/50' : 'bg-transparent'}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-shrink-0 flex items-center gap-3 group cursor-pointer"
              onClick={() => navigate('/home')}
            >
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                 <Cpu className="text-white" size={20} />
                 <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                  SURAJ<span className="text-blue-600">SEWING</span>
                </h1>
                <div className="flex items-center gap-1 opacity-60">
                  <ShieldCheck size={10} className="text-blue-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Certified Partner</span>
                </div>
              </div>
            </motion.div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex flex-1 justify-center px-4">
              <div className="flex items-center bg-gray-200/40 dark:bg-gray-800/40 p-1 rounded-full backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link 
                      key={link.name} 
                      to={link.path} 
                      className={`relative px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {isActive && (
                        <motion.span 
                          layoutId="nav_bubble"
                          className="absolute inset-0 bg-gray-900 dark:bg-blue-600 rounded-full shadow-lg -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        ></motion.span>
                      )}
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Actions Section (Desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              {currentUser && (
                <>
                  <Link to="/profile" className="p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-all relative group">
                    <Heart size={20} />
                    {dbUser?.wishlist?.length > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 scale-110 group-hover:scale-125 transition-transform">
                        {dbUser.wishlist.length}
                      </span>
                    )}
                  </Link>

                  <div className="relative">
                    <button 
                      onClick={() => { setIsNotifOpen(!isNotifOpen); setDropdownOpen(false); }}
                      className={`p-2.5 rounded-full transition-all relative group ${isNotifOpen ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-4 w-4 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 scale-110 group-hover:scale-125 transition-transform">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {isNotifOpen && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-blue-50/30 dark:bg-blue-950/20">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">Recent Updates</span>
                            <button onClick={markAllAsRead} className="text-[10px] font-bold text-blue-600 hover:underline">Clear All</button>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-gray-400 text-sm italic">Nothing new to see here</div>
                            ) : (
                              notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-default ${!n.is_read ? 'border-l-4 border-l-blue-600' : ''}`}>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{n.title}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{n.message}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              <Link to="/cart" className="p-2.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-all relative group">
                <ShoppingCart size={20} />
                {cart.cartItems.length > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 scale-110 group-hover:scale-125 transition-transform">
                    {cart.cartItems.reduce((a, c) => a + Number(c.qty), 0)}
                  </span>
                )}
              </Link>

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

              {currentUser ? (
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500/20">
                      <img src={currentUser.photoURL || 'https://via.placeholder.com/40'} className="w-full h-full object-cover" alt="user" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden lg:inline">{dbUser?.name?.split(' ')[0] || 'Member'}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-3 w-60 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 p-2"
                      >
                        <div className="p-3 mb-1 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Authenticated</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{dbUser?.name || currentUser.displayName || 'Suraj Member'}</p>
                        </div>
                        <Link to="/profile" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">
                          <Settings size={18} className="text-blue-500" /> Account Dashboard
                        </Link>
                        {dbUser?.role === 'admin' && (
                          <Link to="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/30 text-sm font-bold text-purple-600 transition-colors">
                            <Cpu size={18} /> Enterprise Console
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/30 text-sm font-bold text-red-600 transition-colors">
                          <LogOut size={18} /> Disconnect Session
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full text-sm font-black shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="flex md:hidden items-center gap-3">
              <Link to="/cart" className="relative p-2 text-gray-700 dark:text-gray-200">
                <ShoppingCart size={22} />
                {cart.cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-blue-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                    {cart.cartItems.reduce((a, c) => a + Number(c.qty), 0)}
                  </span>
                )}
              </Link>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-100 dark:border-gray-800 overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl rounded-b-[2rem]"
            >
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      to={link.path} 
                      className={`flex items-center gap-4 p-4 rounded-2xl text-base font-black transition-all ${location.pathname === link.path ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400'}`}
                    >
                      {link.icon} {link.name}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800 my-4"></div>

                {currentUser ? (
                  <div className="space-y-2">
                    <Link to="/profile" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 font-bold">
                      <User size={18} /> My Profile
                    </Link>
                    {dbUser?.role === 'admin' && (
                      <Link to="/admin/dashboard" className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 font-bold">
                        <Settings size={18} /> Enterprise Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 font-bold">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="block w-full text-center py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-lg">
                    Get Started
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};

export default Navbar;

