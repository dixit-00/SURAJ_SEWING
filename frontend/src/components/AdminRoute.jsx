import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { currentUser, dbUser } = useAuth();

  // If auth is still checking
  if (currentUser === undefined || dbUser === undefined) {
    return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  if (currentUser && dbUser && (dbUser.role?.trim().toLowerCase() === 'admin' || dbUser.email === 'malviyadixit92@gmail.com')) {
    return children;
  }

  return <Navigate to="/home" />;
};

export default AdminRoute;
