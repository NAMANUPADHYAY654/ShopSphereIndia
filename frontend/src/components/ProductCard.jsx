import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const inCart = cartItems.find((x) => x._id === product._id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('This product is out of stock');
      return;
    }
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      qty: 1,
      category: product.category,
    }));
    toast.success(`${product.name.slice(0, 30)}... added to cart!`, {
      icon: '🛒',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700 group cursor-pointer"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🛍️</div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isBestSeller && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">BESTSELLER</span>
          )}
          {product.isNewArrival && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
            className={`w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-colors ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}
            className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary-500 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Add to Cart Overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-3 text-white text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${inCart ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary-600 hover:bg-primary-700'} disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{product.stock === 0 ? 'Out of Stock' : inCart ? 'Added ✓' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-primary-500 font-medium mb-1 uppercase tracking-wide">
          {product.category?.name || 'General'}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(product.ratings) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">({product.numOfReviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {inCart && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
              In Cart
            </span>
          )}
        </div>

        {product.stock < 5 && product.stock > 0 && (
          <p className="text-xs text-orange-500 mt-1 font-medium">Only {product.stock} left!</p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-500 mt-1 font-medium">Out of Stock</p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
