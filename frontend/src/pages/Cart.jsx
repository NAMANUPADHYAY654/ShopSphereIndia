import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, updateCartQty, clearCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice } = useSelector((state) => state.cart);

  const handleQtyChange = (item, newQty) => {
    if (newQty < 1) return;
    if (newQty > item.stock) {
      toast.error(`Only ${item.stock} units available`);
      return;
    }
    dispatch(updateCartQty({ id: item._id, qty: newQty }));
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart(item._id));
    toast.success(`${item.name.slice(0, 25)}... removed`, { icon: '🗑️' });
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success('Cart cleared');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            Looks like you haven't added anything yet. Explore our products and find something you love!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-primary-500/25"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-sm text-red-500 hover:text-red-700 flex items-center space-x-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => {
                const itemDiscount = item.compareAtPrice > item.price
                  ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
                  : 0;

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex gap-5 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    {/* Image */}
                    <div
                      className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 cursor-pointer"
                      onClick={() => navigate(`/product/${item._id}`)}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs text-primary-500 font-medium mb-0.5 uppercase">
                            {item.category?.name || 'General'}
                          </p>
                          <h3
                            className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight cursor-pointer hover:text-primary-600 transition-colors"
                            onClick={() => navigate(`/product/${item._id}`)}
                          >
                            {item.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleRemove(item)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Price */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              ₹{(item.price * item.qty).toLocaleString('en-IN')}
                            </span>
                            {itemDiscount > 0 && (
                              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                {itemDiscount}% off
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ₹{item.price.toLocaleString('en-IN')} × {item.qty}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleQtyChange(item, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-gray-900 dark:text-white">{item.qty}</span>
                          <button
                            onClick={() => handleQtyChange(item, item.qty + 1)}
                            disabled={item.qty >= item.stock}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="inline-flex items-center text-primary-600 hover:text-primary-500 font-medium text-sm mt-2 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-20"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="flex gap-2 mb-5">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Apply
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({cartItems.reduce((a, b) => a + b.qty, 0)} items)</span>
                  <span>₹{(itemsPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  {(shippingPrice || 0) === 0 ? (
                    <span className="text-emerald-600 font-medium">FREE 🎉</span>
                  ) : (
                    <span>₹{(shippingPrice || 0).toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>GST (18%)</span>
                  <span>₹{(taxPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                {(itemsPrice || 0) < 499 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
                    Add ₹{(499 - (itemsPrice || 0)).toLocaleString('en-IN')} more for free shipping!
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white my-4">
                <span>Total</span>
                <span>₹{(totalPrice || 0).toLocaleString('en-IN')}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/25 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              {/* Payment Icons */}
              <div className="mt-4 flex items-center justify-center space-x-2 text-gray-400">
                {['🔒 Secure', '💳 Cards', '📱 UPI', '🏦 Net Banking'].map((p) => (
                  <span key={p} className="text-xs bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">{p}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
