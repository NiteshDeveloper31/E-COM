import React, { useState, useEffect } from 'react';
import { X, Bell, Mail, CheckCircle2 } from 'lucide-react';
import { useReetSutra } from '../context/ReetSutraContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotifyMeModal({ isOpen, onClose, product }) {
  const { user, subscribeStockNotification } = useReetSutra();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    } else {
      setEmail('');
    }
    setSubmitted(false);
  }, [user, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setLoading(true);
    const result = await subscribeStockNotification(product.id || product._id, email.trim());
    setLoading(false);

    if (result && result.success) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#FAF6EF] border border-[#C5972E]/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-[#143021] z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#143021]/60 hover:text-[#143021] hover:bg-[#143021]/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-extrabold text-[#143021]">Notification Set!</h3>
              <p className="text-xs text-[#143021]/80 max-w-xs mx-auto leading-relaxed">
                We will email <strong>{email}</strong> the moment <strong>{product.name}</strong> is back in stock.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#C5972E]/20">
                <div className="p-2.5 bg-[#143021] text-[#C5972E] rounded-xl shadow-xs">
                  <Bell className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-lg text-[#143021] leading-tight">Back in Stock Alert</h3>
                  <p className="text-[11px] text-[#C5972E] font-bold uppercase tracking-wider">Get Email Notification</p>
                </div>
              </div>

              {/* Product Info Preview */}
              <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl border border-[#C5972E]/20">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-[#C5972E]/20"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif font-bold text-xs text-[#143021] truncate">{product.name}</p>
                  <span className="text-[10px] text-rose-600 font-extrabold uppercase bg-rose-50 px-2 py-0.5 rounded-xs inline-block mt-0.5">Currently Out of Stock</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#143021]">
                  Email Address for Alert *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#C5972E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#C5972E]/40 rounded-xl text-xs font-semibold text-[#143021] placeholder-[#143021]/50 focus:outline-none focus:border-[#143021] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#143021] hover:bg-[#0E2317] text-[#C5972E] font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#C5972E]/30 cursor-pointer disabled:opacity-50"
              >
                <Bell className="w-4 h-4 text-[#C5972E]" />
                <span>{loading ? 'Subscribing...' : 'NOTIFY ME WHEN RESTOCKED'}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
