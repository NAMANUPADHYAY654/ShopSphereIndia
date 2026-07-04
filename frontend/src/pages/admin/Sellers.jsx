import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Terminal, Sparkles, Play, ShieldAlert, Activity, 
  AlertTriangle, CheckCircle2, Search, ArrowRight, X
} from 'lucide-react';
import { 
  useGetSellerHealthQuery, 
  useAdminCopilotMutation, 
  useExecuteAdminActionMutation 
} from '../../redux/api/aiApiSlice';
import toast from 'react-hot-toast';

const Sellers = () => {
  const { data: healthData, isLoading: isHealthLoading } = useGetSellerHealthQuery();
  const [adminCopilot, { isLoading: isCopilotLoading }] = useAdminCopilotMutation();
  const [executeAction, { isLoading: isExecuting }] = useExecuteAdminActionMutation();

  const [query, setQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAskCopilot = async (e) => {
    e.preventDefault();
    if (!query) return;
    try {
      const res = await adminCopilot({ query }).unwrap();
      setCopilotResponse(res);
      if (res.intent === 'action') {
        setShowConfirmModal(true);
      }
    } catch (err) {
      toast.error('Copilot failed to process command');
    }
  };

  const handleExecute = async () => {
    try {
      if (copilotResponse?.actionPayload) {
        await executeAction({ actionType: copilotResponse.actionPayload.actionType }).unwrap();
        toast.success(`Action executed successfully!`);
        setShowConfirmModal(false);
        setQuery('');
        setCopilotResponse(null);
      }
    } catch (err) {
      toast.error('Action failed to execute');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Users className="text-primary-500" /> Seller Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              AI-powered insights and natural-language bulk actions
            </p>
          </div>
        </div>

        {/* AI Command Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
              <Terminal size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Copilot</h2>
          </div>
          
          <form onSubmit={handleAskCopilot} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'Suspend all sellers with a rating under 2 stars' or 'Why did GMV drop?'"
              className="w-full pl-12 pr-32 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={isCopilotLoading || !query}
              className="absolute right-2 top-2 bottom-2 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
            >
              {isCopilotLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Run <Play size={16} /></>
              )}
            </button>
          </form>

          {/* Copilot Text Response (if query) */}
          {copilotResponse && copilotResponse.intent === 'query' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-2xl flex gap-4"
            >
              <Sparkles className="text-purple-500 shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-1">AI Analysis</h4>
                <p className="text-purple-800 dark:text-purple-200 leading-relaxed text-sm">
                  {copilotResponse.answer}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Seller Health Dashboard */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                <Activity size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Seller Health & Churn Predictor</h2>
            </div>
            <button className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 text-sm font-bold text-gray-500 dark:text-gray-400">Seller Name</th>
                  <th className="pb-3 text-sm font-bold text-gray-500 dark:text-gray-400">Health Score</th>
                  <th className="pb-3 text-sm font-bold text-gray-500 dark:text-gray-400">Churn Risk</th>
                  <th className="pb-3 text-sm font-bold text-gray-500 dark:text-gray-400">AI Insight</th>
                </tr>
              </thead>
              <tbody>
                {isHealthLoading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                      Analyzing seller metrics...
                    </td>
                  </tr>
                ) : (
                  healthData?.map((seller, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                      key={idx} 
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="py-4 font-bold text-gray-900 dark:text-white">{seller.sellerName}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-[100px] h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${seller.healthScore > 80 ? 'bg-emerald-500' : seller.healthScore > 50 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                              style={{ width: `${seller.healthScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{seller.healthScore}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          seller.churnProbability.includes('Low') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 
                          seller.churnProbability.includes('High') ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' : 
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                        }`}>
                          {seller.churnProbability}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-start gap-2">
                          <Sparkles size={14} className="text-primary-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{seller.aiInsight}</p>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Actions */}
      <AnimatePresence>
        {showConfirmModal && copilotResponse?.intent === 'action' && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowConfirmModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="text-rose-500" /> Confirm Bulk Action
                </h3>
                <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">AI Understood Intent</p>
                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">{copilotResponse.actionPayload.actionType}</p>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                  <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">Impact</p>
                  <p className="font-bold text-rose-700 dark:text-rose-300">
                    This will affect <span className="text-xl">{copilotResponse.actionPayload.recordsAffected}</span> records.
                  </p>
                  <p className="text-sm text-rose-600/80 mt-2">{copilotResponse.answer}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isExecuting ? 'Executing...' : 'Execute Action'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sellers;
