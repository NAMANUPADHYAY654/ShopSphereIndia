import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, CreditCard, CheckCircle, ChevronRight, Lock, Smartphone, Building2 } from 'lucide-react';
import { saveShippingAddress, savePaymentMethod, clearCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Review'];

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: <Smartphone className="w-5 h-5" />, desc: 'GPay, PhonePe, Paytm, BHIM' },
  { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard className="w-5 h-5" />, desc: 'Visa, Mastercard, Rupay' },
  { id: 'netbanking', label: 'Net Banking', icon: <Building2 className="w-5 h-5" />, desc: 'All major banks' },
  { id: 'cod', label: 'Cash on Delivery', icon: <span className="text-lg">💵</span>, desc: 'Pay when delivered' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const [step, setStep] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: userInfo?.name || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');

  // Redirect if no items
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <button onClick={() => navigate('/products')} className="mt-4 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const validateShipping = () => {
    const { fullName, phone, addressLine1, city, state, pincode } = shipping;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.error('Please fill all required shipping fields');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return false;
    }
    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateShipping()) return;
    dispatch(saveShippingAddress(shipping));
    dispatch(savePaymentMethod(paymentMethod));
    setStep((s) => s + 1);
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    // Simulate order placement (would call backend API in production)
    await new Promise((r) => setTimeout(r, 2000));
    dispatch(clearCart());
    setOrderPlaced(true);
    setPlacingOrder(false);
  };

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Order Placed! 🎉</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Thank you, <strong>{shipping.fullName}</strong>!
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your order will be delivered to <strong>{shipping.city}</strong> within 3–5 business days.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 mb-1">Order Total</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">₹{(totalPrice || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">via {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              View Orders
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center space-x-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                  {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-primary-600' : i < step ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 transition-all ${i < step ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* STEP 0: Shipping */}
              {step === 0 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Address</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name *', key: 'fullName', type: 'text', placeholder: 'Aarav Sharma', span: 1 },
                      { label: 'Phone Number *', key: 'phone', type: 'tel', placeholder: '9876543210', span: 1 },
                      { label: 'Address Line 1 *', key: 'addressLine1', type: 'text', placeholder: 'House / Flat No., Street', span: 2 },
                      { label: 'Address Line 2', key: 'addressLine2', type: 'text', placeholder: 'Landmark, Area (optional)', span: 2 },
                      { label: 'City *', key: 'city', type: 'text', placeholder: 'Mumbai', span: 1 },
                      { label: 'State *', key: 'state', type: 'text', placeholder: 'Maharashtra', span: 1 },
                      { label: 'Pincode *', key: 'pincode', type: 'text', placeholder: '400001', span: 1 },
                    ].map((field) => (
                      <div key={field.key} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={shipping[field.key]}
                          onChange={(e) => setShipping({ ...shipping, [field.key]: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 1: Payment */}
              {step === 1 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center space-x-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-200'}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === method.id ? 'bg-primary-100 dark:bg-primary-800 text-primary-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{method.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'upi' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">UPI ID</label>
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </motion.div>
                  )}

                  <div className="mt-4 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Your payment info is secured with 256-bit SSL encryption</span>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Review */}
              {step === 2 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Shipping Summary */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 dark:text-white">Shipping To</h3>
                      <button onClick={() => setStep(0)} className="text-sm text-primary-600 hover:text-primary-500">Edit</button>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">{shipping.fullName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{shipping.addressLine1}{shipping.addressLine2 ? `, ${shipping.addressLine2}` : ''}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{shipping.city}, {shipping.state} — {shipping.pincode}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">📞 {shipping.phone}</p>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-white">Payment Method</h3>
                      <button onClick={() => setStep(1)} className="text-sm text-primary-600 hover:text-primary-500">Edit</button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}
                    </p>
                    {upiId && <p className="text-sm text-gray-500">{upiId}</p>}
                  </div>

                  {/* Items */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Items ({cartItems.length})</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item._id} className="flex items-center space-x-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {step > 0 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <button
                  onClick={() => navigate('/cart')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  ← Back to Cart
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md transition-colors"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-primary-600 hover:from-emerald-600 hover:to-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 transition-all disabled:opacity-70"
                >
                  {placingOrder ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Placing Order...</span></>
                  ) : (
                    <><Lock className="w-4 h-4" /><span>Place Order · ₹{(totalPrice || 0).toLocaleString('en-IN')}</span></>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-20">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(itemsPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {(shippingPrice || 0) === 0
                    ? <span className="text-emerald-600 font-medium">FREE</span>
                    : <span>₹{(shippingPrice || 0).toLocaleString('en-IN')}</span>}
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{(taxPrice || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex justify-between font-black text-lg text-gray-900 dark:text-white mt-3">
                <span>Total</span>
                <span>₹{(totalPrice || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* Mini cart items */}
              <div className="mt-4 space-y-2">
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item._id} className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : '🛍️'}
                    </div>
                    <span className="flex-1 line-clamp-1">{item.name}</span>
                    <span className="font-medium">×{item.qty}</span>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <p className="text-xs text-gray-400">+{cartItems.length - 3} more items</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
