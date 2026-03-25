import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShoppingCart, 
  MousePointer2, 
  Clock, 
  Eye, 
  Trash2, 
  PlusCircle,
  TrendingUp,
  Activity,
  Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const VisitorTracking = () => {
    const [visitors, setVisitors] = useState([]);
    const [cartEvents, setCartEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalVisitors: 0,
        activeNow: 0,
        totalAddEvents: 0,
        totalRemoveEvents: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch visitors
            const { data: vData, error: visitorError } = await supabase
                .from('visitors')
                .select('*, user:users(id, name, email)')
                .order('last_active', { ascending: false })
                .limit(50);

            if (visitorError) throw visitorError;

            // 2. Fetch latest activity for each visitor
            const visitorsWithActivity = await Promise.all(vData.map(async (v) => {
                const { data: activity } = await supabase
                    .from('cart_events')
                    .select('*')
                    .eq('visitor_id', v.visitor_id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                
                return { ...v, lastActivity: activity };
            }));

            setVisitors(visitorsWithActivity);

            // 3. Fetch cart events list
            const { data: eventData, error: eventError } = await supabase
                .from('cart_events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (eventError) throw eventError;
            setCartEvents(eventData);

            // 4. Calculate stats
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const [activeRes, totalRes, addRes, removeRes] = await Promise.all([
                supabase.from('visitors').select('*', { count: 'exact', head: true }).gt('last_active', fiveMinutesAgo),
                supabase.from('visitors').select('*', { count: 'exact', head: true }),
                supabase.from('cart_events').select('*', { count: 'exact', head: true }).eq('action', 'add'),
                supabase.from('cart_events').select('*', { count: 'exact', head: true }).eq('action', 'remove')
            ]);

            setStats({
                totalVisitors: totalRes.count || 0,
                activeNow: activeRes.count || 0,
                totalAddEvents: addRes.count || 0,
                totalRemoveEvents: removeRes.count || 0
            });

        } catch (error) {
            console.error('Error fetching tracking data:', error);
            toast.error('Failed to load tracking data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Realtime subscription
        const visitorSubscription = supabase
            .channel('public:visitors')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'visitors' }, () => {
                fetchData();
            })
            .subscribe();

        const cartSubscription = supabase
            .channel('public:cart_events')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cart_events' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(visitorSubscription);
            supabase.removeChannel(cartSubscription);
        };
    }, []);

    const sendOutreachEmail = async (visitor) => {
        if (!visitor.user?.email) return;
        
        const productName = visitor.lastActivity?.product_name || 'our latest collection';
        const title = `Special Update on ${productName} - Suraj Sewing Machine`;
        const message = `Hello ${visitor.user.name}, we noticed you were interested in ${productName}. We're here to help if you have any questions or would like to learn more about its professional features. Have a great day!`;

        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: visitor.user.id,
                    type: 'system',
                    title: title,
                    message: message
                });

            if (error) throw error;
            toast.success(`Email notification sent to ${visitor.user.name}!`);
        } catch (error) {
            console.error('Error sending outreach email:', error);
            toast.error('Failed to send email notification');
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isRecentlyActive = (lastActive) => {
        const last = new Date(lastActive).getTime();
        const now = Date.now();
        return (now - last) < 5 * 60 * 1000;
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Activity className="w-8 h-8 text-blue-500" />
                        Visitor Tracking & Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time monitoring of user activity and shopping trends</p>
                </div>
                <button 
                    onClick={fetchData}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-medium"
                >
                    <Clock className="w-4 h-4" />
                    Refresh Data
                </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Live Visitors', value: stats.activeNow, icon: Eye, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Total Visitors', value: stats.totalVisitors, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Items Added', value: stats.totalAddEvents, icon: PlusCircle, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    { label: 'Items Removed', value: stats.totalRemoveEvents, icon: Trash2, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                ].map((stat, i) => (
                    <div key={stat.label} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Users className="w-5 h-5 text-blue-500" />
                            Recent Visitors
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Latest Action</th>
                                    <th className="px-6 py-4 font-semibold">Last Active</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                                ) : visitors.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No visitor data yet</td></tr>
                                ) : visitors.map((visitor) => (
                                    <tr key={visitor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{visitor.user?.name || 'Anonymous User'}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[150px]">{visitor.user?.email || visitor.visitor_id.slice(0, 8) + '...'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {visitor.lastActivity ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`p-1 rounded ${visitor.lastActivity.action === 'add' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {visitor.lastActivity.action === 'add' ? <PlusCircle size={12} /> : <Trash2 size={12} />}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{visitor.lastActivity.product_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Browsing</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatTime(visitor.last_active)}</td>
                                        <td className="px-6 py-4 flex items-center justify-between gap-4">
                                            {isRecentlyActive(visitor.last_active) ? (
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-gray-400">Offline</span>
                                            )}
                                            {visitor.user?.email && (
                                                <button onClick={() => sendOutreachEmail(visitor)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title={`Send website email to ${visitor.user.name}`}>
                                                    <Mail size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <ShoppingCart className="w-5 h-5 text-indigo-500" />
                            Live Cart Activity
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {loading ? (
                            <p className="text-center text-gray-400 py-8">Loading...</p>
                        ) : cartEvents.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">No cart activity recorded</div>
                        ) : (
                            cartEvents.map((event) => (
                                <div key={event.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                                    <div className={`p-2 rounded-lg ${event.action === 'add' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {event.action === 'add' ? <PlusCircle className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{event.product_name}</p>
                                        <p className="text-xs text-gray-500 uppercase">{event.action === 'add' ? 'Added to cart' : 'Removed from cart'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">{formatTime(event.created_at)}</p>
                                        <p className="text-[10px] text-gray-300 font-mono">V: {event.visitor_id.slice(0, 6)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitorTracking;
