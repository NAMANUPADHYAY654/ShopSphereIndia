import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, MapPin, Clock, CheckCircle2, Truck, ArrowLeft,
  Calendar, Navigation, Zap, Gauge, RotateCcw, AlertCircle,
  Signal, TrendingUp, Timer
} from 'lucide-react';
import { useGetOrderTrackingQuery } from '../redux/api/orderApiSlice';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ── Fix Leaflet default icons ──────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Custom SVG marker creator ─────────────────────────────────────
const makeIcon = (color, label = '', size = 36) =>
  L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <svg viewBox="0 0 40 40" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3"/>
          <text x="20" y="26" text-anchor="middle" font-size="16" fill="white">${label}</text>
        </svg>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });

const makePulseIcon = (color) =>
  L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        <div class="rt-pulse-ring" style="
          position:absolute;width:40px;height:40px;border-radius:50%;
          background:${color};opacity:0.25;animation:rtPulse 2s ease-out infinite;">
        </div>
        <div class="rt-pulse-ring" style="
          position:absolute;width:28px;height:28px;border-radius:50%;
          background:${color};opacity:0.4;animation:rtPulse 2s ease-out infinite;animation-delay:0.4s;">
        </div>
        <div style="
          width:18px;height:18px;border-radius:50%;
          background:${color};border:3px solid white;
          box-shadow:0 0 12px ${color}88;z-index:2;">
        </div>
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });

// ── Map camera follow component ────────────────────────────────────
const MapFollow = ({ center, shouldFollow }) => {
  const map = useMap();
  useEffect(() => {
    if (shouldFollow && center) {
      map.setView(center, map.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [center, shouldFollow, map]);
  return null;
};

// ── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Order Placed':     { icon: '📋', color: '#8b5cf6', bg: 'from-purple-500 to-violet-600' },
  'Packed':           { icon: '📦', color: '#f59e0b', bg: 'from-amber-500 to-yellow-600' },
  'Shipped':          { icon: '🚚', color: '#3b82f6', bg: 'from-blue-500 to-cyan-600' },
  'In Transit':       { icon: '✈️', color: '#06b6d4', bg: 'from-cyan-500 to-teal-600' },
  'Out for Delivery': { icon: '🛵', color: '#10b981', bg: 'from-emerald-500 to-green-600' },
  'Delivered':        { icon: '✅', color: '#10b981', bg: 'from-green-500 to-teal-600' },
  'Cancelled':        { icon: '❌', color: '#ef4444', bg: 'from-red-500 to-rose-600' },
};

// ── Fallback demo data ─────────────────────────────────────────────
const makeFallback = (id) => ({
  order: {
    _id: id,
    trackingId: 'SS-' + (id?.slice(-6) || '000000').toUpperCase(),
    orderStatus: 'In Transit',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    orderItems: [{ name: 'Demo Product', quantity: 1, price: 999, image: '' }],
    shippingInfo: { street: '123 MG Road', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
    totalPrice: 999,
  },
  trackingHistory: [
    { status: 'Order Placed',  location: 'Mumbai Warehouse',  coordinates: { lat: 19.076,  lng: 72.8777 }, timestamp: new Date(Date.now() - 48*3600000).toISOString(), description: 'Order confirmed and payment received' },
    { status: 'Packed',        location: 'Pune Sort Facility', coordinates: { lat: 18.5204, lng: 73.8567 }, timestamp: new Date(Date.now() - 36*3600000).toISOString(), description: 'Package sorted and dispatched' },
    { status: 'In Transit',    location: 'Hyderabad Hub',      coordinates: { lat: 17.385,  lng: 78.4867 }, timestamp: new Date(Date.now() -  6*3600000).toISOString(), description: 'Package in transit via Hyderabad' },
  ],
  currentLocation: { lat: 22.5, lng: 78.5 },
  routePath: [
    { lat: 19.076, lng: 72.8777 }, { lat: 18.5204, lng: 73.8567 },
    { lat: 17.385, lng: 78.4867 }, { lat: 22.5,    lng: 78.5    },
    { lat: 28.7041, lng: 77.1025 },
  ],
  liveStats: { progress: 48, speed: 82, distanceCovered: 920, distanceRemaining: 1080, etaHours: 13.2 },
});

// ── Stat card ──────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, unit, color, pulse }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4"
  >
    <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${pulse ? 'animate-pulse' : ''}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-black text-gray-900 dark:text-white leading-tight">
        {value}<span className="text-sm font-semibold text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  </motion.div>
);

// ── Main Component ─────────────────────────────────────────────────
const OrderTracking = () => {
  const { id } = useParams();
  const [followMode, setFollowMode] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);

  // Poll every 15 seconds for real-time updates
  const { data: trackingData, isLoading, error, refetch } = useGetOrderTrackingQuery(id, {
    pollingInterval: 15000,
  });

  useEffect(() => {
    if (trackingData) setLastUpdated(new Date());
  }, [trackingData]);

  // Live "seconds since last update" ticker
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - lastUpdated) / 1000)), 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  const data = trackingData || makeFallback(id);
  const { order, trackingHistory, currentLocation, routePath, liveStats } = data;
  const currentStepIndex = (trackingHistory?.length ?? 1) - 1;
  const currentStatus = trackingHistory?.[currentStepIndex]?.status || 'In Transit';
  const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG['In Transit'];
  const isDelivered = order?.orderStatus === 'Delivered';

  const currentLatLng = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : [20.5937, 78.9629];

  const routePositions = (routePath || []).map((p) => [p.lat, p.lng]);

  // Icons
  const originIcon    = makeIcon('#10b981', '🏭', 32);
  const waypointIcon  = makeIcon('#6b7280', '·', 24);
  const deliveredIcon = makeIcon('#10b981', '🏠', 36);
  const liveIcon      = makePulseIcon(statusCfg.color);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-cyan-500/30" />
          <p className="text-white font-bold text-lg">Loading live tracking data…</p>
          <p className="text-gray-400 text-sm mt-1">Connecting to tracking satellites 🛰️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Keyframe CSS injected */}
      <style>{`
        @keyframes rtPulse {
          0%   { transform: scale(0.6); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-container { border-radius: 1.5rem; z-index: 1; }
        .leaflet-popup-content-wrapper { border-radius: 12px; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Back + Title ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
          <Link to="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-semibold text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7"
        >
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${statusCfg.bg} rounded-2xl flex items-center justify-center shadow-lg text-2xl`}>
              {statusCfg.icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Live Order Tracking</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <code className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg font-mono">
                  {order?.trackingId || 'SS-XXXXXX'}
                </code>
                <span className="flex items-center gap-1 text-xs text-emerald-500 font-bold">
                  <Signal className="w-3 h-3" />
                  Live · {elapsed}s ago
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status badge */}
            <span className={`px-4 py-1.5 bg-gradient-to-r ${statusCfg.bg} text-white font-bold text-sm rounded-full shadow-md`}>
              {order?.orderStatus || currentStatus}
            </span>
            {/* Follow-mode toggle */}
            <button
              onClick={() => setFollowMode((f) => !f)}
              title={followMode ? 'Disable map follow' : 'Enable map follow'}
              className={`p-2 rounded-xl border transition-all ${followMode ? 'bg-cyan-500 border-cyan-400 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-500 hover:border-cyan-400'}`}
            >
              <Navigation className="w-4 h-4" />
            </button>
            {/* Manual refresh */}
            <button
              onClick={refetch}
              title="Refresh now"
              className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-500 hover:border-cyan-400 hover:text-cyan-500 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ── Progress Bar ── */}
        {!isDelivered && liveStats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-7">
            <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <span>📦 Origin — Mumbai</span>
              <span className="text-cyan-500">{liveStats.progress}% complete</span>
              <span>🏠 Destination — Delhi</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${liveStats.progress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full relative"
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-blue-500 shadow translate-x-1/2" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── Live Stats Row ── */}
        {liveStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            <StatCard icon={Gauge}    label="Speed"             value={liveStats.speed}           unit="km/h" color="from-blue-500 to-cyan-500"    pulse={liveStats.speed > 0} />
            <StatCard icon={TrendingUp} label="Covered"         value={liveStats.distanceCovered} unit="km"   color="from-emerald-500 to-teal-500" />
            <StatCard icon={MapPin}   label="Remaining"         value={liveStats.distanceRemaining} unit="km" color="from-orange-500 to-amber-500" />
            <StatCard icon={Timer}    label="ETA"               value={liveStats.etaHours}        unit="hrs"  color="from-purple-500 to-pink-500"  />
          </div>
        )}

        {/* ── Main Two-Column ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-7">

          {/* LEFT — Map (3/5) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              {/* Map header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cyan-500" />
                <span className="font-bold text-gray-900 dark:text-white">Live Map</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 ml-auto">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Updating every 15s
                </span>
                {!trackingData && (
                  <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                    <AlertCircle className="w-3 h-3" /> Demo Mode
                  </span>
                )}
              </div>

              {/* Map */}
              <div className="h-[480px] lg:h-[560px]">
                <MapContainer
                  center={currentLatLng}
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom
                >
                  {/* Dark-ish CartoDB Positron tiles — clean and premium */}
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                  />

                  {/* Camera follow */}
                  <MapFollow center={currentLatLng} shouldFollow={followMode} />

                  {/* Completed route (solid blue) */}
                  {routePositions.length > 1 && liveStats && (
                    <Polyline
                      positions={routePositions.slice(0, Math.ceil(routePositions.length * (liveStats.progress / 100)))}
                      color="#3b82f6"
                      weight={5}
                      opacity={0.9}
                    />
                  )}

                  {/* Remaining route (dashed gray) */}
                  {routePositions.length > 1 && liveStats && (
                    <Polyline
                      positions={routePositions.slice(Math.ceil(routePositions.length * (liveStats.progress / 100)) - 1)}
                      color="#9ca3af"
                      weight={3}
                      opacity={0.5}
                      dashArray="8 6"
                    />
                  )}

                  {/* Origin marker */}
                  {routePositions.length > 0 && (
                    <Marker position={routePositions[0]} icon={originIcon}>
                      <Popup>
                        <div className="text-sm font-bold">📦 Origin</div>
                        <div className="text-xs text-gray-500">Mumbai Warehouse</div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Destination marker */}
                  {routePositions.length > 1 && (
                    <Marker position={routePositions[routePositions.length - 1]} icon={isDelivered ? deliveredIcon : waypointIcon}>
                      <Popup>
                        <div className="text-sm font-bold">{isDelivered ? '✅ Delivered!' : '🏠 Destination'}</div>
                        <div className="text-xs text-gray-500">New Delhi</div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Timeline checkpoint markers */}
                  {trackingHistory?.map((step, idx) => {
                    if (idx === 0 || idx === trackingHistory.length - 1) return null;
                    return (
                      <Marker
                        key={idx}
                        position={[step.coordinates.lat, step.coordinates.lng]}
                        icon={waypointIcon}
                      >
                        <Popup>
                          <div className="text-sm font-bold">{step.status}</div>
                          <div className="text-xs text-gray-500">{step.location}</div>
                          <div className="text-xs text-gray-400">{new Date(step.timestamp).toLocaleString('en-IN')}</div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Live pulsing marker */}
                  {currentLocation && !isDelivered && (
                    <Marker position={currentLatLng} icon={liveIcon}>
                      <Popup>
                        <div className="text-sm font-bold" style={{ color: statusCfg.color }}>
                          {statusCfg.icon} Current Location
                        </div>
                        <div className="text-xs text-gray-500">{currentStatus}</div>
                        {liveStats && (
                          <div className="text-xs text-gray-400">Speed: {liveStats.speed} km/h</div>
                        )}
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              {/* Legend */}
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-5">
                {[
                  { color: '#10b981', label: 'Origin / Delivered' },
                  { color: statusCfg.color, label: 'Live Position', pulse: true },
                  { color: '#3b82f6', label: 'Completed Route' },
                  { color: '#9ca3af', label: 'Remaining Route' },
                ].map(({ color, label, pulse }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${pulse ? 'animate-pulse' : ''}`}
                      style={{ background: color }}
                    />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Details (2/5) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-base">
                <Package className="w-5 h-5 text-purple-500" /> Order Summary
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Tracking ID', value: order?.trackingId || 'N/A', mono: true },
                  { label: 'Status', value: order?.orderStatus || '—', badge: statusCfg.bg },
                  { label: 'Est. Delivery', value: order?.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD' },
                  { label: 'Total', value: `₹${(order?.totalPrice || 0).toLocaleString('en-IN')}`, bold: true },
                ].map(({ label, value, mono, badge, bold }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{label}</span>
                    {badge ? (
                      <span className={`px-3 py-0.5 bg-gradient-to-r ${badge} text-white text-xs font-bold rounded-full`}>{value}</span>
                    ) : (
                      <span className={`${mono ? 'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded' : ''} ${bold ? 'font-black' : 'font-semibold'} text-gray-900 dark:text-white`}>{value}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Items */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                {(order?.orderItems || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">₹{item.price?.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-blue-500" /> Journey Timeline
              </h3>

              <div className="space-y-0">
                <AnimatePresence>
                  {(trackingHistory || []).map((step, idx) => {
                    const isLatest = idx === currentStepIndex;
                    const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG['In Transit'];

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="flex gap-4"
                      >
                        {/* Dot + Line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-2 transition-all
                              ${isLatest ? 'border-transparent shadow-lg ring-4 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : 'border-transparent'}`}
                            style={{
                              background: `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color})`,
                              ringColor: cfg.color,
                            }}
                          >
                            {isLatest && <span className="absolute w-10 h-10 rounded-full animate-ping opacity-20" style={{ background: cfg.color }} />}
                            <span className="relative z-10">{cfg.icon}</span>
                          </div>
                          {idx < (trackingHistory?.length ?? 1) - 1 && (
                            <div className="w-0.5 h-10 bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-800 my-0.5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`pb-4 flex-1 ${idx === (trackingHistory?.length ?? 1) - 1 ? 'pb-0' : ''}`}>
                          <div className="flex items-center gap-2">
                            <p className={`font-bold text-sm ${isLatest ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                              {step.status}
                            </p>
                            {isLatest && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                                style={{ background: cfg.color }}>
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" /> {step.location}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(step.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {step.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{step.description}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Delivery Address */}
            {order?.shippingInfo && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-3xl border border-blue-200 dark:border-blue-800/30 p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-blue-500" /> Delivery Address
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {order.shippingInfo.street}<br />
                  {order.shippingInfo.city}, {order.shippingInfo.state}<br />
                  PIN: {order.shippingInfo.pincode}
                  {order.shippingInfo.phone && <><br />📞 {order.shippingInfo.phone}</>}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
