import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, Activity, Search, AlertTriangle, 
  X, CheckCircle2, Shield, Fingerprint, Lock, Zap, Map
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useGetFraudRadarQuery } from '../../redux/api/aiApiSlice';

const mockChartData = [
  { name: 'Mon', traffic: 4000, fraud: 240 },
  { name: 'Tue', traffic: 3000, fraud: 139 },
  { name: 'Wed', traffic: 2000, fraud: 980 },
  { name: 'Thu', traffic: 2780, fraud: 390 },
  { name: 'Fri', traffic: 1890, fraud: 480 },
  { name: 'Sat', traffic: 2390, fraud: 380 },
  { name: 'Sun', traffic: 3490, fraud: 430 },
];

const FraudRadar = () => {
  const { data: fraudData, isLoading: isFraudLoading } = useGetFraudRadarQuery();
  const [selectedFraudAlert, setSelectedFraudAlert] = useState(null);
  const [resolvedFraudAlertIds, setResolvedFraudAlertIds] = useState([]);
  
  const [autoRules, setAutoRules] = useState({
    autoBan: true,
    require2FA: false,
    velocityCheck: true,
  });

  const handleResolveFraud = () => {
    if (selectedFraudAlert) {
      setResolvedFraudAlertIds(prev => [...prev, selectedFraudAlert.id]);
      setSelectedFraudAlert(null);
      toast.success(`${selectedFraudAlert.recommendedAction || 'Action'} executed successfully.`);
    }
  };

  const activeAlerts = fraudData?.filter(alert => !resolvedFraudAlertIds.includes(alert.id)) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white pb-12 transition-colors duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pt-8 pb-4 px-8 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Shield className="text-emerald-500 w-8 h-8" />
              Security Command Center
            </h1>
            <p className="text-gray-500 font-medium mt-1">AI-powered threat detection and automated moderation.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold border border-emerald-100 dark:border-emerald-800">
              <ShieldCheck size={18} /> Platform Secured
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Fraud Prevented (30d)</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">$124,500</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-rose-600 dark:text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Active Threats</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{isFraudLoading ? '-' : activeAlerts.length}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <Lock className="w-7 h-7 text-purple-600 dark:text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Auto-Blocked IPs</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">1,492</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area (Chart & Feed) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Activity className="text-primary-500" /> Traffic vs Fraud Attempts (7 Days)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Area type="monotone" dataKey="traffic" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={2} />
                    <Area type="monotone" dataKey="fraud" stroke="#ef4444" fillOpacity={1} fill="url(#colorFraud)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Threat Feed */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-200 dark:border-rose-900/30 overflow-hidden shadow-sm">
              <div className="bg-rose-50 dark:bg-rose-950/20 px-6 py-4 border-b border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-rose-600 dark:text-rose-500 w-6 h-6" />
                  <h3 className="font-bold text-rose-900 dark:text-rose-400 text-lg">Live Threat Feed</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Live Monitoring</span>
                </div>
              </div>
              <div className="p-6">
                {isFraudLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl" />)}
                  </div>
                ) : (
                  activeAlerts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">All Clear</p>
                      <p className="text-sm">No active threats detected in your network.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeAlerts.map(alert => (
                        <div key={alert.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-rose-300 dark:hover:border-rose-700 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-800/30 group">
                          <div className="flex gap-4 items-start w-full">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${alert.severity === 'High' ? 'bg-rose-100 border-rose-200 text-rose-600 dark:bg-rose-900/30 dark:border-rose-800' : 'bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-900/30 dark:border-amber-800'}`}>
                              <Fingerprint className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${alert.severity === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                  {alert.severity} Risk
                                </span>
                                <span className="text-xs font-bold text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-md">{alert.type}</span>
                                <span className="text-xs font-mono text-gray-400 flex items-center gap-1"><Map size={12} /> 192.168.{Math.floor(Math.random() * 255)}.x</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{alert.description}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setSelectedFraudAlert(alert)}
                            className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
                          >
                            <Search className="w-4 h-4" /> Investigate
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Automated Rules Engine */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="bg-primary-50 dark:bg-primary-900/10 px-6 py-4 border-b border-primary-100 dark:border-primary-900/20 flex items-center gap-3">
                <Zap className="text-primary-600 dark:text-primary-400 w-5 h-5" />
                <h3 className="font-bold text-primary-900 dark:text-primary-400">Automated Rules Engine</h3>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure AI autonomy to automatically block threats before they impact your platform.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Auto-Ban High Confidence</h4>
                      <p className="text-xs text-gray-500 mt-1">Ban IPs instantly if AI Confidence &gt; 95%</p>
                    </div>
                    <button 
                      onClick={() => setAutoRules(prev => ({...prev, autoBan: !prev.autoBan}))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoRules.autoBan ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRules.autoBan ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Require 2FA for Anomalies</h4>
                      <p className="text-xs text-gray-500 mt-1">Trigger 2FA if location suddenly changes</p>
                    </div>
                    <button 
                      onClick={() => setAutoRules(prev => ({...prev, require2FA: !prev.require2FA}))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoRules.require2FA ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRules.require2FA ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Velocity Checks</h4>
                      <p className="text-xs text-gray-500 mt-1">Flag &gt;5 high-value orders in 10 minutes</p>
                    </div>
                    <button 
                      onClick={() => setAutoRules(prev => ({...prev, velocityCheck: !prev.velocityCheck}))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoRules.velocityCheck ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRules.velocityCheck ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Investigation Modal */}
      <AnimatePresence>
        {selectedFraudAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-gray-900 dark:text-white">Fraud Investigation</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Threat ID: #{selectedFraudAlert.id}-FRD</p>
                  </div>
                </div>
                <button onClick={() => setSelectedFraudAlert(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${selectedFraudAlert.severity === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>{selectedFraudAlert.severity} Risk</span>
                    <span className="text-sm font-bold text-gray-500">{selectedFraudAlert.type}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{selectedFraudAlert.description}</h3>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center rounded-full border-4 border-rose-200 dark:border-rose-800">
                    <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{selectedFraudAlert.confidenceScore}%</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-rose-900 dark:text-rose-300">AI Confidence Score</h4>
                    <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">The neural network is highly confident this is anomalous behavior based on historical attack vectors.</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Search size={18} className="text-primary-500" /> Red Flags Detected</h4>
                  <ul className="space-y-3">
                    {selectedFraudAlert.evidence?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                        <div className="mt-0.5 shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-600 p-1 rounded-full">
                          <AlertTriangle size={14} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                <button onClick={() => setSelectedFraudAlert(null)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                  Dismiss False Positive
                </button>
                <button onClick={handleResolveFraud} className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-lg hover:shadow-rose-500/25 flex items-center gap-2">
                  <ShieldAlert size={18} /> Execute: {selectedFraudAlert.recommendedAction || 'Block Transaction'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FraudRadar;
