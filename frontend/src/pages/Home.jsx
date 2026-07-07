import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Truck, Shield, RefreshCw, Headphones, Zap, Sparkles } from 'lucide-react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../redux/api/productApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const CATEGORY_ICONS = {
  'Electronics': '💻', 'Fashion Men': '👔', 'Fashion Women': '👗',
  'Home & Kitchen': '🏠', 'Books & Stationery': '📚',
  'Health & Beauty': '✨', 'Sports & Fitness': '🏃', 'Gaming': '🎮',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Home = () => {
  const { data: trendingData, isLoading: loadingTrending } = useGetProductsQuery({ isTrending: 'true' });
  const { data: bestsellerData, isLoading: loadingBest } = useGetProductsQuery({ isBestSeller: 'true' });
  const { data: allProducts, isLoading: loadingAll } = useGetProductsQuery({}); // For "New Arrivals"
  const { data: categories } = useGetCategoriesQuery();

  return (
    <div className="overflow-hidden bg-gray-50 dark:bg-dark-bg transition-colors duration-300">

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gray-50 dark:bg-dark-bg">
        {/* Futuristic Background grid & glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary-600/30 rounded-full blur-[120px]" />
          <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 20, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full py-20">
          <div className="text-gray-900 dark:text-white">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center space-x-2 bg-white/50 dark:bg-dark-card/50 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-gray-200 dark:border-gray-800">
              <span className="text-sm font-medium">🇮🇳 Built for Indian shoppers</span>
              <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse" />
              <span className="text-sm text-accent-600 dark:text-accent-400 font-bold">Fast checkout</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-5xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
              Shop Indian brands <br/>
              <span className="text-gradient">with speed</span>
              <br />and trust.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
              Discover everyday essentials, festival gifts, and premium products curated for Indian homes, delivered with speed.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4">
              <Link to="/products"
                className="inline-flex items-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:scale-105 transition-all shadow-xl dark:shadow-white/10 group">
                Start Exploring <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/products?isBestSeller=true"
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-dark-card text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary-500 transition-all">
                <Sparkles className="w-4 h-4 mr-2 text-primary-500" /> Bestsellers
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center space-x-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              {[['10K+', 'Curated Items'], ['50K+', 'Active Users'], ['4.9★', 'Trust Score']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{val}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mt-1">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero visual - Abstract Glassmorphism Design */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            className="hidden lg:flex justify-center items-center relative h-[500px]">
            
            {/* Main Glass Card */}
            <div className="absolute z-20 w-72 h-96 glass rounded-[2.5rem] flex flex-col items-center justify-center p-8 rotate-[-5deg] hover:rotate-0 transition-transform duration-500 cursor-pointer">
              <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-tr from-primary-400 to-accent-400 p-1 animate-spin-slow">
                <div className="w-full h-full bg-white dark:bg-dark-card rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-900 dark:text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Smart Cart</h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">AI-powered recommendations based on your style.</p>
            </div>

            {/* Floating Elements */}
            <motion.div animate={{ y: [-15, 15, -15] }} transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-10 right-0 z-30 glass px-6 py-4 rounded-2xl flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Secure</p>
                <p className="text-xs text-gray-500">Checkout</p>
              </div>
            </motion.div>

            <motion.div animate={{ y: [15, -15, 15] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-20 left-0 z-30 glass px-6 py-4 rounded-2xl flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Lightning</p>
                <p className="text-xs text-gray-500">Delivery</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ─── BRAND MARQUEE (NEW BAR) ─── */}
      <section className="border-y border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-dark-card/30 backdrop-blur-md overflow-hidden py-4">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap items-center px-4">
          {/* Repeat brands for smooth loop */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex space-x-12 items-center opacity-50 dark:opacity-40 font-black text-2xl tracking-widest text-gray-400">
              <span>TATA</span>
              <span>•</span>
              <span>RELIANCE</span>
              <span>•</span>
              <span>BOAT</span>
              <span>•</span>
              <span>HAVELLS</span>
              <span>•</span>
              <span>FASTRACK</span>
              <span>•</span>
              <span>DABUR</span>
              <span>•</span>
              <span>BATA</span>
              <span>•</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">Explore Categories</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Find exactly what you're looking for</p>
          </div>
          <Link to="/products" className="hidden md:flex items-center text-primary-600 font-bold hover:text-primary-500 hover:underline">
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories?.map((cat) => (
            <motion.div key={cat._id} variants={itemVariants}>
              <Link to={`/products?category=${cat._id}`}
                className="group flex flex-col items-center p-6 bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-gray-800 hover:border-primary-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{CATEGORY_ICONS[cat.name] || '📦'}</div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{cat.name}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── TRENDING NOW (Updated UI) ─── */}
      <section className="py-20 bg-gray-100 dark:bg-dark-card/30 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">Trending Now</h2>
            </div>
            <Link to="/products?isTrending=true" className="hidden md:flex items-center text-primary-600 font-bold hover:text-primary-500 hover:underline">
              See All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </motion.div>

          {loadingTrending ? <div className="flex justify-center py-12"><Loader /></div> : (
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingData?.products?.slice(0, 4).map((product) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── PROMO BANNERS ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-10 text-white border border-gray-800 shadow-2xl group">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 text-9xl opacity-10 group-hover:scale-110 transition-transform duration-700">🎮</div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent-400 mb-2">New Arrival</p>
            <h3 className="text-4xl font-black mb-4 leading-tight">Next-Gen<br/>Gaming Gear</h3>
            <p className="mb-8 text-gray-400 max-w-xs">Elevate your play with the latest consoles and accessories.</p>
            <Link to="/products?keyword=gaming" className="inline-flex items-center px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Shop Gaming <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-purple-900 rounded-[2.5rem] p-10 text-white border border-primary-800 shadow-2xl group">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 text-9xl opacity-10 group-hover:scale-110 transition-transform duration-700">🎧</div>
            <p className="text-sm font-bold uppercase tracking-widest text-purple-200 mb-2">Premium Audio</p>
            <h3 className="text-4xl font-black mb-4 leading-tight">Immersive<br/>Soundscapes</h3>
            <p className="mb-8 text-purple-100 max-w-xs">Experience studio quality sound anywhere you go.</p>
            <Link to="/products?keyword=audio" className="inline-flex items-center px-6 py-3 bg-white text-primary-900 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Shop Audio <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── NEW ARRIVALS (New Bar) ─── */}
      <section className="py-20 bg-gray-50 dark:bg-dark-bg border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">New Arrivals</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Fresh drops added this week</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center text-primary-600 font-bold hover:text-primary-500 hover:underline">
              See All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </motion.div>

          {loadingAll ? <div className="flex justify-center py-12"><Loader /></div> : (
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Slicing from the end to simulate "new" items if not sorted by date */}
              {allProducts?.products?.slice(-4).reverse().map((product) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gray-900 dark:bg-black">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary-600/20 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black text-white mb-4">Join the Future.</h2>
            <p className="text-gray-400 mb-10 text-lg">Subscribe to get exclusive access to drops, AI-curated deals, and early bird discounts.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <button type="submit" className="px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
