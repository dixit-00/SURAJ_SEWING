import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Shield, MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Feedback = () => {
  const { currentUser, dbUser } = useAuth();
  const [category, setCategory] = useState('General feedback');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!currentUser || !dbUser) return;

    setLoading(true);
    setStatus(null);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          category,
          message,
        });

      if (error) throw error;
      setStatus('success');
      setMessage('');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Transmission failed.');
    }
    setLoading(false);
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[85vh] animate-fade-up">
      <div className="bg-white dark:bg-[#111827] rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800 relative overflow-hidden isolate">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100 dark:border-blue-900/50">
            <MessageSquare size={32} className="text-blue-600 dark:text-blue-500" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Mission Control Feedback</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl font-medium">
            Encountered a bug? Need a feature documented? Submit an encrypted report directly to our core engineering matrix.
          </p>
        </div>

        {!currentUser ? (
          <div className="bg-gray-50 dark:bg-[#0B0F19]/50 border border-gray-200 dark:border-gray-700/50 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-inner">
             <Shield size={48} className="text-gray-400 dark:text-gray-600 mb-6" />
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Authentication Check Failed</h2>
             <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md font-medium">You must connect via active terminal credentials to inject feedback into the system.</p>
             <Link to="/login" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-transform hover:-translate-y-1">Connect Identity</Link>
          </div>
        ) : status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-inner">
             <CheckCircle2 size={64} className="text-green-500 mb-6 animate-bounce" />
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Transmission Confirmed</h2>
             <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md font-medium">Your telemetry report has been permanently logged and is awaiting operator review.</p>
             <button onClick={() => setStatus(null)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Submit another dispatch</button>
          </div>
        ) : (
          <form onSubmit={submitHandler} className="bg-gray-50 dark:bg-[#0B0F19]/50 border border-gray-100 dark:border-gray-800/50 rounded-[2rem] p-8 md:p-12 shadow-inner">
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 rounded-xl font-bold border border-red-100 text-sm">
                System Error: {errorMsg}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Category Classification</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-bold outline-none transition-all shadow-sm cursor-pointer appearance-none"
              >
                <option value="Bug Report">🐛 Defect / Bug Report</option>
                <option value="Feature Request">✨ Feature Logic Request</option>
                <option value="Support Info">🛡️ Hardware Support Query</option>
                <option value="General feedback">🗣️ General Observation</option>
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Encrypted Payload</label>
              <textarea 
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the anomalies, reproduction steps, or architectural suggestions..."
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-medium outline-none transition-all shadow-sm resize-none"
              ></textarea>
            </div>

            <button 
              disabled={loading || message.trim() === ''}
              className="w-full relative flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-600/30 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <><Send size={20} className="mr-2" /> Dispatch Payload</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Feedback;
