import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
  const { cart, dispatch, clearCart } = useCart();
  const { dbUser, currentUser } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(
    cart.shippingAddress || { street: '', city: '', state: '', zipCode: '', country: 'India' }
  );
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setOrderPlaced(true);
      clearCart();
    }
    if (query.get('canceled')) {
      alert("Payment was canceled. You can try again.");
    }
  }, []);

  const total = cart.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!dbUser) {
      alert('Please login first');
      return;
    }
    setLoading(true);

    dispatch({ type: 'CART_SAVE_SHIPPING_ADDRESS', payload: shippingAddress });
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));

    try {
      // Create order in Supabase
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: dbUser.id,
          order_items: cart.cartItems,
          shipping_address: shippingAddress,
          payment_method: 'Card',
          total_price: total,
          is_paid: false,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Create Stripe checkout session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: cart.cartItems,
          orderId: order.id,
          returnUrl: window.location.origin + '/checkout',
        }
      });

      if (sessionError) throw sessionError;

      if (sessionData?.url) {
        window.location.href = sessionData.url;
      } else {
        throw new Error('No checkout URL returned: ' + JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error(error);
      alert('Order Creation failed: ' + error.message);
    }
    setLoading(false);
  };

  if (orderPlaced) {
    return (
      <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6 animate-bounce" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Your order has been created and you will be contacted for payment and delivery details.</p>
          <button 
            onClick={() => navigate('/profile')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        
        <form onSubmit={handleCreateOrder} className="space-y-6 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address</label>
            <input 
              required
              type="text" 
              value={shippingAddress.street} 
              onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
               <input 
                 required
                 type="text" 
                 value={shippingAddress.city} 
                 onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                 className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white transition"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
               <input 
                 required
                 type="text" 
                 value={shippingAddress.state} 
                 onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                 className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white transition"
               />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zip Code</label>
               <input 
                 required
                 type="text" 
                 value={shippingAddress.zipCode} 
                 onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                 className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white transition"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
               <input 
                 required
                 type="text" 
                 value={shippingAddress.country} 
                 onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                 className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white transition"
               />
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Amount</p>
              <div className="text-2xl font-black text-gray-900 dark:text-white">₹{total.toLocaleString('en-IN')}</div>
              <p className="text-xs text-gray-400 mt-1">💳 Payment will be collected securely via Stripe</p>
            </div>
            <button 
              type="submit" 
              disabled={loading || cart.cartItems.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center group cursor-pointer"
            >
              {loading && <Loader2 className="animate-spin mr-2" size={20}/>}
              <ShieldCheck className="mr-2" size={20} /> Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
