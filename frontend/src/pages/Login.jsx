import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingBag, ShieldCheck, RotateCcw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { useLoginMutation, useVerifyOtpMutation, useResendOtpMutation } from '../redux/api/authApiSlice';
import GoogleAuthButton from '../components/GoogleAuthButton';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpChannel] = useState('email');
  const [step, setStep] = useState('credentials');
  const [otp, setOtp] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [deliveryTarget, setDeliveryTarget] = useState('');
  const navigate = useNavigate();
  const { search } = useLocation();
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

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

  const submitCredentials = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const res = await login({ email, password, otpChannel }).unwrap();

      if (res.otpRequired) {
        setOtpSessionId(res.otpSessionId);
        setDeliveryTarget(res.destination);
        setStep('otp');
        setOtp('');
        toast.success(res.message || 'We sent a one-time code');
        return;
      }

      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome back, ${res.name}!`);
      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid email or password');
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();

    if (!otpSessionId || !otp.trim()) {
      toast.error('Enter the OTP sent to your device');
      return;
    }

    try {
      const res = await verifyOtp({ otpSessionId, otp }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome back, ${res.name}!`);

      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'OTP verification failed');
    }
  };

  const handleGoogleSuccess = (res) => {
    dispatch(setCredentials({ ...res }));

    if (res.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (res.role === 'seller') {
      navigate('/seller/dashboard');
    } else {
      navigate(redirect);
    }
  };

  const handleResendOtp = async () => {
    if (!otpSessionId) return;

    try {
      const res = await resendOtp({ otpSessionId }).unwrap();
      setDeliveryTarget(res.destination);
      toast.success('A new code has been sent');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 py-16 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60">
          <div className="max-w-md">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300">
              <ShoppingBag className="h-4 w-4" />
              ShopSphere India
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 dark:text-white">
              Simple sign-in, safer access.
            </h1>
            <p className="mt-4 text-base leading-7 text-stone-600 dark:text-stone-400">
              Sign in with your password, then confirm using an OTP sent to email or mobile.
            </p>
            <div className="mt-8 space-y-3 text-sm text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-emerald-600" />Password + OTP verification</div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-emerald-600" />OTP sent to your email</div>
              <div className="flex items-center gap-3"><ShoppingBag className="h-4 w-4 text-emerald-600" />Secure and simple access</div>
            </div>
          </div>
        </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center dark:bg-white">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-stone-900 dark:text-white">ShopSphere India</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-stone-900 dark:text-white">Welcome back</h2>
            <p className="mt-2 text-stone-600 dark:text-stone-400">Sign in to continue shopping.</p>
          </div>

          <div className="mb-5 space-y-3 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
            <GoogleAuthButton mode="signin" onSuccess={handleGoogleSuccess} />
            <div className="relative py-1 text-center text-xs uppercase tracking-wider text-stone-400">
              <span className="relative z-10 bg-white px-3 dark:bg-stone-900">Or sign in with password</span>
              <div className="absolute left-0 top-1/2 h-px w-full bg-stone-200 dark:bg-stone-800" />
            </div>
          </div>

          {step === 'credentials' ? (
            <form onSubmit={submitCredentials} className="space-y-5 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav.sharma@shopsphere.in"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-stone-900 placeholder-stone-400 transition-all focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white dark:focus:ring-stone-700"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-12 text-stone-900 placeholder-stone-400 transition-all focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white dark:focus:ring-stone-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                  <input type="checkbox" className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 dark:border-stone-600" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-stone-900 hover:underline dark:text-white">
                  Forgot password?
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
              >
                {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-stone-950 dark:border-t-transparent" /> : <>Send OTP <ArrowRight className="ml-2 h-4 w-4" /></>}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-5 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
                <p className="font-medium text-stone-900 dark:text-white">Code sent</p>
                <p className="mt-1">We sent a verification code to {deliveryTarget || 'your selected channel'}.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Enter OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 placeholder-stone-400 transition-all focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white dark:focus:ring-stone-700"
                />
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                >
                  Edit details
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-950"
                >
                  <RotateCcw className="h-4 w-4" />
                  Resend
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isVerifying}
                className="w-full inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
              >
                {isVerifying ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-stone-950 dark:border-t-transparent" /> : <>Verify & Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
              </motion.button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-stone-600 dark:text-stone-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-stone-900 hover:underline dark:text-white">
                Create one for free
              </Link>
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            OTPs are sent through email or SMS when the corresponding delivery settings are configured.
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default Login;
