import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShoppingBag, CheckCircle, ShieldCheck, RotateCcw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { useRegisterMutation, useVerifyOtpMutation, useResendOtpMutation } from '../redux/api/authApiSlice';
import GoogleAuthButton from '../components/GoogleAuthButton';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('details');
  const [otp, setOtp] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [deliveryTarget, setDeliveryTarget] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerApi, { isLoading }] = useRegisterMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const passwordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const submitDetails = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await registerApi({ name, email, password, otpChannel: 'email' }).unwrap();

      if (res.otpRequired) {
        setOtpSessionId(res.otpSessionId);
        setDeliveryTarget(res.destination);
        setStep('otp');
        setOtp('');
        toast.success(res.message || 'We sent a verification code');
        return;
      }

      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome to ShopSphere, ${res.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed. Try again.');
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
      toast.success(`Welcome to ShopSphere, ${res.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || 'OTP verification failed');
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

  const handleGoogleSuccess = (res) => {
    dispatch(setCredentials({ ...res }));
    navigate('/');
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
              Create your account with account verification.
            </h1>
            <p className="mt-4 text-base leading-7 text-stone-600 dark:text-stone-400">
              New users verify with an email OTP before the account is activated.
            </p>
            <div className="mt-8 space-y-3 text-sm text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-emerald-600" />Safer onboarding</div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-emerald-600" />Email OTP verification</div>
              <div className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-emerald-600" />Cleaner sign-up flow</div>
            </div>
          </div>
        </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
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
            <h2 className="text-3xl font-semibold text-stone-900 dark:text-white">Create account</h2>
            <p className="mt-2 text-stone-600 dark:text-stone-400">Join ShopSphere with email verification.</p>
          </div>

          <div className="mb-5 space-y-3 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
            <GoogleAuthButton mode="register" onSuccess={handleGoogleSuccess} />
            <div className="relative py-1 text-center text-xs uppercase tracking-wider text-stone-400">
              <span className="relative z-10 bg-white px-3 dark:bg-stone-900">Or create account with email</span>
              <div className="absolute left-0 top-1/2 h-px w-full bg-stone-200 dark:bg-stone-800" />
            </div>
          </div>

          {step === 'details' ? (
          <form onSubmit={submitDetails} className="space-y-5 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Sharma"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-stone-900 placeholder-stone-400 transition-all focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white dark:focus:ring-stone-700"
                />
              </div>
            </div>

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
                  placeholder="Create a strong password"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-12 text-stone-900 placeholder-stone-400 transition-all focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white dark:focus:ring-stone-700"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : 'bg-stone-200 dark:bg-stone-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-stone-500">{strengthLabels[strength - 1] || 'Enter password'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-stone-900 placeholder-stone-400 transition-all focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white dark:focus:ring-stone-700"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
              )}
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400">
              By creating an account, you agree to our{' '}
              <span className="cursor-pointer text-stone-900 dark:text-white">Terms of Service</span> and{' '}
              <span className="cursor-pointer text-stone-900 dark:text-white">Privacy Policy</span>.
            </p>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
            >
              {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-stone-950 dark:border-t-transparent" /> : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
            </motion.button>
          </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-5 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
                <p className="font-medium text-stone-900 dark:text-white">Verify your account</p>
                <p className="mt-1">We sent a code to {deliveryTarget || 'your selected channel'}.</p>
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
                  onClick={() => setStep('details')}
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
                {isVerifying ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-stone-950 dark:border-t-transparent" /> : <>Verify & Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
              </motion.button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-stone-600 dark:text-stone-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-stone-900 hover:underline dark:text-white">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default Register;
