import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, ShieldCheck, Truck, RefreshCw, Plus, Minus, Check, ArrowLeft, Sparkles, ThumbsUp, ThumbsDown, MinusCircle } from 'lucide-react';
import axios from 'axios';
import { useGetProductDetailsQuery } from '../redux/api/productApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Mock reviews for demo
  const mockReviews = [
    "Absolutely love this product! The quality is amazing and it arrived early.",
    "It's decent, but a bit overpriced for what you get.",
    "Broke after two days of use. Very disappointed.",
    "The battery life is incredible. Exceeded my expectations.",
    "Customer service was rude when I asked a question, but the item itself is okay."
  ];

  const handleSummarizeReviews = async () => {
    setIsSummarizing(true);
    try {
      const res = await axios.post('http://localhost:5000/api/ai/summarize-reviews', { reviews: mockReviews });
      setAiSummary(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to summarize reviews');
    } finally {
      setIsSummarizing(false);
    }
  };

  const { data: product, isLoading, error } = useGetProductDetailsQuery(id);
  const { cartItems } = useSelector((state) => state.cart);
  const inCart = product ? cartItems.find((x) => x._id === product._id) : null;

  const discount = product?.compareAtPrice > product?.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      qty,
      category: product.category,
    }));
    setAddedToCart(true);
    toast.success('Added to cart!', { icon: '🛒' });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      qty,
      category: product.category,
    }));
    navigate('/checkout');
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-6xl mb-4">😕</div>
      <p className="text-red-500 text-lg mb-4">Product not found</p>
      <button onClick={() => navigate('/products')} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold">
        Back to Products
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-primary-600 transition-colors">Products</button>
          <span>/</span>
          <span className="text-gray-900 dark:text-white truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ─── Image Gallery ─── */}
          <div>
            <motion.div
              key={activeImg}
              initial={{ opacity: 0.5, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="aspect-square rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 mb-4 relative"
            >
              {product.images?.[activeImg]?.url ? (
                <img src={product.images[activeImg].url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🛍️</div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {discount}% OFF
                </div>
              )}
            </motion.div>

            {product.images?.length > 1 && (
              <div className="flex space-x-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-500 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Info ─── */}
          <div className="flex flex-col">

            {/* Category + Wishlist */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
                {product.category?.name || 'General'}
              </span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border-2 transition-all ${isWishlisted ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-red-300'}`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
              </motion.button>
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-3 mb-5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-5 h-5 ${star <= Math.round(product.ratings) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
              </div>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{product.ratings}</span>
              <span className="text-gray-400">({product.numOfReviews} reviews)</span>
              <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {product.stock > 0 ? '● In Stock' : '● Out of Stock'}
              </span>
            </div>

            {/* Price Box */}
            <div className="flex items-end space-x-3 mb-6 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">Price</p>
                <span className="text-4xl font-black text-gray-900 dark:text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </div>
              {product.compareAtPrice > product.price && (
                <div className="mb-1">
                  <p className="text-xs text-gray-400 line-through">MRP ₹{product.compareAtPrice.toLocaleString('en-IN')}</p>
                  <span className="text-sm font-bold text-emerald-600">You save ₹{(product.compareAtPrice - product.price).toLocaleString('en-IN')} ({discount}% off)</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{product.description}</p>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full capitalize">#{tag}</span>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</span>
                <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg text-gray-900 dark:text-white">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">{product.stock} available</span>
              </div>
            )}

            {/* CTA Buttons */}
            {product.stock > 0 ? (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg ${addedToCart
                    ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                    : 'bg-white dark:bg-gray-800 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`}
                >
                  {addedToCart ? (
                    <><Check className="w-5 h-5" /><span>Added to Cart!</span></>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" /><span>Add to Cart</span></>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuyNow}
                  className="flex-1 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/30 transition-all"
                >
                  <span>⚡ Buy Now</span>
                </motion.button>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 text-center">
                <p className="text-red-600 dark:text-red-400 font-semibold">Currently Out of Stock</p>
                <p className="text-sm text-red-500 mt-1">Notify me when available</p>
              </div>
            )}

            {/* View Cart button if in cart */}
            {inCart && (
              <button
                onClick={() => navigate('/cart')}
                className="w-full py-2.5 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors mb-4"
              >
                🛒 View Cart ({cartItems.reduce((a, b) => a + b.qty, 0)} items)
              </button>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
              {[
                { icon: <Truck className="w-5 h-5" />, title: 'Free Delivery', desc: 'On orders ₹499+' },
                { icon: <RefreshCw className="w-5 h-5" />, title: '30-Day Returns', desc: 'Easy & free' },
                { icon: <ShieldCheck className="w-5 h-5" />, title: '100% Genuine', desc: 'Verified products' },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="flex justify-center text-primary-600 dark:text-primary-400 mb-1">{item.icon}</div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Reviews & AI Summarization ─── */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold dark:text-white mb-6">Customer Reviews</h2>
          
          <div className="glass p-6 rounded-3xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={80} className="text-primary-500" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold dark:text-white flex items-center mb-2">
                  <Sparkles className="mr-2 text-primary-500" size={20} />
                  AI Review Summarizer
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Too many reviews to read? Let our AI condense them into the most important Pros and Cons instantly.
                </p>
                <button
                  onClick={handleSummarizeReviews}
                  disabled={isSummarizing}
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50"
                >
                  {isSummarizing ? 'Analyzing Reviews...' : 'Generate AI Summary'}
                </button>
              </div>

              {aiSummary && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-white/50 dark:bg-dark-bg/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 w-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-500">Summary</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      aiSummary.sentiment.toLowerCase() === 'positive' ? 'bg-green-100 text-green-700' :
                      aiSummary.sentiment.toLowerCase() === 'negative' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {aiSummary.sentiment} Sentiment
                    </span>
                  </div>
                  <p className="text-sm dark:text-gray-300 mb-4">{aiSummary.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-green-500 flex items-center mb-2"><ThumbsUp size={14} className="mr-1" /> Pros</h4>
                      <ul className="text-xs dark:text-gray-400 space-y-1 list-disc pl-4">
                        {aiSummary.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-500 flex items-center mb-2"><ThumbsDown size={14} className="mr-1" /> Cons</h4>
                      <ul className="text-xs dark:text-gray-400 space-y-1 list-disc pl-4">
                        {aiSummary.cons.map((con, i) => <li key={i}>{con}</li>)}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {mockReviews.map((rev, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex text-amber-400 mb-2">
                  <Star size={14} className="fill-current" /><Star size={14} className="fill-current" /><Star size={14} className="fill-current" /><Star size={14} className="fill-current" />
                </div>
                <p className="text-sm dark:text-gray-300">{rev}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
