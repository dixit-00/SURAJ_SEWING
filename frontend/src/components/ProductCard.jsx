import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Star, Eye, Heart } from 'lucide-react';

const ProductCard = ({ product, viewType = 'grid' }) => {
  const { addToCart } = useCart();
  const { dbUser, toggleWishlist } = useAuth();
  const navigate = useNavigate();

  const isLiked = dbUser?.wishlist?.includes(product.id);
  const images = product.images || [];

  if (viewType === 'list') {
    return (
      <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800/80 backdrop-blur-3xl rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 group h-full hover:-translate-y-1">
        <div className="w-full md:w-1/3 relative overflow-hidden bg-gray-50 dark:bg-gray-900/50 p-6 flex items-center justify-center">
           <img src={images[0]?.url || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal" />
        </div>
        <div className="p-8 flex flex-col justify-center flex-1">
          <div className="flex justify-between items-start mb-4 relative">
            <div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">{product.brand}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight hover:text-blue-600 transition-colors cursor-pointer pr-12" onClick={() => navigate(`/product/${product.id}`)}>
                {product.name}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 ${isLiked ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500'}`}
              >
                <Heart size={20} className={isLiked ? "fill-current" : ""} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center mb-3 space-x-1">
            <div className="flex text-yellow-500">
              <Star size={14} className="fill-current" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">{product.rating}</span>
            <span className="text-xs text-gray-400 font-medium">({product.num_reviews} active reviews)</span>
          </div>

          <p className="text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 text-sm leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-4 mt-auto">
             <button onClick={() => navigate(`/product/${product.id}`)} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"><Eye size={18}/> View Specs</button>
             <button onClick={() => addToCart(product, 1)} disabled={product.stock === 0} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><ShoppingCart size={18}/> Add to Cart</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full hover:-translate-y-2 isolate">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:via-indigo-500/5 group-hover:to-purple-500/10 transition-colors duration-700 -z-10"></div>
      
      <Link to={`/product/${product.id}`} className="block relative h-64 w-full bg-gray-50/50 dark:bg-[#0B0F19]/50 overflow-hidden flex items-center justify-center p-6 mt-2">
        <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none scale-50 group-hover:scale-150"></div>
        <img src={images[0]?.url || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-full object-contain filter drop-shadow-2xl transform transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-4 mix-blend-multiply dark:mix-blend-normal relative z-10" />
        
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {product.stock === 0 && (
            <div className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">Out of Stock</div>
          )}
          {product.is_industrial && (
            <div className="bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg border border-gray-700 dark:border-gray-200">Industrial Class</div>
          )}
        </div>
      </Link>

      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
        className={`absolute top-4 right-4 z-30 p-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 ${isLiked ? 'bg-red-500 text-white' : 'bg-white/80 dark:bg-gray-900/80 text-gray-400 hover:text-red-500'}`}
      >
        <Heart size={18} className={isLiked ? "fill-current" : ""} />
      </button>

      <div className="p-6 flex flex-col flex-grow relative z-10 bg-white/50 dark:bg-[#111827]/50 backdrop-blur-md border-t border-gray-50 dark:border-gray-800/50">
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{product.brand}</p>
        
        <Link to={`/product/${product.id}`} className="mb-2 block">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight hover:text-blue-600 transition-colors line-clamp-2">{product.name}</h3>
        </Link>
        
        <div className="flex items-center mb-6 space-x-1">
          <div className="flex text-yellow-500"><Star size={14} className="fill-current" /></div>
          <span className="text-xs font-bold text-gray-900 dark:text-white">{product.rating}</span>
          <span className="text-xs text-gray-400 font-medium">({product.num_reviews} active reviews)</span>
        </div>

        <div className="mt-auto flex justify-between items-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Unit Price</p>
            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">₹{product.price?.toLocaleString('en-IN')}</span>
          </div>
          
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock === 0}
            className={`w-12 h-12 rounded-2xl transition-all duration-300 flex justify-center items-center shadow-lg group-hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)] ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 shadow-none'
                : 'bg-gray-900 hover:bg-blue-600 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-blue-500 dark:hover:text-white hover:scale-110 hover:-rotate-6'
            }`}
          >
            <ShoppingCart size={20} className={product.stock === 0 ? '' : 'transform transition-transform group-hover:scale-110'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
