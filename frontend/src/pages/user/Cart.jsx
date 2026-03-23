import React from 'react';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cart: { cartItems }, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();

  const checkoutHandler = () => {
    navigate('/profile?redirect=checkout'); // simple redirect to login if not logged in
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-4">Your cart is empty</h2>
          <Link to="/shop" className="text-blue-600 hover:underline font-medium">Return to Shop</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product} className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center border border-gray-200 dark:border-gray-700 shadow-sm transition hover:shadow-md">
                <div className="bg-white dark:bg-gray-900 rounded-xl w-32 h-24 flex items-center justify-center overflow-hidden shrink-0 mb-4 sm:mb-0">
                  <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-contain" />
                </div>
                
                <div className="sm:ml-6 flex-1 text-center sm:text-left">
                  <Link to={`/product/${item.product}`} className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 tracking-tight">
                    {item.name}
                  </Link>
                  <div className="text-blue-600 font-bold text-lg mt-1">₹{item.price.toLocaleString('en-IN')}</div>
                </div>

                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                  <div className="relative">
                    <select
                      value={item.qty}
                      onChange={(e) => addToCart({ _id: item.product, name: item.name, images: [{url: item.image}], price: item.price, stock: item.stock }, Number(e.target.value))}
                      className="appearance-none border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 font-medium cursor-pointer"
                    >
                      {[...Array(item.stock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.product)}
                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-3 rounded-xl transition-colors shrink-0"
                  >
                    <Trash2 size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-max">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
            
            <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 text-lg">Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)}):</span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">
                ₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toLocaleString('en-IN')}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-4 text-xl font-bold text-gray-900 dark:text-white">
              <span>Subtotal:</span>
              <span>₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={checkoutHandler}
              disabled={cartItems.length === 0}
              className="w-full mt-6 bg-blue-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1 flex items-center justify-center"
            >
              Proceed to Checkout <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
