import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loader2, User, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';

const ManageUsers = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">Registered Users</h1>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                <th className="p-4 font-semibold uppercase text-sm tracking-wider">ID</th>
                <th className="p-4 font-semibold uppercase text-sm tracking-wider">Name</th>
                <th className="p-4 font-semibold uppercase text-sm tracking-wider">Email</th>
                <th className="p-4 font-semibold uppercase text-sm tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-4 text-sm text-gray-500 font-mono py-6">{u.id.substring(0, 8)}...</td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center text-blue-600 font-bold">
                       {u.name ? u.name.charAt(0).toUpperCase() : <User size={18}/>}
                    </div>
                    {u.name}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                     <span className="flex items-center"><Mail size={14} className="mr-2 text-gray-400"/> {u.email}</span>
                  </td>
                  <td className="p-4">
                    {u.role === 'admin' ? (
                       <span className="bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max shadow-sm"><ShieldCheck size={14} className="mr-1"/> Admin</span>
                    ) : (
                       <span className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max shadow-sm"><ShieldAlert size={14} className="mr-1"/> User</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="text-center py-10 text-gray-500">No users found.</div>}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
