const Order = require('../models/orderModel');

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view this order');
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────
// Full India Route Simulation — Package travels a realistic path
// across major Indian cities with real-time interpolation
// ──────────────────────────────────────────────────────────────────

const INDIA_ROUTE = [
  { lat: 19.0760, lng: 72.8777, name: 'Mumbai Warehouse', description: 'Order confirmed and payment received' },
  { lat: 18.5204, lng: 73.8567, name: 'Pune Sort Facility', description: 'Package sorted and dispatched' },
  { lat: 17.3850, lng: 78.4867, name: 'Hyderabad Hub', description: 'Package in transit via Hyderabad' },
  { lat: 15.3173, lng: 75.7139, name: 'Hubli Transit', description: 'Crossed Hubli transit point' },
  { lat: 12.9716, lng: 77.5946, name: 'Bangalore Hub', description: 'Arrived at Bangalore distribution center' },
  { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam', description: 'Transit via east coast route' },
  { lat: 20.2961, lng: 85.8245, name: 'Bhubaneswar Hub', description: 'Passing through Odisha hub' },
  { lat: 22.5726, lng: 88.3639, name: 'Kolkata Hub', description: 'Arrived at Kolkata distribution center' },
  { lat: 25.6093, lng: 85.1376, name: 'Patna Transit', description: 'Crossing Bihar transit point' },
  { lat: 26.8467, lng: 80.9462, name: 'Lucknow Hub', description: 'At Lucknow sorting facility' },
  { lat: 28.7041, lng: 77.1025, name: 'New Delhi Delivery Hub', description: 'Out for delivery in your area' },
];

// Interpolate between two points
const lerp = (a, b, t) => a + (b - a) * t;

// Generate dense route path with intermediate points for smooth map curves
const generateDenseRoute = (waypoints, pointsPerSegment = 10) => {
  const dense = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    for (let j = 0; j <= pointsPerSegment; j++) {
      const t = j / pointsPerSegment;
      dense.push({
        lat: lerp(waypoints[i].lat, waypoints[i + 1].lat, t),
        lng: lerp(waypoints[i].lng, waypoints[i + 1].lng, t),
      });
    }
  }
  return dense;
};

// Calculate distance between two lat/lng points (Haversine, km)
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getOrderTracking = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view this order');
    }

    const id = order._id.toString();
    const mockTrackingId = 'SS-' + id.slice(-6).toUpperCase();
    const orderTime = order.createdAt.getTime();
    const now = Date.now();

    // Each waypoint takes ~6 hours in simulation (so full route ≈ 60 hrs)
    const HOURS_PER_SEGMENT = 6;
    const MS_PER_SEGMENT = HOURS_PER_SEGMENT * 60 * 60 * 1000;
    const totalRouteTimeMs = (INDIA_ROUTE.length - 1) * MS_PER_SEGMENT;
    const elapsedMs = now - orderTime;

    // Clamp progress to 0..1
    const routeProgress = Math.min(Math.max(elapsedMs / totalRouteTimeMs, 0), 1);

    // Determine which waypoints have been "reached"
    const completedWaypoints = [];
    for (let i = 0; i < INDIA_ROUTE.length; i++) {
      const waypointTime = orderTime + i * MS_PER_SEGMENT;
      if (now >= waypointTime) {
        completedWaypoints.push({
          status: i === 0 ? 'Order Placed' : i === INDIA_ROUTE.length - 1 ? 'Out for Delivery' : 'In Transit',
          location: INDIA_ROUTE[i].name,
          coordinates: { lat: INDIA_ROUTE[i].lat, lng: INDIA_ROUTE[i].lng },
          timestamp: new Date(waypointTime),
          description: INDIA_ROUTE[i].description,
        });
      }
    }

    // If order is delivered, slam progress to 1
    if (order.orderStatus === 'Delivered') {
      completedWaypoints.push({
        status: 'Delivered',
        location: 'New Delhi Delivery Hub',
        coordinates: { lat: 28.7041, lng: 77.1025 },
        timestamp: new Date(order.deliveredAt || now),
        description: 'Package delivered successfully! 🎉',
      });
    }

    // If cancelled, only show the cancel event
    if (order.orderStatus === 'Cancelled') {
      const cancelHistory = [{
        status: 'Order Placed',
        location: INDIA_ROUTE[0].name,
        coordinates: { lat: INDIA_ROUTE[0].lat, lng: INDIA_ROUTE[0].lng },
        timestamp: new Date(orderTime),
        description: INDIA_ROUTE[0].description,
      }, {
        status: 'Cancelled',
        location: INDIA_ROUTE[0].name,
        coordinates: { lat: INDIA_ROUTE[0].lat, lng: INDIA_ROUTE[0].lng },
        timestamp: new Date(orderTime + 2 * 60 * 60 * 1000),
        description: 'Order was cancelled',
      }];

      return res.json({
        order: {
          _id: order._id,
          trackingId: order.trackingId || mockTrackingId,
          orderStatus: order.orderStatus,
          estimatedDelivery: null,
          orderItems: order.orderItems,
          shippingInfo: order.shippingInfo,
          totalPrice: order.totalPrice,
        },
        trackingHistory: cancelHistory,
        currentLocation: cancelHistory[0].coordinates,
        routePath: [{ lat: INDIA_ROUTE[0].lat, lng: INDIA_ROUTE[0].lng }],
        liveStats: { progress: 0, speed: 0, distanceCovered: 0, distanceRemaining: 0, etaHours: 0 },
      });
    }

    // ── Real-time interpolated current position ──
    const segmentFloat = routeProgress * (INDIA_ROUTE.length - 1);
    const segIndex = Math.min(Math.floor(segmentFloat), INDIA_ROUTE.length - 2);
    const segT = segmentFloat - segIndex;

    const currentLocation = {
      lat: lerp(INDIA_ROUTE[segIndex].lat, INDIA_ROUTE[segIndex + 1].lat, segT),
      lng: lerp(INDIA_ROUTE[segIndex].lng, INDIA_ROUTE[segIndex + 1].lng, segT),
    };

    // ── Generate dense route for smooth polyline ──
    const routePath = generateDenseRoute(INDIA_ROUTE, 12);

    // ── Calculate live stats ──
    let totalDistanceKm = 0;
    for (let i = 0; i < INDIA_ROUTE.length - 1; i++) {
      totalDistanceKm += haversineKm(INDIA_ROUTE[i].lat, INDIA_ROUTE[i].lng, INDIA_ROUTE[i + 1].lat, INDIA_ROUTE[i + 1].lng);
    }
    const distanceCovered = totalDistanceKm * routeProgress;
    const distanceRemaining = totalDistanceKm - distanceCovered;
    const avgSpeedKmh = elapsedMs > 0 ? (distanceCovered / (elapsedMs / 3600000)) : 0;
    const etaHours = avgSpeedKmh > 0 ? distanceRemaining / avgSpeedKmh : 0;

    // ── Use real tracking history if the order has one ──
    const finalHistory = (order.trackingHistory && order.trackingHistory.length > 0)
      ? order.trackingHistory
      : completedWaypoints;

    res.json({
      order: {
        _id: order._id,
        trackingId: order.trackingId || mockTrackingId,
        orderStatus: order.orderStatus,
        estimatedDelivery: order.estimatedDelivery || new Date(orderTime + totalRouteTimeMs),
        orderItems: order.orderItems,
        shippingInfo: order.shippingInfo,
        totalPrice: order.totalPrice,
      },
      trackingHistory: finalHistory,
      currentLocation,
      routePath,
      liveStats: {
        progress: Math.round(routeProgress * 100),
        speed: Math.round(avgSpeedKmh),
        distanceCovered: Math.round(distanceCovered),
        distanceRemaining: Math.round(distanceRemaining),
        etaHours: Math.round(etaHours * 10) / 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyOrders, getOrderById, getOrderTracking };
