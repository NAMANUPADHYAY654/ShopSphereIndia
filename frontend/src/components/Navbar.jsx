import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Heart, Sun, Moon, Search, Menu, X } from 'lucide-react';
import { toggleTheme } from '../redux/slices/themeSlice';
import { logout } from '../redux/slices/authSlice';
import { useLogoutMutation } from '../redux/api/authApiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Electronics', to: '/electronics' },
  { label: 'Fashion', to: '/fashion' },
  { label: 'Deals', to: '/deals' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode } = useSelector((state) => state.theme);
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const [logoutApiCall] = useLogoutMutation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed w-full z-50 border-b border-stone-200 bg-white/90 backdrop-blur-sm transition-all duration-300 dark:border-stone-800 dark:bg-stone-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-900 dark:bg-white">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden text-xl font-semibold text-stone-900 dark:text-white sm:block"
            >
              ShopSphere India
            </motion.span>
          </Link>

          {/* Center Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-4 text-sm text-stone-900 transition-all focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:ring-stone-700"
              />
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="rounded-xl p-2 text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-900"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="hidden rounded-xl p-2 text-stone-600 transition-colors hover:bg-stone-100 md:flex dark:text-stone-400 dark:hover:bg-stone-900">
              <Heart size={18} />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative rounded-xl p-2 text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-900">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white dark:bg-white dark:text-stone-950">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 rounded-xl px-3 py-1.5 transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white dark:bg-white dark:text-stone-950">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden max-w-[80px] truncate text-sm font-medium text-stone-700 md:block dark:text-stone-300">
                    {userInfo.name.split(' ')[0]}
                  </span>
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
                        className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-stone-200 bg-white py-2 shadow-xl dark:border-stone-800 dark:bg-stone-900"
                      >
                        <div className="border-b border-stone-100 px-4 py-3 dark:border-stone-800">
                          <p className="text-sm font-semibold text-stone-900 dark:text-white">{userInfo.name}</p>
                          <p className="truncate text-xs text-stone-500">{userInfo.email}</p>
                        </div>

                        {userInfo.role === 'admin' ? (
                          <>
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-50 dark:text-white dark:hover:bg-stone-800"
                            >
                              Admin dashboard
                            </Link>
                            <Link
                              to="/profile"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                              Profile
                            </Link>
                          </>
                        ) : userInfo.role === 'seller' ? (
                          <>
                            <Link
                              to="/seller/dashboard"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-50 dark:text-white dark:hover:bg-stone-800"
                            >
                              Seller dashboard
                            </Link>
                            <Link
                              to="/profile"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                              Profile
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                              Orders
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/profile"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                              Profile
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                              Orders
                            </Link>
                            <Link
                              to="/track"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                              Track package
                            </Link>
                            <Link
                              to="/complaints"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                              Complaints
                            </Link>
                            <Link
                              to="/wishlist"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                              Wishlist
                            </Link>
                            <div className="my-1 border-t border-stone-100 dark:border-stone-800" />
                            <Link
                              to="/seller/onboard"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-50 dark:text-white dark:hover:bg-stone-800"
                            >
                              Become a seller
                            </Link>
                          </>
                        )}
                        <div className="my-1 border-t border-stone-100 dark:border-stone-800" />
                        <button
                          onClick={logoutHandler}
                          className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="hidden px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:text-stone-900 md:block dark:text-stone-300 dark:hover:text-white">
                  Sign In
                </Link>
                <Link to="/register" className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="rounded-xl p-2 text-stone-700 hover:bg-stone-100 lg:hidden dark:text-stone-300 dark:hover:bg-stone-900"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-1 border-t border-stone-100 py-4 lg:hidden dark:border-stone-800"
            >
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-4 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:ring-stone-700"
                  />
                </div>
              </form>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-900"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-stone-200 dark:border-stone-800" />

              <button
                onClick={() => { dispatch(toggleTheme()); setIsMobileOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-900"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
