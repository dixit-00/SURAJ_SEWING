import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Package, CheckCircle, Truck, XCircle } from 'lucide-react';

const ManageOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, users(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const updateData = { status };
      if (status === 'delivered') {
        updateData.is_delivered = true;
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">Manage Orders</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Payment</th>
                <th className="p-4 font-semibold">Delivery Flow</th>
                <th className="p-4 font-semibold text-right">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-4 text-sm text-gray-500 font-mono">{order.id.substring(0, 8)}...</td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{order.users?.name || 'Guest'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 font-bold">₹{Number(order.total_price).toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    {order.is_paid ? (
                      <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded w-max"><CheckCircle size={14} className="mr-1"/> Paid</span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded w-max"><XCircle size={14} className="mr-1"/> Not Paid</span>
                    )}
                  </td>
                  <td className="p-4">
                     <span className={`flex items-center text-xs font-bold px-2 py-1 rounded w-max capitalize 
                        ${order.status === 'delivered' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 
                          order.status === 'shipped' ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' : 
                          'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {order.status === 'shipped' && <Truck size={14} className="mr-1"/>}
                        {order.status === 'delivered' && <CheckCircle size={14} className="mr-1"/>}
                        {(order.status === 'pending' || order.status === 'processing') && <Package size={14} className="mr-1"/>}
                        {order.status}
                     </span>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
