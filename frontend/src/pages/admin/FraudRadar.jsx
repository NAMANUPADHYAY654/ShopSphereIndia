import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Search,
  AlertTriangle,
  X,
  CheckCircle2,
  Shield,
  Fingerprint,
  Lock,
  Zap,
  Map,
  BadgeAlert,
  Clock3,
  UserCheck,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useGetSecurityCenterQuery } from '../../redux/api/aiApiSlice';

const FraudRadar = () => {
  const { data: securityData, isLoading: isSecurityLoading } = useGetSecurityCenterQuery();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolvedAlertIds, setResolvedAlertIds] = useState([]);

  const metrics = securityData?.metrics || {
    totalUsers: 0,
    verifiedUsers: 0,
    googleLinkedUsers: 0,
    activeOtpSessions: 0,
    suspiciousOrders: 0,
    highValueOrders: 0,
    securityScore: 0,
  };

  const alerts = (securityData?.alerts || []).filter((alert) => !resolvedAlertIds.includes(alert.id));
  const timeline = securityData?.timeline || [];
  const controls = securityData?.controls || [];
  const recentEvents = securityData?.recentEvents || [];
  const toneClasses = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const handleResolveAlert = () => {
    if (!selectedAlert) return;

    setResolvedAlertIds((prev) => [...prev, selectedAlert.id]);
    toast.success(`${selectedAlert.recommendedAction || 'Action'} marked complete.`);
    setSelectedAlert(null);
  };

  const metricCards = [
    { label: 'Security score', value: `${metrics.securityScore}/100`, icon: ShieldCheck, tone: 'emerald' },
    { label: 'Verified accounts', value: metrics.verifiedUsers, icon: UserCheck, tone: 'blue' },
    { label: 'Active OTP sessions', value: metrics.activeOtpSessions, icon: Lock, tone: 'violet' },
    { label: 'Orders under watch', value: metrics.suspiciousOrders, icon: BadgeAlert, tone: 'rose' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-12 text-stone-900 transition-colors duration-300 dark:bg-stone-950 dark:text-white">
      <div className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 px-8 pb-4 pt-8 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
              <Shield className="h-8 w-8 text-stone-900 dark:text-white" />
              Security Command Center
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Real account, OTP, and order signals from the live platform.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
            <ShieldCheck size={18} /> Monitoring active
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <div key={card.label} className="flex items-center gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${toneClasses[card.tone]}`}>
                <card.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{card.label}</p>
                <p className="text-3xl font-semibold tracking-tight">{isSecurityLoading ? '—' : card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-stone-700 dark:text-stone-300" />
                <h3 className="text-lg font-semibold">7-day security activity</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="securityOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1f2937" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#1f2937" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="securityOtp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.2} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="orders" stroke="#1f2937" fillOpacity={1} fill="url(#securityOrders)" strokeWidth={2} />
                    <Area type="monotone" dataKey="otpChecks" stroke="#0f766e" fillOpacity={1} fill="url(#securityOtp)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-rose-200 bg-white shadow-sm dark:border-rose-900/30 dark:bg-stone-900">
              <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-6 py-4 dark:border-rose-900/30 dark:bg-rose-950/20">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-300">Live risk queue</h3>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Live
                </span>
              </div>
              <div className="p-6">
                {isSecurityLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-20 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
                    ))}
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 dark:text-stone-400">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <p className="text-lg font-semibold text-stone-900 dark:text-white">No active alerts</p>
                    <p className="text-sm">All monitored signals are within expected limits.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="group flex flex-col gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-rose-300 dark:border-stone-800 dark:bg-stone-950/40 dark:hover:border-rose-700 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex w-full items-start gap-4">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${alert.severity === 'High' ? 'border-rose-200 bg-rose-100 text-rose-600 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400' : 'border-amber-200 bg-amber-100 text-amber-600 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            <Fingerprint className="h-6 w-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${alert.severity === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                {alert.severity} risk
                              </span>
                              <span className="rounded-md bg-stone-200 px-2 py-0.5 text-xs font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">{alert.type}</span>
                              <span className="flex items-center gap-1 text-xs font-mono text-stone-400"><Map size={12} /> India zone</span>
                            </div>
                            <p className="font-semibold text-stone-900 dark:text-white">{alert.title}</p>
                            <p className="text-sm text-stone-600 dark:text-stone-400">{alert.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-900 hover:text-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-white dark:hover:text-stone-950"
                        >
                          <Search className="h-4 w-4" /> Inspect
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center gap-3 border-b border-stone-100 px-6 py-4 dark:border-stone-800">
                <Zap className="h-5 w-5 text-stone-700 dark:text-stone-300" />
                <h3 className="font-semibold">Security controls</h3>
              </div>
              <div className="space-y-3 p-6">
                {controls.map((control) => (
                  <div key={control.name} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-800 dark:bg-stone-950/40">
                    <span className="text-stone-600 dark:text-stone-400">{control.name}</span>
                    <span className="font-semibold text-stone-900 dark:text-white">{control.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center gap-3 border-b border-stone-100 px-6 py-4 dark:border-stone-800">
                <Clock3 className="h-5 w-5 text-stone-700 dark:text-stone-300" />
                <h3 className="font-semibold">Audit trail</h3>
              </div>
              <div className="space-y-4 p-6">
                {recentEvents.length === 0 ? (
                  <p className="text-sm text-stone-500 dark:text-stone-400">No recent security events.</p>
                ) : (
                  recentEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/40">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-stone-900 dark:text-white">{event.type}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">{event.detail}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${event.status === 'Completed' || event.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">{event.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-6 py-4 dark:border-stone-800 dark:bg-stone-950/40">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Security review</p>
                  <h2 className="text-xl font-semibold text-stone-900 dark:text-white">{selectedAlert.title}</h2>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="rounded-xl p-2 transition-colors hover:bg-stone-200 dark:hover:bg-stone-800">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 overflow-y-auto p-6">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/30 dark:bg-rose-950/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    <span className="text-sm font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">{selectedAlert.severity} risk</span>
                  </div>
                  <p className="mt-3 text-sm text-rose-900 dark:text-rose-200">{selectedAlert.description}</p>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-stone-900 dark:text-white">
                    <ShieldAlert className="h-4 w-4 text-stone-500" /> Evidence
                  </h4>
                  <div className="space-y-3">
                    {selectedAlert.evidence?.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/40">
                        <div className="mt-0.5 rounded-full bg-amber-100 p-1 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                          <AlertTriangle size={14} />
                        </div>
                        <span className="text-sm text-stone-700 dark:text-stone-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-stone-100 bg-stone-50 px-6 py-4 dark:border-stone-800 dark:bg-stone-950/40">
                <button onClick={() => setSelectedAlert(null)} className="rounded-xl border border-stone-200 px-5 py-2.5 font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
                  Dismiss
                </button>
                <button onClick={handleResolveAlert} className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200">
                  Execute action
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
