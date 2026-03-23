import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabaseClient';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Loader2, Package, CheckCircle, Clock, Heart } from 'lucide-react';
import ProductCard from '../../components/ProductCard';

const Profile = () => {
  const { currentUser, dbUser, googleSignIn, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const redirect = new URLSearchParams(location.search).get('redirect');

  useEffect(() => {
    if (currentUser && redirect === 'checkout') {
      navigate('/checkout');
    }
  }, [currentUser, redirect, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !dbUser) return;
      setLoading(true);
      try {
        // Fetch user's orders from Supabase
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', dbUser.id)
          .order('created_at', { ascending: false });

        setOrders(ordersData || []);

        // Fetch wishlist products
        if (dbUser.wishlist && dbUser.wishlist.length > 0) {
          const { data: wishlistData } = await supabase
            .from('products')
            .select('*')
            .in('id', dbUser.wishlist);
          
          setWishlistProducts(wishlistData || []);
        } else {
          setWishlistProducts([]);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchData();
  }, [currentUser, dbUser?.wishlist?.length]);

  const handleGoogleLogin = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error(error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Sign in to track orders and manage your cart.</p>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Profile Sidebar */}
      <div className="md:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <img 
            src={currentUser.photoURL || 'https://via.placeholder.com/150'} 
            alt="User" 
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-50 dark:border-gray-700" 
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{dbUser?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{dbUser?.email}</p>
          <button 
            onClick={logout}
            className="w-full py-2 border border-red-500 text-red-500 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-10 shadow-sm border border-gray-100 dark:border-gray-700">
          
          {/* Tabs */}
          <div className="flex space-x-6 border-b border-gray-100 dark:border-gray-700 mb-8 pb-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`pb-2 px-1 font-bold text-lg flex items-center transition-colors ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Package size={20} className="mr-2" /> My Orders
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              className={`pb-2 px-1 font-bold text-lg flex items-center transition-colors ${activeTab === 'wishlist' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Heart size={20} className="mr-2" /> Wishlist
            </button>
          </div>
          
          {loading ? (
             <div className="flex justify-center items-center py-10"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
          ) : activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                No orders found. <Link to="/shop" className="text-blue-600 font-medium hover:underline">Start shopping</Link>.
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gray-50 dark:bg-gray-900/50 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Order ID: {order.id}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-4 md:mt-0 text-left md:text-right">
                        <p className="text-xl font-bold text-blue-600">₹{order.total_price?.toLocaleString('en-IN')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {order.is_paid ? <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded"><CheckCircle size={12} className="mr-1"/> Paid</span> : <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded"><Clock size={12} className="mr-1"/> Unpaid</span>}
                          {order.is_delivered ? <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded"><CheckCircle size={12} className="mr-1"/> Delivered</span> : <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded"><Clock size={12} className="mr-1"/> {order.status}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {(order.order_items || []).map((item, index) => (
                        <div key={index} className="flex-shrink-0 relative group">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700" title={item.name} />
                          <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            wishlistProducts.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                Your wishlist is empty. <Link to="/shop" className="text-blue-600 font-medium hover:underline">Explore machines</Link>.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {wishlistProducts.map(product => (
                  <ProductCard key={product.id} product={product} viewType="grid" />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
