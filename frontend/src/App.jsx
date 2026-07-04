import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from './redux/slices/themeSlice';

// Layouts
import CustomerLayout from './components/layouts/CustomerLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Electronics from './pages/Electronics';
import Fashion from './pages/Fashion';
import Deals from './pages/Deals';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/admin/Dashboard';
import Sellers from './pages/admin/Sellers';
import Moderation from './pages/admin/Moderation';
import FraudRadar from './pages/admin/FraudRadar';
import AdminComplaints from './pages/admin/AdminComplaints';
import SellerDashboard from './pages/seller/SellerDashboard';
import Onboarding from './pages/seller/Onboarding';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import Complaints from './pages/Complaints';
import TrackPackage from './pages/TrackPackage';

// Route Guards
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.theme);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              fontWeight: '500',
            },
          }}
        />
        
        <Routes>
          {/* Admin Routes (Uses Dedicated Admin Layout) */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="sellers" element={<Sellers />} />
              <Route path="moderation" element={<Moderation />} />
              <Route path="security" element={<FraudRadar />} />
              <Route path="complaints" element={<AdminComplaints />} />
            </Route>
          </Route>

          {/* Customer & Seller Routes (Uses Standard Customer Layout) */}
          <Route element={<CustomerLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/electronics" element={<Electronics />} />
            <Route path="/fashion" element={<Fashion />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/track" element={<TrackPackage />} />

            {/* Private User Routes */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/orders/:id/track" element={<OrderTracking />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/wishlist" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>

            {/* Seller Routes */}
            <Route path="/seller/onboard" element={<Onboarding />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />

            {/* 404 */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="text-8xl mb-4">🛒</div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
                <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                  Go Home
                </a>
              </div>
            } />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
