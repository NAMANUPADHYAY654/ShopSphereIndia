import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Search, MapPin, Truck, Clock, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

const TrackPackage = () => {
  const [trackingInput, setTrackingInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    const trimmed = trackingInput.trim();
    if (!trimmed) {
      setError('Please enter a tracking ID or order ID');
      return;
    }
    setError('');
    // Navigate to the order tracking page using the ID
    // Strip any "SS-" prefix if provided, and try to use it as an order ID
    const cleanId = trimmed.replace(/^SS-/i, '');
    navigate(`/orders/${cleanId}/track`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-bold rounded-full mb-6">
              <Globe className="w-4 h-4" />
              Real-time Package Tracking
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Track Your <br />
              <span className="bg-gradient-to-r from-cyan-200 to-teal-200 bg-clip-text text-transparent">
                Package
              </span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
              Enter your Tracking ID or Order ID below to see real-time location updates on an interactive map.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleTrack}
            className="max-w-2xl mx-auto"
          >
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => { setTrackingInput(e.target.value); setError(''); }}
                  placeholder="Enter Tracking ID or Order ID (e.g. SS-A1B2C3)"
                  className="w-full pl-14 pr-6 py-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl text-lg border-2 border-transparent focus:border-cyan-400 focus:ring-0 shadow-2xl shadow-black/20 placeholder-gray-400 outline-none transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-8 py-5 bg-white text-blue-700 font-black text-lg rounded-2xl shadow-2xl shadow-black/20 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                Track <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-rose-200 text-sm font-semibold text-left pl-5"
              >
                {error}
              </motion.p>
            )}
          </motion.form>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">
            How Tracking Works
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Stay updated on every step of your delivery journey with our advanced tracking system.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: MapPin,
              color: 'from-blue-500 to-cyan-500',
              title: 'Live Map Tracking',
              description: 'Watch your package move on an interactive map with real-time location markers and route visualization.',
            },
            {
              icon: Clock,
              color: 'from-purple-500 to-pink-500',
              title: 'Timeline Updates',
              description: 'Get a detailed timeline showing every checkpoint — from warehouse packing to your doorstep delivery.',
            },
            {
              icon: Shield,
              color: 'from-emerald-500 to-teal-500',
              title: 'Estimated Delivery',
              description: 'Know exactly when your package will arrive with smart estimated delivery date predictions.',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tracking Steps Visual */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-3xl border border-blue-200 dark:border-blue-800/30 p-10"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Your Package Journey</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-0">
            {[
              { icon: Package, label: 'Order Placed', emoji: '📋' },
              { icon: Zap, label: 'Packed', emoji: '📦' },
              { icon: Truck, label: 'Shipped', emoji: '🚚' },
              { icon: MapPin, label: 'Out for Delivery', emoji: '📍' },
              { icon: Shield, label: 'Delivered!', emoji: '✅' },
            ].map((step, idx) => (
              <div key={idx} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1">
                <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-md text-2xl border border-blue-200 dark:border-blue-700">
                  {step.emoji}
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 text-center">{step.label}</p>
                {idx < 4 && (
                  <div className="hidden sm:block w-full h-0.5 bg-blue-200 dark:bg-blue-800 mt-2" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackPackage;
