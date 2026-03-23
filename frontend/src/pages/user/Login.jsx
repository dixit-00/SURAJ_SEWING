import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const { currentUser, dbUser, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/home';

  useEffect(() => {
    if (currentUser && dbUser) {
      if (dbUser.email === 'malviyadixit92@gmail.com' || dbUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirect === '/home' ? '/home' : `/${redirect}`);
      }
    }
  }, [currentUser, dbUser, navigate, redirect]);

  const handleGoogleLogin = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error(error);
    }
  };

  if (currentUser === undefined) {
     return <div className="flex justify-center items-center py-32"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-100 dark:border-gray-700 mt-[-5%] transition-all">
        <div className="w-16 h-16 bg-blue-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
           <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-8 h-8 -rotate-3" />
        </div>
        
        <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight">Sign In</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Authenticate to access Suraj Sewing Machine catalog.</p>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold py-4 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
