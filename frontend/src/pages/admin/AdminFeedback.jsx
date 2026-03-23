import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loader2, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => { fetchFeedback(); }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setFeedback(data || []);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const markAsReviewed = async (id) => {
    try {
      const { error } = await supabase.from('feedback').update({ is_reviewed: true }).eq('id', id);
      if (error) throw error;
      fetchFeedback();
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="flex justify-center items-center py-40 min-h-[60vh]"><Loader2 className="animate-spin text-purple-600" size={64} /></div>;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center"><MessageSquare className="mr-3 text-purple-600" /> Telemetry Logs</h1>
        <p className="text-gray-500 font-medium mt-2">User feedback and anomaly reports.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {feedback.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-bold">No reports detected.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {feedback.map(item => (
              <div key={item.id} className={`p-8 ${item.is_reviewed ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''}`}>
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${item.category === 'Bug Report' ? 'bg-red-100 text-red-700' : item.category === 'Feature Request' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{item.category}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.name} <span className="text-gray-400 font-normal">({item.email})</span></span>
                      <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">{item.message}</p>
                  </div>
                  <div className="flex items-center lg:items-end min-w-[150px]">
                    {item.is_reviewed ? (
                      <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl"><CheckCircle size={16} className="mr-2" /> Acknowledged</span>
                    ) : (
                      <button onClick={() => markAsReviewed(item.id)} className="flex items-center text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl transition shadow-md"><AlertCircle size={16} className="mr-2" /> Mark Reviewed</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
