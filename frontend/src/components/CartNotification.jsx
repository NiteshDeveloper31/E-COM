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
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 xs:top-20 sm:top-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-[380px] z-[999] bg-[#FAF6EF] border border-[#C5972E]/40 rounded-xl shadow-2xl p-4 sm:p-5 flex flex-col space-y-3.5"
        >
          {/* Header check alert */}
          <div className="flex justify-between items-center pb-2.5 border-b border-[#C5972E]/20">
            <div className="flex items-center space-x-2 text-[#143021]">
              <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-50 shrink-0" />
              <span className="font-serif font-extrabold text-sm sm:text-base tracking-wide text-[#143021]">Added to Cart!</span>
            </div>
            <button 
              onClick={() => setShowCartPopup(false)}
              className="p-1 rounded-full text-[#143021] hover:bg-[#143021]/10 hover:text-[#C5972E] transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Product details */}
          <div className="flex items-center space-x-3.5 font-sans">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[#C5972E]/20 bg-white shadow-xs">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif font-extrabold text-sm text-[#143021] truncate">{product.name}</p>
              <p className="text-[10px] text-[#C5972E] font-extrabold uppercase tracking-wider mt-0.5">{product.category}</p>
              <p className="text-xs text-[#143021]/80 mt-1 font-semibold">
                Qty: {quantity} • <span className="text-[#143021] font-bold">₹{discountedPrice * quantity}</span>
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 text-center text-xs font-extrabold uppercase tracking-wider font-sans">
            <Link
              to="/cart"
              onClick={() => setShowCartPopup(false)}
              className="py-2.5 bg-white border border-[#143021] text-[#143021] hover:bg-[#143021] hover:text-[#C5972E] rounded-lg transition-colors text-center cursor-pointer shadow-xs"
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              onClick={() => setShowCartPopup(false)}
              className="py-2.5 bg-[#143021] text-[#C5972E] hover:bg-[#0E2317] rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-md cursor-pointer border border-[#143021]"
            >
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5972E]" />
            </Link>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
