import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabaseClient';
import { Wrench, Settings, Search, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ServiceRequest = () => {
  const { dbUser } = useAuth();
  const [model, setModel] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [pastTokens, setPastTokens] = useState([]);

  useEffect(() => {
    if (dbUser) {
      fetchPastTokens();
    }
  }, [dbUser]);

  const fetchPastTokens = async () => {
    const { data } = await supabase
      .from('service_tokens')
      .select('*')
      .eq('user_id', dbUser.id)
      .order('created_at', { ascending: false });
    if (data) setPastTokens(data);
  };

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    if (!model.trim() || !issue.trim()) return;

    setLoading(true);
    // Note: The unique SRV-XXXXXX ID is generated via PostgreSQL Trigger! 
    const payload = {
      user_id: dbUser.id,
      machine_model: model,
      issue_description: issue,
      // token_number is omitted, it will be injected automatically by the DB
    };

    const { data, error } = await supabase
      .from('service_tokens')
      .insert([payload])
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error('Failed to create service request');
    } else {
      setGeneratedToken(data);
      setPastTokens([data, ...pastTokens]);
      setModel('');
      setIssue('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full shadow-inner mb-2">
            <Wrench size={36} className="text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Sewing Machine <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Servicing</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Facing issues with your machine? Describe the problem below to instantly generate a Service Token. Our expert technicians will review your request and get back to you!
          </p>
        </div>

        {/* Main Content Split */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Token Generation Form */}
          {!generatedToken ? (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700/50 p-8 md:p-10 animate-fade-up">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Settings className="text-blue-500" /> Report an Issue
              </h2>
              
              <form onSubmit={handleGenerateToken} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Machine Model / Brand</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g., JACK F4, Juki DDL-8700"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Problem Description</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="E.g., Thread keeps breaking, motor making strange noise, missed stitches..."
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none font-medium text-sm leading-relaxed"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading || !model.trim() || !issue.trim()}
                    className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black py-4 px-8 rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? <Loader2 size={24} className="animate-spin" /> : 'GENERATE SERVICE TOKEN'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Success Receipt Card */
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/10 rounded-[2rem] shadow-xl border border-green-200 dark:border-green-800/50 p-8 md:p-10 text-center animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                <CheckCircle size={200} className="text-green-500" />
              </div>
              <CheckCircle size={64} className="text-green-500 mx-auto mb-6 drop-shadow-md animate-bounce" />
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Token Generated!</h2>
              <p className="text-green-700 dark:text-green-400 font-medium mb-8">Your service request has been logged securely.</p>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 inline-block mx-auto text-left min-w-[250px]">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Tracking ID</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-widest">{generatedToken.token_number}</p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-4"></div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{generatedToken.machine_model}</p>
              </div>

              <button 
                onClick={() => setGeneratedToken(null)}
                className="block w-full max-w-xs mx-auto py-3 px-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition"
              >
                Log Another Issue
              </button>
            </div>
          )}

          {/* Past Tokens List */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 px-2">
              <Search className="text-blue-500" /> Your Service History
            </h3>
            
            {pastTokens.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                <Wrench size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">You haven't requested any services yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {pastTokens.map((token) => (
                  <div key={token.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700/50 group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-black tracking-widest rounded-lg mb-2">
                          {token.token_number}
                        </span>
                        <h4 className="font-bold text-gray-900 dark:text-white">{token.machine_model}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        token.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 
                        token.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30'
                      }`}>
                        {token.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {token.issue_description}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 block">
                      Logged on {new Date(token.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceRequest;
