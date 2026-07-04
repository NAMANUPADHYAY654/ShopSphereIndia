import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../redux/api/productApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Fashion = () => {
  const { data, isLoading } = useGetProductsQuery({ keyword: 'fashion' });

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors duration-300">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 to-orange-400 text-white py-32">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold uppercase tracking-widest mb-4">SS26 Collection</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-8xl font-black mb-6 italic">
            STREET X LUXE
          </motion.h1>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Trending Styles</h2>
        {isLoading ? (
          <div className="flex justify-center"><Loader /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.products?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Fashion;
