import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loader2, TrendingUp, ShoppingBag, Users, DollarSign, ArrowRight, Activity, Package, CircleDashed, CheckCircle2, MoreHorizontal, User as UserIcon, Eye, Wrench, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [ordersRes, productsRes, usersRes, vRes] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('users').select('*').order('created_at', { ascending: false }),
          supabase.from('visitors').select('id', { count: 'exact', head: true }).gt('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString()),
        ]);

        setOrders(ordersRes.data || []);
        setProductsCount(productsRes.count || 0);
        setUsersCount(usersRes.data?.length || 0);
        setActiveVisitors(vRes.count || 0);
        setRecentUsers((usersRes.data || []).slice(0, 5));

        // Fetch Recent Admin Notifications
        const { data: notes } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setAdminNotifications(notes || []);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchAdminData();

    // Real-time notifications subscription
    const channel = supabase
      .channel(`admin-notes-${currentUser.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${currentUser.id}`
      }, (payload) => {
        setAdminNotifications(prev => [payload.new, ...prev].slice(0, 5));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  if (loading) {
     return <div className="flex justify-center items-center py-40 min-h-[60vh]"><div className="relative"><div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div><Loader2 className="animate-spin text-blue-600 relative z-10" size={64} /></div></div>;
  }

  const totalRevenue = orders.reduce((acc, order) => acc + (order.is_paid ? Number(order.total_price) : 0), 0);
  const totalOrders = orders.length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="py-6 max-w-[1400px] mx-auto min-h-[85vh] px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-2 bg-blue-600 rounded-full"></div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Enterprise Console</h1>
            {activeVisitors > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full animate-pulse border border-green-100 dark:border-green-800">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {activeVisitors} LIVE
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium ml-11">Advanced telemetry and infrastructure controls for Suraj Sewing.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:shadow-md transition">
            Sync Data
          </button>
          <button onClick={() => navigate('/admin/products')} className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Package size={16} /> New Product
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <div className="relative group bg-white dark:bg-gray-800/80 backdrop-blur-3xl rounded-[2rem] p-7 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all overflow-hidden cursor-default">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6"><div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/30 p-3.5 rounded-2xl"><DollarSign className="text-blue-600 dark:text-blue-400" size={24} /></div></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Gross Revenue</p>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</h3>
        </div>

        <div className="relative group bg-white dark:bg-gray-800/80 backdrop-blur-3xl rounded-[2rem] p-7 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-purple-500/30 transition-all overflow-hidden cursor-default">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6"><div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/30 p-3.5 rounded-2xl"><ShoppingBag className="text-purple-600 dark:text-purple-400" size={24} /></div></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Orders</p>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{totalOrders.toLocaleString()}</h3>
        </div>

        <div className="relative group bg-white dark:bg-gray-800/80 backdrop-blur-3xl rounded-[2rem] p-7 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all overflow-hidden cursor-default">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full group-hover:bg-orange-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6"><div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/30 p-3.5 rounded-2xl"><Package className="text-orange-600 dark:text-orange-400" size={24} /></div></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Catalog Size</p>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{productsCount.toLocaleString()}</h3>
        </div>

        <div className="relative group bg-white dark:bg-gray-800/80 backdrop-blur-3xl rounded-[2rem] p-7 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-pink-500/30 transition-all overflow-hidden cursor-default">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/10 blur-3xl rounded-full group-hover:bg-pink-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6"><div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/50 dark:to-pink-800/30 p-3.5 rounded-2xl"><Users className="text-pink-600 dark:text-pink-400" size={24} /></div></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Registered Users</p>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{usersCount.toLocaleString()}</h3>
        </div>
      </div>

      {/* Lower Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3"><CircleDashed className="text-blue-500" /> Recent Transactions</h2>
               <Link to="/admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full transition">View All <ArrowRight size={16} className="ml-1" /></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700 tracking-wider">
                    <th className="pb-4 pl-2">Order ID</th><th className="pb-4">Date</th><th className="pb-4">Amount</th><th className="pb-4">Payment</th><th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors group">
                      <td className="py-5 pl-2"><span className="font-mono text-sm text-gray-600 dark:text-gray-300 font-medium">{order.id.substring(0, 10)}...</span></td>
                      <td className="py-5 text-sm text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-5 text-sm font-bold text-gray-900 dark:text-white">₹{Number(order.total_price).toLocaleString('en-IN')}</td>
                      <td className="py-5">{order.is_paid ? (<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 size={12} className="mr-1"/> Paid</span>) : (<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">Unpaid</span>)}</td>
                      <td className="py-5">{order.is_delivered ? (<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800">Delivered</span>) : (<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-100 dark:border-orange-800">{order.status}</span>)}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-gray-500">No recent orders found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users className="text-pink-500" size={20} /> Latest Users</h2>
               <Link to="/admin/users" className="text-xs font-bold text-pink-600 hover:text-pink-800 transition">View Directory</Link>
            </div>
            <div className="space-y-4">
              {recentUsers.map(user => (
                <div key={user.id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-750/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center text-blue-600 font-bold shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name || 'Anonymous User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (<span className="shrink-0 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Admin</span>)}
                </div>
              ))}
              {recentUsers.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No users found.</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mb-8">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Bell className="text-orange-500" size={20} /> Infrastructure Alerts</h2>
               <div className="h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
            </div>
            <div className="space-y-4">
              {adminNotifications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4 italic">System nominal. No active alerts.</p>
              ) : adminNotifications.map(note => (
                <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-750/30 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-500/30 transition-all cursor-default group">
                   <div className="flex justify-between items-start mb-1">
                     <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{note.title}</p>
                     <p className="text-[10px] text-gray-400 font-medium">{new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                   <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{note.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity className="text-blue-400" size={20}/> Directory Hub</h3>
             <div className="space-y-4 relative z-10">
               <button onClick={() => navigate('/admin/products')} className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/5 rounded-2xl transition backdrop-blur-md group"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/20 rounded-lg text-blue-300"><Package size={18}/></div><span className="font-medium text-sm">Product Matrix</span></div><MoreHorizontal size={18} className="text-gray-400 group-hover:text-white transition" /></button>
               <button onClick={() => navigate('/admin/orders')} className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/5 rounded-2xl transition backdrop-blur-md group"><div className="flex items-center gap-3"><div className="p-2 bg-purple-500/20 rounded-lg text-purple-300"><ShoppingBag size={18}/></div><span className="font-medium text-sm">Order Fulfillment</span></div><MoreHorizontal size={18} className="text-gray-400 group-hover:text-white transition" /></button>
               <button onClick={() => navigate('/admin/feedback')} className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/5 rounded-2xl transition backdrop-blur-md group"><div className="flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-lg text-green-300"><Activity size={18}/></div><span className="font-medium text-sm">Telemetry & Feedback</span></div><MoreHorizontal size={18} className="text-gray-400 group-hover:text-white transition" /></button>
               <button onClick={() => navigate('/admin/tracking')} className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/5 rounded-2xl transition backdrop-blur-md group"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-300"><Eye size={18}/></div><span className="font-medium text-sm">Visitor Analytics</span></div><MoreHorizontal size={18} className="text-gray-400 group-hover:text-white transition" /></button>
               <button onClick={() => navigate('/admin/service')} className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/5 rounded-2xl transition backdrop-blur-md group"><div className="flex items-center gap-3"><div className="p-2 bg-red-500/20 rounded-lg text-red-300"><Wrench size={18}/></div><span className="font-medium text-sm">Service Requests</span></div><MoreHorizontal size={18} className="text-gray-400 group-hover:text-white transition" /></button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
