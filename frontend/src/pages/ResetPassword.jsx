import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, ShoppingBag, ShieldCheck, CheckCircle } from 'lucide-react';
import { useResetPasswordMutation } from '../redux/api/authApiSlice';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await resetPassword({ token, password }).unwrap();
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || 'Reset failed. The link may have expired.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-white">Invalid reset link</h2>
          <p className="mt-2 text-stone-600 dark:text-stone-400">This link is missing or invalid.</p>
          <Link to="/forgot-password" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-white hover:underline">
            <ArrowLeft className="w-4 h-4" /> Request a new link
          </Link>
        </div>
      </div>
    );
  }

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
              Create a new password
            </h1>
            <p className="mt-4 text-base leading-7 text-stone-600 dark:text-stone-400">
              Choose a strong password that you haven't used before.
            </p>
            <div className="mt-8 space-y-3 text-sm text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-emerald-600" />At least 8 characters</div>
              <div className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-emerald-600" />Uppercase & lowercase letters</div>
              <div className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-emerald-600" />At least one number & special character</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md"
          >
            <div className="lg:hidden flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center dark:bg-white">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-stone-900 dark:text-white">ShopSphere India</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-stone-900 dark:text-white">Reset password</h2>
              <p className="mt-2 text-stone-600 dark:text-stone-400">Enter your new password below.</p>
            </div>

            <form onSubmit={submitHandler} className="space-y-5 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
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

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-stone-900 placeholder-stone-400 transition-all focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white dark:focus:ring-stone-700"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
              >
                {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-stone-950 dark:border-t-transparent" /> : 'Reset Password'}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;