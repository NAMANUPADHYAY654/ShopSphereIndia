import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareWarning, Plus, X, ChevronDown, ChevronUp, Send, Clock,
  CheckCircle2, AlertCircle, User, Headphones, Tag, Flag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useGetMyComplaintsQuery,
  useCreateComplaintMutation,
  useAddComplaintMessageMutation,
} from '../redux/api/complaintApiSlice';

const statusConfig = {
  Open: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertCircle },
  'In Progress': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
  Resolved: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  Closed: { color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: CheckCircle2 },
};

const priorityConfig = {
  Low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  High: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const categories = ['Product Issue', 'Delivery Problem', 'Payment Issue', 'Refund Request', 'Account Issue', 'Other'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];

const Complaints = () => {
  const [searchParams] = useSearchParams();
  const orderFromUrl = searchParams.get('order') || '';

  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    orderId: orderFromUrl,
    subject: '',
    category: 'Product Issue',
    priority: 'Medium',
    description: '',
  });

  const { data: complaints, isLoading } = useGetMyComplaintsQuery();
  const [createComplaint, { isLoading: isCreating }] = useCreateComplaintMutation();
  const [addMessage, { isLoading: isSending }] = useAddComplaintMessageMutation();

  // Auto-open modal if order param present
  useEffect(() => {
    if (orderFromUrl) {
      setShowModal(true);
      setFormData((prev) => ({ ...prev, orderId: orderFromUrl }));
    }
  }, [orderFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createComplaint(formData).unwrap();
      toast.success('Complaint submitted successfully');
      setShowModal(false);
      setFormData({ orderId: '', subject: '', category: 'Product Issue', priority: 'Medium', description: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit complaint');
    }
  };

  const handleReply = async (complaintId) => {
    const text = replyTexts[complaintId]?.trim();
    if (!text) return;
    try {
      await addMessage({ id: complaintId, text }).unwrap();
      toast.success('Message sent');
      setReplyTexts((prev) => ({ ...prev, [complaintId]: '' }));
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageSquareWarning className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Complaints</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Submit and track your complaints</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            New Complaint
          </motion.button>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
                <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!complaints || complaints.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6">
              <MessageSquareWarning className="w-14 h-14 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No complaints</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              You haven't filed any complaints yet. If you have an issue with an order, click "New Complaint" above.
            </p>
          </motion.div>
        )}

        {/* Complaints List */}
        {!isLoading && complaints && complaints.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {complaints.map((complaint) => {
              const status = statusConfig[complaint.status] || statusConfig.Open;
              const StatusIcon = status.icon;
              const isExpanded = expandedId === complaint._id;

              return (
                <motion.div
                  key={complaint._id}
                  layout
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  {/* Collapsed Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : complaint._id)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{complaint.subject}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {complaint.status}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-bold flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {complaint.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityConfig[complaint.priority] || priorityConfig.Medium}`}>
                          <span className="flex items-center gap-1"><Flag className="w-3 h-3" />{complaint.priority}</span>
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800">
                          {/* Description */}
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{complaint.description}</p>
                          </div>

                          {/* Conversation Thread */}
                          {complaint.messages && complaint.messages.length > 0 && (
                            <div className="mt-6 space-y-4">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Conversation</h4>
                              {complaint.messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.sender === 'admin' ? '' : 'flex-row-reverse'}`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    {msg.sender === 'admin' ? <Headphones className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-gray-500" />}
                                  </div>
                                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.sender === 'admin' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 rounded-tl-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-sm'}`}>
                                    <p>{msg.text}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                      {new Date(msg.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input */}
                          {complaint.status !== 'Closed' && (
                            <div className="mt-4 flex gap-2">
                              <input
                                type="text"
                                value={replyTexts[complaint._id] || ''}
                                onChange={(e) => setReplyTexts((prev) => ({ ...prev, [complaint._id]: e.target.value }))}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                onKeyDown={(e) => e.key === 'Enter' && handleReply(complaint._id)}
                              />
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleReply(complaint._id)}
                                disabled={isSending || !replyTexts[complaint._id]?.trim()}
                                className="px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-colors disabled:opacity-50"
                              >
                                <Send className="w-4 h-4" />
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* New Complaint Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquareWarning className="w-6 h-6 text-rose-500" />
                  File a Complaint
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Order ID</label>
                  <input
                    type="text"
                    value={formData.orderId}
                    onChange={(e) => setFormData((p) => ({ ...p, orderId: e.target.value }))}
                    placeholder="Paste your Order ID"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="Brief summary of your issue"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Provide details about your complaint..."
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isCreating}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                  >
                    {isCreating ? 'Submitting...' : 'Submit Complaint'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Complaints;
