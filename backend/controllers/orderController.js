const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const crypto = require('crypto');

// ── Razorpay setup ──
let razorpayInstance = null;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const DEMO_MODE = !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET;

if (!DEMO_MODE) {
  const Razorpay = require('razorpay');
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  console.log('💳 Razorpay initialized in LIVE TEST mode');
} else {
  console.log('💳 Razorpay running in DEMO mode (no keys configured)');
}

const addOrderItems = async (req, res, next) => {
  try {
    const { orderItems, shippingInfo, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingInfo,
      paymentInfo: { status: 'Pending', method: paymentMethod },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus: 'Processing',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

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

const CITIES = {
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'hubli': { lat: 15.3173, lng: 75.7139 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
};

const getCityCoords = (cityName) => {
  if (!cityName) return null;
  const name = cityName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITIES)) {
    if (name.includes(key)) return { name: key.charAt(0).toUpperCase() + key.slice(1), ...coords };
  }
  // Default to New Delhi if not matched
  return { name: cityName || 'Unknown', lat: 28.7041, lng: 77.1025 };
};

const generateDynamicRoute = (origin, dest) => {
  const route = [];
  route.push({ lat: origin.lat, lng: origin.lng, name: `${origin.name} Origin Hub`, description: 'Order packed and dispatched' });
  
  const distance = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
  
  if (distance > 100) {
    // Add 2 intermediate points with a slight curve
    const mid1 = { lat: lerp(origin.lat, dest.lat, 0.33) + 0.5, lng: lerp(origin.lng, dest.lng, 0.33) - 0.5 };
    const mid2 = { lat: lerp(origin.lat, dest.lat, 0.66) - 0.5, lng: lerp(origin.lng, dest.lng, 0.66) + 0.5 };
    route.push({ ...mid1, name: 'Regional Sort Facility', description: 'Package sorted at transit facility' });
    route.push({ ...mid2, name: 'Local Logistics Center', description: 'Package received at local logistics center' });
  } else if (distance > 20) {
    const mid = { lat: lerp(origin.lat, dest.lat, 0.5), lng: lerp(origin.lng, dest.lng, 0.5) };
    route.push({ ...mid, name: 'City Transit Hub', description: 'Package in local transit' });
  }

  route.push({ lat: dest.lat, lng: dest.lng, name: `${dest.name} Delivery Hub`, description: 'Out for delivery in your area' });
  return route;
};

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

    // ── Generate Dynamic Route ──
    // Use seller location or default to Mumbai as origin
    const originCity = getCityCoords('Mumbai');
    // Use buyer shipping city as destination
    const destCity = getCityCoords(order.shippingInfo.city);
    const dynamicRoute = generateDynamicRoute(originCity, destCity);

    // Calculate total dynamic distance
    let totalRouteDistanceKm = 0;
    for (let i = 0; i < dynamicRoute.length - 1; i++) {
      totalRouteDistanceKm += haversineKm(dynamicRoute[i].lat, dynamicRoute[i].lng, dynamicRoute[i + 1].lat, dynamicRoute[i + 1].lng);
    }
    
    // Assume average transit speed of 60 km/h (plus 6 hours processing per hub)
    const SPEED_KMH = 60;
    const processingTimeMs = dynamicRoute.length * 6 * 60 * 60 * 1000;
    const transitTimeMs = (totalRouteDistanceKm / SPEED_KMH) * 60 * 60 * 1000;
    const totalRouteTimeMs = processingTimeMs + transitTimeMs;
    
    const elapsedMs = now - orderTime;
    const routeProgress = totalRouteTimeMs === 0 ? 1 : Math.min(Math.max(elapsedMs / totalRouteTimeMs, 0), 1);

    // Determine which waypoints have been "reached"
    const completedWaypoints = [];
    for (let i = 0; i < dynamicRoute.length; i++) {
      const waypointProgress = i / Math.max(dynamicRoute.length - 1, 1);
      if (routeProgress >= waypointProgress) {
        completedWaypoints.push({
          status: i === 0 ? 'Order Placed' : i === dynamicRoute.length - 1 ? 'Out for Delivery' : 'In Transit',
          location: dynamicRoute[i].name,
          coordinates: { lat: dynamicRoute[i].lat, lng: dynamicRoute[i].lng },
          timestamp: new Date(orderTime + (totalRouteTimeMs * waypointProgress)),
          description: dynamicRoute[i].description,
        });
      }
    }

    // If order is delivered, slam progress to 1
    if (order.orderStatus === 'Delivered') {
      completedWaypoints.push({
        status: 'Delivered',
        location: `${destCity.name} Delivery Hub`,
        coordinates: { lat: destCity.lat, lng: destCity.lng },
        timestamp: new Date(order.deliveredAt || now),
        description: 'Package delivered successfully! 🎉',
      });
    }

    // If cancelled, only show the cancel event
    if (order.orderStatus === 'Cancelled') {
      const cancelHistory = [{
        status: 'Order Placed',
        location: dynamicRoute[0].name,
        coordinates: { lat: dynamicRoute[0].lat, lng: dynamicRoute[0].lng },
        timestamp: new Date(orderTime),
        description: dynamicRoute[0].description,
      }, {
        status: 'Cancelled',
        location: dynamicRoute[0].name,
        coordinates: { lat: dynamicRoute[0].lat, lng: dynamicRoute[0].lng },
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
        routePath: [{ lat: dynamicRoute[0].lat, lng: dynamicRoute[0].lng }],
        liveStats: { progress: 0, speed: 0, distanceCovered: 0, distanceRemaining: 0, etaHours: 0 },
      });
    }

    // ── Real-time interpolated current position ──
    const segmentFloat = routeProgress * (dynamicRoute.length - 1);
    const segIndex = Math.min(Math.floor(segmentFloat), dynamicRoute.length - 2);
    const segT = segmentFloat - segIndex;

    const currentLocation = {
      lat: lerp(dynamicRoute[segIndex].lat, dynamicRoute[segIndex + 1].lat, segT),
      lng: lerp(dynamicRoute[segIndex].lng, dynamicRoute[segIndex + 1].lng, segT),
    };

    // ── Generate dense route for smooth polyline ──
    const routePath = generateDenseRoute(dynamicRoute, 12);

    // ── Calculate live stats ──
    const distanceCovered = totalRouteDistanceKm * routeProgress;
    const distanceRemaining = totalRouteDistanceKm - distanceCovered;
    const avgSpeedKmh = elapsedMs > 0 ? (distanceCovered / (elapsedMs / 3600000)) : 0;
    const etaHours = avgSpeedKmh > 0 ? distanceRemaining / Math.max(avgSpeedKmh, SPEED_KMH) : (distanceRemaining / SPEED_KMH);

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
        speed: Math.round(routeProgress > 0 && routeProgress < 1 ? SPEED_KMH : 0),
        distanceCovered: Math.round(distanceCovered),
        distanceRemaining: Math.round(distanceRemaining),
        etaHours: Math.round(etaHours * 10) / 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Razorpay: Get Config ──
const getRazorpayConfig = async (req, res, next) => {
  try {
    res.json({
      keyId: DEMO_MODE ? 'DEMO_MODE' : RAZORPAY_KEY_ID,
      demoMode: DEMO_MODE,
    });
  } catch (error) {
    next(error);
  }
};

// ── Razorpay: Create Order ──
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Invalid amount');
    }

    if (DEMO_MODE) {
      // Demo mode: return a fake razorpay order
      const demoOrderId = 'demo_order_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      return res.json({
        id: demoOrderId,
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        demoMode: true,
      });
    }

    // Real Razorpay test mode
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      demoMode: false,
    });
  } catch (error) {
    next(error);
  }
};

// ── Razorpay: Verify Payment ──
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, demoMode: isDemoPayment } = req.body;

    if (isDemoPayment || DEMO_MODE) {
      // Demo mode: auto-verify and mark order as paid
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentInfo = {
            razorpayOrderId: razorpay_order_id || 'demo_order',
            razorpayPaymentId: razorpay_payment_id || 'demo_payment_' + Date.now(),
            razorpaySignature: 'demo_signature',
            status: 'Paid',
          };
          await order.save();
        }
      }
      return res.json({ verified: true, demoMode: true });
    }

    // Real verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid && orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentInfo = {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'Paid',
        };
        await order.save();
      }
    }

    res.json({ verified: isValid });
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrderItems, getMyOrders, getOrderById, getOrderTracking, getRazorpayConfig, createRazorpayOrder, verifyPayment };
