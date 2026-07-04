import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-gradient block mb-4">
              ShopSphere
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Your premium destination for modern shopping in India. Quality products, fast delivery, and exceptional customer service.
            </p>
            <div className="flex space-x-4 text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-primary-500 transition-colors">FB</a>
              <a href="#" className="hover:text-primary-500 transition-colors">TW</a>
              <a href="#" className="hover:text-primary-500 transition-colors">IG</a>
              <a href="#" className="hover:text-primary-500 transition-colors">YT</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">All Products</Link></li>
              <li><Link to="/products" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">Categories</Link></li>
              <li><Link to="/products" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">Trending Now</Link></li>
              <li><Link to="/products" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">Special Offers</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link to="/profile" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">My Account</Link></li>
              <li><Link to="/track" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">Track Package</Link></li>
              <li><Link to="/orders" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">My Orders</Link></li>
              <li><Link to="/complaints" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm">Register Complaint</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-primary-500 mt-0.5 mr-2" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">123 Commerce Avenue, Tech Park, Bangalore 560001, India</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-primary-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">+91 1800 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-primary-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">support@shopsphere.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center md:flex md:justify-between md:items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ShopSphere India. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6 justify-center">
            <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500">Privacy Policy</Link>
            <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
