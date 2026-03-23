import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (currentUser === undefined) {
    return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
