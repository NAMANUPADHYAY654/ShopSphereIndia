import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Settings, LogOut, Moon, Sun, ChevronDown, Activity, Users, ShieldAlert, Lock, MessageSquareWarning } from 'lucide-react';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { logout } from '../../redux/slices/authSlice';
import { useLogoutMutation } from '../../redux/api/authApiSlice';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode } = useSelector((state) => state.theme);
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      setIsDropdownOpen(false);
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      dispatch(logout());
      navigate('/');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Dedicated Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/admin/dashboard" className="flex items-center space-x-3 shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-lg font-black text-gray-900 dark:text-white block leading-tight"
                >
                  Shop<span className="text-primary-600">Sphere</span> <span className="text-gray-400 font-medium">| Enterprise</span>
                </motion.span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">AI Command Center</span>
              </div>
            </Link>

            {/* Quick Links */}
            <div className="hidden md:flex items-center space-x-6 mx-8">
              <Link to="/admin/dashboard" className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Activity size={16} /> Dashboard
              </Link>
              <Link to="/admin/moderation" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors">
                <ShieldAlert size={16} /> Moderation
              </Link>
              <Link to="/admin/sellers" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors">
                <Users size={16} /> Sellers
              </Link>
              <Link to="/admin/security" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors">
                <Lock size={16} /> Security
              </Link>
              <Link to="/admin/complaints" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors">
                <MessageSquareWarning size={16} /> Complaints
              </Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User Menu */}
              {userInfo && (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 pl-2 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-bold text-gray-700 dark:text-gray-300">
                      {userInfo.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl py-2 border border-gray-100 dark:border-gray-800 z-20"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <p className="text-sm font-black text-gray-900 dark:text-white">Admin Privileges</p>
                            <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
                          </div>
                          <Link
                            to="/admin/settings"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                          >
                            <Settings size={16} /> Global Settings
                          </Link>
                          <Link
                            to="/"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                          >
                            <Sparkles size={16} /> View Consumer Site
                          </Link>
                          <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                          <button
                            onClick={logoutHandler}
                            className="block w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-2"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        <div className="max-w-[1400px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
