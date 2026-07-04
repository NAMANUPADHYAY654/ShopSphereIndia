import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingBag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { useLoginMutation } from '../redux/api/authApiSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { search } = useLocation();
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  const redirect = new URLSearchParams(search).get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userInfo.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate(redirect);
      }
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome back, ${res.name}!`);
      
      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mx-auto mb-6 backdrop-blur-sm"
          >
            <ShoppingBag className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4"
          >
            ShopSphere India
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-white/80 max-w-sm"
          >
            Your premium destination for modern shopping in India 🇮🇳
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 grid grid-cols-3 gap-4 max-w-xs mx-auto"
          >
            {['10K+ Products', 'Free Shipping', '24/7 Support'].map((item) => (
              <div key={item} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-sm font-medium">
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ShopSphere India</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to continue shopping</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                Forgot password?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
                Create one for free
              </Link>
            </p>
          </div>

          {/* Demo credentials box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🔑 Demo Credentials</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Admin: admin@shopsphere.com / password123</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">User: john@example.com / password123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
