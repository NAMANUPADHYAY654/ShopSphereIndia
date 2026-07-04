import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Mail, AlertTriangle, Send, X, Check, Search, Filter, MessageSquare, Clock, ArrowRight, Sparkles
} from 'lucide-react';
import { 
  useGetSupportTriageQuery, 
  useDraftRejectionMutation 
} from '../../redux/api/aiApiSlice';
import toast from 'react-hot-toast';

const Moderation = () => {
  const { data: triageData, isLoading: isTriageLoading } = useGetSupportTriageQuery();
  const [draftRejection, { isLoading: isDrafting }] = useDraftRejectionMutation();

  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [draftedEmail, setDraftedEmail] = useState(null);

  // Mock flagged listings for the moderation queue
  const flaggedItems = [
    { id: 1, type: 'Listing', title: 'Apple AirPods Pro Max - Perfect Clone', seller: 'TechGizmo', flag: 'Counterfeit / Policy Violation' },
    { id: 2, type: 'Review', title: 'Review on Samsung TV', seller: 'User123', flag: 'Inappropriate Language' },
  ];

  const handleDraft = async () => {
    if (!rejectReason) {
      toast.error('Please provide a brief reason for the AI to expand on.');
      return;
    }
    try {
      const res = await draftRejection({ itemDetails: selectedItem.title, reason: rejectReason }).unwrap();
      setDraftedEmail(res);
      toast.success('AI drafted the rejection email!');
    } catch (err) {
      toast.error('Failed to draft rejection');
    }
  };

  const handleSendEmail = () => {
    toast.success('Rejection email sent successfully!');
    setSelectedItem(null);
    setDraftedEmail(null);
    setRejectReason('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <ShieldAlert className="text-rose-500" /> Moderation & Support
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              AI-assisted ticket triage and automated moderation workflows
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Support Ticket Triage */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                  <MessageSquare size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Support Triage</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {isTriageLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                triageData?.map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 font-mono">{ticket.id}</span>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          ticket.category === 'Billing' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                          ticket.category === 'Shipping' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                        }`}>
                          {ticket.category}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          ticket.urgency === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' :
                          ticket.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                        }`}>
                          {ticket.urgency} Urgency
                        </span>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{ticket.subject}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">"{ticket.userMessage}"</p>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl relative">
                      <Sparkles size={14} className="absolute top-3 left-3 text-blue-500" />
                      <p className="pl-6 text-xs text-blue-800 dark:text-blue-200 font-medium line-clamp-2">
                        <span className="font-bold block mb-1">AI Drafted Reply:</span>
                        {ticket.draftResponse}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Moderation Queue & AI Auto-Draft */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Moderation Queue</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {flaggedItems.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500">{item.type}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-xs font-medium text-gray-500">{item.seller}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{item.flag}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedItem(item); setDraftedEmail(null); setRejectReason(''); }}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Draft Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setSelectedItem(null)} />
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reject {selectedItem.type}</h3>
                  <p className="text-sm text-gray-500 mt-1">Item: {selectedItem.title}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Brief Reason for Rejection</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. 'Selling clones is against policy'"
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleDraft}
                      disabled={isDrafting || !rejectReason}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                      {isDrafting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Sparkles size={18} /> Draft Email</>}
                    </button>
                  </div>
                </div>

                {draftedEmail && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                    <div className="h-px w-full bg-gray-100 dark:bg-gray-800" />
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                        {draftedEmail.emailSubject}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Body (HTML)</label>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: draftedEmail.emailBodyHtml }} />
                    </div>
                  </motion.div>
                )}
              </div>

              {draftedEmail && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                  <button onClick={() => setDraftedEmail(null)} className="px-6 py-2.5 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                    Edit Reason
                  </button>
                  <button onClick={handleSendEmail} className="px-6 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center gap-2">
                    <Send size={18} /> Send to Seller
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Moderation;
