import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, Eye, MessageSquareWarning, ShoppingBag, Clock, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { useGetMyOrdersQuery } from '../redux/api/orderApiSlice';

const statusConfig = {
  Processing: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  Shipped: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  Delivered: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  Cancelled: { color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
};

const tabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const MyOrders = () => {
  const [activeTab, setActiveTab] = useState('All');
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  const filteredOrders = activeTab === 'All'
    ? (orders || [])
    : (orders || []).filter((o) => o.orderStatus === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Orders</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage your purchases</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-xl">
            {(orders || []).length} orders
          </span>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-8 overflow-x-auto pb-2"
        >
          <Filter className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                  <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-14 h-14 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              Looks like you haven't placed any orders. Start shopping and your orders will appear here!
            </p>
            <Link
              to="/products"
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Start Shopping
            </Link>
          </motion.div>
        )}

        {/* Order Cards */}
        {!isLoading && filteredOrders.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.orderStatus] || statusConfig.Processing;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order._id}
                  variants={cardVariants}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            Order #{order._id?.slice(-8)?.toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {(order.orderItems || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={item.image || '/placeholder.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap">
                            ₹{item.price?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        Total: ₹{order.totalPrice?.toLocaleString('en-IN')}
                      </p>
                      <div className="flex gap-3">
                        <Link
                          to={`/orders/${order._id}/track`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          Track Order
                        </Link>
                        <Link
                          to={`/complaints?order=${order._id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-200"
                        >
                          <MessageSquareWarning className="w-4 h-4" />
                          File Complaint
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
