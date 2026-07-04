import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, Activity, Sparkles, Send, Users, DollarSign, X, AlertTriangle, FileText,
  Tag, CheckCircle2, MessageSquare, BarChart2, Check, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
  useAdminCopilotMutation,
  useExecuteAdminActionMutation,
  useGetPricingRadarQuery,
  useGetSellerHealthQuery,
  useGetSupportTriageQuery,
  useGetSentimentRadarQuery,
  useGetWeeklyDigestQuery,
  useDraftRejectionMutation
} from '../../redux/api/aiApiSlice';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, triage
  const [copilotQuery, setCopilotQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: 'Hello Admin. I am your AI Data Science Copilot. Ask me to run data queries ("Why did GMV drop?") or execute bulk actions ("Suspend sellers with >10% return rate").' }
  ]);
  const [showDigestModal, setShowDigestModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // RTK Query Hooks
  const [copilotTrigger, { isLoading: isCopilotLoading }] = useAdminCopilotMutation();
  const [executeActionTrigger, { isLoading: isExecuting }] = useExecuteAdminActionMutation();
  const [draftRejectionTrigger, { isLoading: isDrafting }] = useDraftRejectionMutation();
  
  const { data: pricingData, isLoading: isPricingLoading } = useGetPricingRadarQuery();
  const { data: healthData, isLoading: isHealthLoading } = useGetSellerHealthQuery();
  const { data: triageData, isLoading: isTriageLoading } = useGetSupportTriageQuery();
  const { data: sentimentData, isLoading: isSentimentLoading } = useGetSentimentRadarQuery();
  const { data: digestData, isLoading: isDigestLoading, refetch: refetchDigest } = useGetWeeklyDigestQuery({ skip: !showDigestModal });

  const [draftedEmails, setDraftedEmails] = useState({});

  const handleCopilotSubmit = async (e) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;

    const userMessage = copilotQuery;
    setCopilotQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await copilotTrigger({ query: userMessage }).unwrap();
      
      if (res.intent === 'action') {
        setChatHistory(prev => [...prev, { role: 'ai', content: res.answer, isAction: true, actionPayload: res.actionPayload }]);
        setPendingAction(res.actionPayload);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', content: res.answer, data: res.data }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error running that query.', error: true }]);
    }
  };

  const confirmAction = async (payload) => {
    try {
      const res = await executeActionTrigger({ actionType: payload.actionType }).unwrap();
      setChatHistory(prev => [...prev, { role: 'ai', content: `✅ ${res.message}` }]);
      setPendingAction(null);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: '❌ Failed to execute action.', error: true }]);
    }
  };

  const handleOpenDigest = () => {
    setShowDigestModal(true);
    refetchDigest();
  };

  const handleDraftRejection = async (ticketId, subject, reason) => {
    try {
      const res = await draftRejectionTrigger({ itemDetails: subject, reason }).unwrap();
      setDraftedEmails(prev => ({ ...prev, [ticketId]: res }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white pb-12 transition-colors duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-md text-sm font-bold ${activeTab === 'overview' ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Overview</button>
              <button onClick={() => setActiveTab('triage')} className={`px-4 py-2 rounded-md text-sm font-bold ${activeTab === 'triage' ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Triage & Moderation</button>
            </div>
            <button 
              onClick={handleOpenDigest}
              className="flex items-center gap-2 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              <FileText size={18} /> Weekly Digest
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'overview' ? (
          <>
            {/* KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { title: 'Gross Volume', val: '₹4.2M', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { title: 'Active Sellers', val: '142', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { title: 'Flagged Listings', val: '12', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                { title: 'AI Automation', val: '98%', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-black">{stat.val}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Copilot */}
              <div className="lg:col-span-2 flex flex-col h-[700px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Natural-Language Copilot</h3>
                    <p className="text-xs text-gray-500">Query Root Causes & Execute Bulk Actions</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Table Render */}
                        {msg.data && (
                          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-gray-200/50 dark:bg-gray-900/50 text-xs uppercase">
                                <tr>{Object.keys(msg.data[0] || {}).map(key => <th key={key} className="px-4 py-3">{key}</th>)}</tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {msg.data.map((row, i) => (
                                  <tr key={i}>{Object.values(row).map((val, j) => <td key={j} className="px-4 py-3 font-medium">{String(val)}</td>)}</tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Action Confirmation Render */}
                        {msg.isAction && msg.actionPayload && (
                          <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold mb-2">
                              <AlertTriangle className="w-4 h-4" /> Action Required
                            </div>
                            <p className="text-sm text-rose-600 dark:text-rose-300 mb-4">
                              Are you sure you want to execute <strong>{msg.actionPayload.actionType}</strong>? This will affect {msg.actionPayload.recordsAffected} records.
                            </p>
                            <button 
                              onClick={() => confirmAction(msg.actionPayload)}
                              disabled={isExecuting}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                              {isExecuting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Confirm Execution
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isCopilotLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-tl-sm flex gap-2 items-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleCopilotSubmit} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={copilotQuery}
                      onChange={(e) => setCopilotQuery(e.target.value)}
                      placeholder="e.g. Suspend sellers under 2 stars... or Why did GMV drop?"
                      className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-4 pl-4 pr-14 text-sm focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500"
                    />
                    <button 
                      type="submit"
                      disabled={isCopilotLoading || !copilotQuery.trim()}
                      className="absolute right-2 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column */}
              <div className="space-y-8 h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Sentiment Trend */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart2 className="text-blue-500 w-6 h-6" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Sentiment Radar</h3>
                  </div>
                  {isSentimentLoading ? <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" /> : (
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sentimentData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                          <Area type="monotone" dataKey="sentiment" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Fraud Radar Link */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/30 overflow-hidden shadow-sm p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="text-emerald-600 dark:text-emerald-500 w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Security Status: Active</h3>
                  <p className="text-sm text-gray-500 mb-4">AI Fraud Radar is monitoring traffic.</p>
                  <Link to="/admin/security" className="inline-block px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:scale-105 transition-transform">
                    Open Security Center
                  </Link>
                </div>

                {/* Seller Health */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                   <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Activity className="text-emerald-500 w-6 h-6" />
                    <h3 className="font-bold">Seller Health</h3>
                  </div>
                  <div className="p-6">
                    {isHealthLoading ? (
                      <div className="animate-pulse space-y-3">
                        {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {healthData?.map((seller, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div>
                              <p className="font-semibold text-sm">{seller.sellerName}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">{seller.aiInsight}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-black ${seller.healthScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{seller.healthScore}/100</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Churn: {seller.churnProbability}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          /* Triage & Moderation Tab */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Support Triage */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><MessageSquare w={20} /></div>
                  <h3 className="font-bold text-lg">Support Auto-Triage</h3>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">AI Sorted</span>
              </div>
              <div className="p-6 space-y-4">
                {isTriageLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}
                  </div>
                ) : (
                  triageData?.map(ticket => (
                    <div key={ticket.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-900 dark:text-white">{ticket.subject}</h4>
                        <div className="flex gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-md">{ticket.category}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${ticket.urgency === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{ticket.urgency}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">"{ticket.userMessage}"</p>
                      
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Drafted Response</p>
                        <p className="text-sm text-blue-900 dark:text-blue-300">{ticket.draftResponse}</p>
                        <div className="mt-3 flex gap-2">
                          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">Send & Resolve</button>
                          <button className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Pricing & Rejection */}
            <div className="space-y-8">
              {/* Pricing Radar */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-amber-200 dark:border-amber-900/30 shadow-sm overflow-hidden">
                <div className="bg-amber-50 dark:bg-amber-950/20 px-6 py-4 border-b border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                  <Tag className="text-amber-600 dark:text-amber-500 w-6 h-6" />
                  <h3 className="font-bold text-amber-900 dark:text-amber-400">Pricing Anomaly Radar</h3>
                </div>
                <div className="p-6">
                  {isPricingLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[1,2].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pricingData?.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border border-amber-100 dark:border-amber-900/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm">{item.productName}</h4>
                            <span className="font-black text-amber-600">₹{item.currentPrice}</span>
                          </div>
                          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg inline-block font-semibold mb-2">{item.anomalyType}</p>
                          <p className="text-xs text-gray-500">{item.reason}</p>
                          <div className="mt-3 flex gap-2">
                            <button className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-md">Flag Listing</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Copilot Demo */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <AlertTriangle className="text-rose-500 w-6 h-6" />
                  <h3 className="font-bold">Auto-Draft Rejection</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Click reject to auto-draft a policy violation email.</p>
                  <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="font-bold text-sm mb-1">Gucci Fake Bag 100% Real</h4>
                    <p className="text-xs text-gray-500 mb-3">Counterfeit flagged by vision AI.</p>
                    
                    {!draftedEmails['fake-bag'] ? (
                      <button 
                        onClick={() => handleDraftRejection('fake-bag', 'Gucci Fake Bag 100% Real', 'Counterfeit items violate intellectual property policy.')}
                        disabled={isDrafting}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isDrafting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <X className="w-3 h-3" />}
                        Reject & Auto-Draft Email
                      </button>
                    ) : (
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl mt-3">
                        <p className="text-xs font-bold text-rose-800 dark:text-rose-400 mb-2">Subject: {draftedEmails['fake-bag'].emailSubject}</p>
                        <div className="text-sm text-rose-900 dark:text-rose-300 prose prose-sm" dangerouslySetInnerHTML={{ __html: draftedEmails['fake-bag'].emailBodyHtml }} />
                        <button className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"><Send className="w-3 h-3" /> Send Notice</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Digest Modal */}
      <AnimatePresence>
        {showDigestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-primary-600 to-purple-600 text-white">
                <h2 className="font-black text-xl flex items-center gap-2"><Sparkles /> AI Executive Digest</h2>
                <button onClick={() => setShowDigestModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X /></button>
              </div>
              <div className="p-8 overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                {isDigestLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mb-4" />
                    <p className="font-bold text-gray-500">Generating strategic insights...</p>
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: digestData?.htmlContent }} />
                )}
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
