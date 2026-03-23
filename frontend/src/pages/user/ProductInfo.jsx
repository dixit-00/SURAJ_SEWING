import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowLeft, ShoppingCart, Star, Box, Check, Shield, Zap, MessageSquare } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { currentUser, dbUser } = useAuth();
  const [activeImage, setActiveImage] = useState(0);

  // Review Engine State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);

        // Fetch reviews for this product
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        setReviews(reviewData || []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');
    try {
      if (!dbUser) throw new Error('Please login first');

      // Check if already reviewed
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', id)
        .eq('user_id', dbUser.id)
        .single();

      if (existing) {
        setReviewError('Product already reviewed');
        setReviewLoading(false);
        return;
      }

      // Insert review
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          product_id: id,
          user_id: dbUser.id,
          name: dbUser.name,
          rating: Number(rating),
          comment,
        });

      if (insertError) throw insertError;

      // Fetch updated reviews
      const { data: updatedReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      setReviews(updatedReviews || []);

      // Recalculate product rating
      const totalRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;

      await supabase
        .from('products')
        .update({
          rating: Math.round(avgRating * 100) / 100,
          num_reviews: updatedReviews.length,
        })
        .eq('id', id);

      setProduct(prev => ({
        ...prev,
        rating: Math.round(avgRating * 100) / 100,
        num_reviews: updatedReviews.length,
      }));

      setComment('');
      setRating(5);
    } catch (err) {
      setReviewError(err.message);
    }
    setReviewLoading(false);
  };

  if (loading) {
     return <div className="flex justify-center items-center py-40 min-h-[60vh]"><div className="relative"><div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div><Loader2 className="animate-spin text-blue-600 relative z-10" size={64} /></div></div>;
  }

  if (!product.id) {
     return <div className="flex justify-center items-center py-40 min-h-[60vh]"><h2 className="text-2xl font-black text-gray-500">Hardware Not Found</h2></div>;
  }

  const images = product.images || [];

  return (
    <div className="py-12 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 min-h-[85vh] animate-fade-up">
      <Link to="/shop" className="group inline-flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Matrix
      </Link>

      <div className="bg-white dark:bg-[#111827] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800 overflow-hidden isolate relative">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Main Stage (Images) */}
          <div className="p-8 md:p-12 lg:pr-6 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#0B0F19]/50 relative border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
            <div className="relative w-full aspect-square rounded-[2rem] flex items-center justify-center mb-6 group cursor-crosshair">
              <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full opacity-50 transition duration-700 pointer-events-none scale-75 group-hover:scale-125"></div>
              <img 
                src={images[activeImage]?.url || 'https://via.placeholder.com/600'} 
                alt={product.name} 
                className="w-[85%] h-[85%] object-contain filter drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal transform transition-transform duration-700 group-hover:scale-110 relative z-10"
              />
            </div>

            {/* Thumbnail Navigator */}
            {images.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto p-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-full no-scrollbar">
                {images.map((img, index) => (
                  <button 
                    key={index} 
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${activeImage === index ? 'border-2 border-blue-600 shadow-md scale-105' : 'border-2 border-transparent opacity-60 hover:opacity-100 bg-white dark:bg-gray-800'}`}
                  >
                    <img src={img.url} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal p-2" alt={`${product.name} thumbnail ${index}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hardware Configuration Panel */}
          <div className="p-8 md:p-12 lg:pl-10 flex flex-col justify-center">
            
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="text-xs font-black text-white bg-gray-900 dark:bg-white dark:text-gray-900 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                {product.brand}
              </span>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-full uppercase tracking-wide">
                {product.category}
              </span>
              {product.is_industrial && (
                 <span className="flex items-center text-xs font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
                   <Zap size={12} className="mr-1" /> Enterprise Use
                 </span>
              )}
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-3 mb-8 bg-yellow-50 dark:bg-yellow-900/10 w-max px-4 py-2 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
               <div className="flex">
                 {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.round(product.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300 dark:text-gray-600'}
                  />
                ))}
               </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{product.rating}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">({product.num_reviews} Verified telemetry data points)</span>
            </div>

            <div className="mb-10 flex flex-col">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Configuration Price</span>
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tighter">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="mb-10 bg-gray-50 dark:bg-[#0B0F19]/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
               <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2"><Shield size={16} className="text-blue-500"/> Tech Specs Analysis</h3>
               <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                 {product.description}
               </p>
            </div>

            {/* Procurement Area */}
            <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-6 items-center">
              
              <div className="flex-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Procurement Qty</span>
                   {product.stock > 0 ? (
                     <span className="flex items-center text-sm font-black text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-md w-max"><Check size={14} className="mr-1"/> Ready to deploy ({product.stock})</span>
                   ) : (
                     <span className="flex items-center text-sm font-black text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md w-max"><Box size={14} className="mr-1"/> Offline / Depleted</span>
                   )}
                </div>
                
                <select 
                  value={qty} 
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="bg-gray-100 dark:bg-gray-900 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 text-lg font-bold dark:text-white cursor-pointer appearance-none text-center min-w-[80px]"
                  disabled={product.stock === 0}
                >
                  {[...Array(product.stock > 10 ? 10 : product.stock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => addToCart(product, qty)} 
                disabled={product.stock === 0}
                className={`w-full sm:w-auto px-10 py-5 rounded-2xl flex items-center justify-center text-lg font-black transition-all duration-300 shadow-lg ${product.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none dark:bg-gray-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)]'}`}
              >
                <ShoppingCart className="mr-3" size={24} /> 
                {product.stock === 0 ? 'Unavailable' : 'Deploy to Cart'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Verified Reviews Engine */}
      <div className="mt-8 bg-white dark:bg-[#111827] rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800 relative overflow-hidden isolate">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10 flex items-center">
          <MessageSquare size={28} className="mr-3 text-blue-600 dark:text-blue-500" />
          Verified Telemetry & Feedback
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* List Telemetry */}
          <div>
            {reviews.length === 0 ? (
              <div className="p-8 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 rounded-3xl font-medium border border-gray-100 dark:border-gray-800 text-center">
                No telemetry data recorded yet. Be the first to deploy an operational review.
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {reviews.map(review => (
                  <div key={review.id} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {review.name} <Check size={14} className="text-blue-500 bg-blue-100 dark:bg-blue-900/50 rounded-full p-0.5" />
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-200 dark:text-gray-700'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Composer */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Deploy New Telemetry</h3>
            {currentUser ? (
              <form onSubmit={submitReview} className="space-y-5 bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 flex-1">
                {reviewError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm rounded-xl font-bold border border-red-100 dark:border-red-900/30">
                    {reviewError}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Rating Array</label>
                  <select 
                    value={rating} 
                    onChange={e => setRating(Number(e.target.value))} 
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-medium outline-none transition-all shadow-sm cursor-pointer"
                  >
                    <option value={5}>5 - Outperforms Specifications</option>
                    <option value={4}>4 - Reliable Core Output</option>
                    <option value={3}>3 - Acceptable Standard</option>
                    <option value={2}>2 - Requires Hardware Calibration</option>
                    <option value={1}>1 - Total Systems Failure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Operational Feedback</label>
                  <textarea 
                    required 
                    rows="4" 
                    value={comment} 
                    onChange={e => setComment(e.target.value)} 
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-medium outline-none transition-all shadow-sm resize-none" 
                    placeholder="Describe the physical tolerances or motor performance metrics..."
                  ></textarea>
                </div>

                <button 
                  disabled={reviewLoading} 
                  type="submit" 
                  className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold py-4 rounded-xl transition-all flex justify-center items-center shadow-lg disabled:opacity-50 mt-4 group"
                >
                  {reviewLoading ? <Loader2 className="animate-spin" size={20} /> : <><Shield size={18} className="mr-2 text-current group-hover:scale-110 transition-transform"/> Transmit Feedback</>}
                </button>
              </form>
            ) : (
              <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center text-center flex-1">
                <Shield size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h4>
                <p className="font-medium text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-[250px]">
                  You must authenticate via the global terminal to transmit reviews into the matrix.
                </p>
                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg">
                  Access Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
