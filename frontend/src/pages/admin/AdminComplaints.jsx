import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Filter, Search, ChevronDown, ChevronUp, AlertCircle, Clock, CheckCircle2, MessageSquareWarning, Flag, Tag, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useGetAllComplaintsQuery,
  useUpdateComplaintMutation,
  useAddComplaintMessageMutation,
} from '../../redux/api/complaintApiSlice';

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

const AdminComplaints = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [statusUpdates, setStatusUpdates] = useState({});
  const [resolutions, setResolutions] = useState({});

  const { data: complaints, isLoading } = useGetAllComplaintsQuery();
  const [updateComplaint] = useUpdateComplaintMutation();
  const [addMessage, { isLoading: isSending }] = useAddComplaintMessageMutation();

  const filteredComplaints = (complaints || []).filter((c) => {
    const matchesTab = activeTab === 'All' || c.status === activeTab;
    const matchesSearch = c.subject.toLowerCase().includes(search.toLowerCase()) || 
                          c.order?._id?.toLowerCase().includes(search.toLowerCase()) ||
                          c.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = statusUpdates[id];
    const resolution = resolutions[id];
    
    if (!newStatus && !resolution) {
      toast.error('Nothing to update');
      return;
    }

    try {
      await updateComplaint({ id, status: newStatus || currentStatus, resolution }).unwrap();
      toast.success('Complaint updated');
      setStatusUpdates((prev) => ({ ...prev, [id]: '' }));
      if (resolution) {
        setResolutions((prev) => ({ ...prev, [id]: '' }));
      }
    } catch (err) {
      toast.error('Failed to update complaint');
    }
  };

  const handleReply = async (complaintId) => {
    const text = replyTexts[complaintId]?.trim();
    if (!text) return;
    try {
      await addMessage({ id: complaintId, text }).unwrap();
      toast.success('Message sent to user');
      setReplyTexts((prev) => ({ ...prev, [complaintId]: '' }));
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const stats = {
    total: complaints?.length || 0,
    open: complaints?.filter(c => c.status === 'Open').length || 0,
    inProgress: complaints?.filter(c => c.status === 'In Progress').length || 0,
    resolved: complaints?.filter(c => c.status === 'Resolved').length || 0,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            Complaint Management
          </h1>
          <p className="text-gray-500 mt-1">Resolve customer issues and manage support tickets</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets', value: stats.total, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
          { label: 'Open', value: stats.open, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
          { label: 'Resolved', value: stats.resolved, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <MessageSquareWarning className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 mr-2" />
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Complaints List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading tickets...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <MessageSquareWarning className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No complaints found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => {
            const status = statusConfig[complaint.status] || statusConfig.Open;
            const StatusIcon = status.icon;
            const isExpanded = expandedId === complaint._id;

            return (
              <motion.div
                key={complaint._id}
                layout
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : complaint._id)}
                  className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {complaint.status}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${priorityConfig[complaint.priority]}`}>
                        <span className="flex items-center gap-1"><Flag className="w-3 h-3" />{complaint.priority}</span>
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {complaint.category}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto hidden sm:block">
                        {new Date(complaint.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{complaint.subject}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">User: {complaint.user?.name} ({complaint.user?.email}) | Order: #{complaint.order?._id?.slice(-6)?.toUpperCase()}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
                    >
                      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Details & Chat */}
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Original Complaint</h4>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-6">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{complaint.description}</p>
                          </div>

                          {/* Chat */}
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Conversation History</h4>
                          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {complaint.messages?.map((msg, idx) => (
                              <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? '' : 'flex-row-reverse'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                                  {msg.sender === 'user' ? <AlertCircle className="w-4 h-4 text-gray-500" /> : <Headphones className="w-4 h-4 text-rose-600" />}
                                </div>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-200 rounded-tr-sm'}`}>
                                  <p>{msg.text}</p>
                                  <p className="text-[10px] opacity-60 mt-1">{new Date(msg.timestamp).toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Reply Input */}
                          {complaint.status !== 'Closed' && (
                            <div className="mt-4 flex gap-2">
                              <input
                                type="text"
                                value={replyTexts[complaint._id] || ''}
                                onChange={(e) => setReplyTexts((prev) => ({ ...prev, [complaint._id]: e.target.value }))}
                                placeholder="Reply to customer..."
                                className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleReply(complaint._id)}
                              />
                              <button
                                onClick={() => handleReply(complaint._id)}
                                disabled={isSending || !replyTexts[complaint._id]?.trim()}
                                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 font-semibold text-sm"
                              >
                                <Send className="w-4 h-4" /> Reply
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Right: Admin Actions */}
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 h-fit">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Update Status</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Change Status To:</label>
                              <select
                                value={statusUpdates[complaint._id] || complaint.status}
                                onChange={(e) => setStatusUpdates((prev) => ({ ...prev, [complaint._id]: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                              >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Internal Resolution / Note:</label>
                              <textarea
                                value={resolutions[complaint._id] || complaint.resolution || ''}
                                onChange={(e) => setResolutions((prev) => ({ ...prev, [complaint._id]: e.target.value }))}
                                placeholder="Write the final resolution (will set status to Resolved)"
                                rows={3}
                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm resize-none"
                              />
                            </div>

                            <button
                              onClick={() => handleUpdateStatus(complaint._id, complaint.status)}
                              className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:shadow-lg transition-all text-sm"
                            >
                              Save Updates
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
