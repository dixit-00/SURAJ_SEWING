import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreVertical,
  User,
  Smartphone,
  MessageSquare,
  Activity,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ManageService = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchTokens = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('service_tokens')
                .select('*, user:users(name, email)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTokens(data || []);
        } catch (error) {
            console.error('Error fetching service tokens:', error);
            toast.error('Failed to load service requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTokens();

        // Realtime subscription for live updates
        const subscription = supabase
            .channel('public:service_tokens')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'service_tokens' }, () => {
                fetchTokens();
            })
            .subscribe();

        return () => supabase.removeChannel(subscription);
    }, []);

    const updateStatus = async (tokenId, newStatus) => {
        try {
            const { error } = await supabase
                .from('service_tokens')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', tokenId);

            if (error) throw error;
            toast.success(`Token status updated to ${newStatus.replace('_', ' ')}`);
            fetchTokens();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredTokens = tokens.filter(token => {
        const matchesSearch = 
            token.token_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            token.machine_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            token.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || token.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={14} />;
            case 'in_progress': return <Activity size={14} className="animate-pulse" />;
            case 'resolved': return <CheckCircle2 size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-4 tracking-tight">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                            <Wrench className="w-8 h-8 text-white" />
                        </div>
                        Repair & Service Matrix
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium ml-1">Advanced control system for machine maintenance tokens</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search tokens, models..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm transition-all"
                        />
                    </div>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'in_progress', 'resolved'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all border ${
                            statusFilter === filter 
                                ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105' 
                                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700'
                        }`}
                    >
                        {filter.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Token Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 h-64 animate-pulse"></div>
                        ))
                    ) : filteredTokens.length === 0 ? (
                        <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <Search className="w-12 h-12 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-medium text-lg">No service requests matching your criteria</p>
                        </div>
                    ) : filteredTokens.map((token, i) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, delay: i * 0.05 }}
                            key={token.id}
                            className="group bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all p-7 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 text-2xl font-black text-gray-50 opacity-[0.03] dark:opacity-[0.02] select-none uppercase tracking-tighter">
                                {token.status}
                            </div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(token.status)} flex items-center gap-2`}>
                                    {getStatusIcon(token.status)}
                                    {token.status.replace('_', ' ')}
                                </div>
                                <span className="font-mono text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                    <Clock size={12} />
                                    {new Date(token.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Token Number</h3>
                                    <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{token.token_number}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Machine Model</h3>
                                    <p className="text-md font-bold text-gray-700 dark:text-gray-300">{token.machine_model}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <MessageSquare size={10} /> Issue Description
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic line-clamp-3">
                                        "{token.issue_description}"
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-8 pt-4 border-t border-gray-50 dark:border-gray-700">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {token.user?.name?.charAt(0) || <User size={16}/>}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{token.user?.name || 'Customer'}</p>
                                    <p className="text-xs text-gray-500 truncate">{token.user?.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto relative z-10">
                                {token.status === 'pending' && (
                                    <button 
                                        onClick={() => updateStatus(token.id, 'in_progress')}
                                        className="col-span-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        Start Repair <ArrowRight size={14} />
                                    </button>
                                )}
                                {token.status === 'in_progress' && (
                                    <button 
                                        onClick={() => updateStatus(token.id, 'resolved')}
                                        className="col-span-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        Mark Resolved <CheckCircle2 size={14} />
                                    </button>
                                )}
                                {token.status === 'resolved' && (
                                    <button 
                                        onClick={() => updateStatus(token.id, 'pending')}
                                        className="col-span-2 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                    >
                                        Re-open Ticket
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManageService;
