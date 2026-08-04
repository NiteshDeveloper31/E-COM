import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};

  useEffect(() => {
    // If no order ID, redirect to home
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-8 min-h-[75vh] flex flex-col justify-center items-center">
      
      {/* Animated Checkmark */}
      <div className="w-24 h-24 bg-brand-cream border border-brand-gold/30 rounded-full flex items-center justify-center text-brand-gold shadow-gold-glow animate-pulse">
        <CheckCircle2 className="w-14 h-14 fill-brand-green text-brand-cream" />
      </div>

      {/* Greetings */}
      <div className="space-y-3">
        <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-brand-gold uppercase block">
          TRANSACTION COMPLETED
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-brand-green font-serif">
          Order Placed!
        </h1>
        <p className="text-sm md:text-base text-brand-charcoalLight max-w-sm mx-auto leading-relaxed font-sans">
          Pranam! Your request for traditional delicacies is received and sent to our artisan kitchens in Bihar.
        </p>
      </div>

      {/* Order Info Panel */}
      <div className="bg-brand-ivory border border-brand-gold/15 rounded-lg p-6 w-full shadow-premium text-left space-y-3 font-sans text-xs md:text-sm text-brand-charcoalLight">
        <div className="flex justify-between border-b border-brand-creamDark pb-2.5">
          <span className="font-medium">Order ID:</span>
          <span className="font-extrabold text-brand-green tracking-wider">{orderId}</span>
        </div>
        <div className="flex justify-between border-b border-brand-creamDark pb-2.5">
          <span className="font-medium">Delivery Speed:</span>
          <span className="font-bold text-brand-green">Standard Home Delivery</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Expected Date:</span>
          <span className="font-bold text-brand-gold font-serif">
            {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Story hook */}
      <p className="text-[11px] md:text-xs text-brand-charcoalLight/60 font-sans leading-relaxed italic max-w-sm">
        "रीत हमारी, स्वाद हमारी, साथ अपनों का। In choosing ReetSutra, you support local women collectives and help protect generations of Bihar's food heritage."
      </p>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        
        <Link
          to={`/profile/track-order/${orderId}`}
          className="bg-brand-green hover:bg-brand-greenDark text-brand-cream py-3.5 px-6 rounded font-sans text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center space-x-2 shadow-gold-glow"
        >
          <span>Track Active Order</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/shop"
          className="bg-white hover:bg-brand-cream border border-brand-green text-brand-green py-3.5 px-6 rounded font-sans text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center space-x-1"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Back to Shop</span>
        </Link>

      </div>

    </div>
  );
}
