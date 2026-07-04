import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../redux/api/productApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const CATEGORY_ICONS = {
  'Electronics': '💻',
  'Fashion Men': '👔',
  'Fashion Women': '👗',
  'Home & Kitchen': '🏠',
  'Books & Stationery': '📚',
  'Health & Beauty': '✨',
  'Sports & Fitness': '🏃',
  'Gaming': '🎮',
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    category: selectedCategory,
    sort,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ keyword, category: selectedCategory });
  };

  const handleCategorySelect = (slug) => {
    setSelectedCategory(selectedCategory === slug ? '' : slug);
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setSort('');
    setPriceRange([0, 100000]);
    setSearchParams({});
  };

  const hasFilters = keyword || selectedCategory || sort;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2"
          >
            All Products
          </motion.h1>
          <p className="text-white/80">
            {data?.totalProducts ? `${data.totalProducts} products found` : 'Explore our collection'}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-500 flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wide">Categories</h4>
                <div className="space-y-1">
                  {categoriesData?.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleCategorySelect(cat._id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center space-x-2 ${selectedCategory === cat._id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <span>{CATEGORY_ICONS[cat.name] || '📦'}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wide">Sort By</h4>
                <div className="space-y-1">
                  {[
                    { label: 'Newest First', value: '-createdAt' },
                    { label: 'Price: Low to High', value: 'price' },
                    { label: 'Price: High to Low', value: '-price' },
                    { label: 'Top Rated', value: '-ratings' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSort(sort === opt.value ? '' : opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${sort === opt.value
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wide">Quick Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {['Bestseller', 'New Arrival', 'Trending'].map((tag) => (
                    <button key={tag} className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
                Showing {data?.products?.length || 0} of {data?.totalProducts || 0} products
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 text-lg">Failed to load products. Please try again.</p>
              </div>
            ) : data?.products?.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {data?.products?.map((product) => (
                  <motion.div
                    key={product._id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
