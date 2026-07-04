import React from 'react';
import { motion } from 'framer-motion';
import { useGetProductsQuery } from '../redux/api/productApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Deals = () => {
  const { data, isLoading } = useGetProductsQuery({ keyword: 'deal' });

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-950/20 transition-colors duration-300">
      {/* Hero */}
      <section className="bg-red-600 text-white py-16 text-center border-b-[10px] border-red-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 flex items-center justify-around">
           <span className="text-9xl font-black transform -rotate-12">%</span>
           <span className="text-9xl font-black transform rotate-12">%</span>
        </div>
        <motion.h1 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-6xl md:text-8xl font-black mb-4 uppercase tracking-tighter">
          Flash Deals
        </motion.h1>
        <p className="relative z-10 text-xl font-bold">Up to 70% off. Hurry before time runs out!</p>
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

export default Deals;
