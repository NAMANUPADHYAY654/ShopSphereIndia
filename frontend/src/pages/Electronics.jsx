import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Laptop, Smartphone, Watch, Headphones } from 'lucide-react';
import { useGetProductsQuery } from '../redux/api/productApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Electronics = () => {
  const { data, isLoading } = useGetProductsQuery({ keyword: 'electronics' });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Hero */}
      <section className="relative overflow-hidden bg-black text-white py-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-600/30 blur-[100px] rounded-full"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black mb-6">
            Tech <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-primary-400">Unleashed</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover cutting-edge electronics, from next-gen smartphones to immersive audio.
          </motion.p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center"><Loader /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.products?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Electronics;
