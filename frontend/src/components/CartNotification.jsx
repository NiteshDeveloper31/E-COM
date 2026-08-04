import React from 'react';
import { Link } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import { X, CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartNotification() {
  const { showCartPopup, setShowCartPopup, lastAddedItem } = useReetSutra();

  if (!lastAddedItem) return null;

  const { product, quantity } = lastAddedItem;
  const discountedPrice = Math.round(product.price * (1 - product.discount / 100));

  return (
    <AnimatePresence>
      {showCartPopup && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
          className="fixed top-24 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[200] w-full max-w-[92vw] sm:max-w-md bg-glass border border-brand-gold/30 rounded-lg shadow-2xl p-4 md:p-5 flex flex-col space-y-4"
        >
          {/* Header check alert */}
          <div className="flex justify-between items-center pb-2 border-b border-brand-gold/10">
            <div className="flex items-center space-x-2 text-brand-green">
              <CheckCircle className="w-5 h-5 text-green-600 fill-green-50" />
              <span className="font-serif font-black text-sm md:text-base tracking-wide">Added to Cart!</span>
            </div>
            <button 
              onClick={() => setShowCartPopup(false)}
              className="p-1 rounded-full text-brand-green hover:bg-brand-cream hover:text-brand-gold transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Product details */}
          <div className="flex items-center space-x-4 font-sans">
            <div className="w-16 h-16 rounded overflow-hidden shrink-0 border border-brand-gold/10 bg-white">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif font-extrabold text-sm text-brand-green truncate">{product.name}</p>
              <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider mt-0.5">{product.category}</p>
              <p className="text-xs text-brand-charcoalLight mt-1 font-semibold">
                Qty: {quantity} • <span className="text-brand-green font-bold">₹{discountedPrice * quantity}</span>
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold uppercase tracking-wider font-sans">
            <Link
              to="/cart"
              onClick={() => setShowCartPopup(false)}
              className="py-2.5 bg-white border border-brand-green text-brand-green hover:bg-brand-cream rounded transition-colors text-center"
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              onClick={() => setShowCartPopup(false)}
              className="py-2.5 bg-brand-green text-brand-cream hover:bg-brand-greenDark rounded transition-colors flex items-center justify-center space-x-1.5 shadow-gold-glow"
            >
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
