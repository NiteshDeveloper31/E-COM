import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

import { API_BASE_URL } from '../config';

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart } = useReetSutra();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscountAmount, setAppliedDiscountAmount] = useState(0);
  const [appliedCouponData, setAppliedCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Math Calculations
  const subtotal = cart.reduce((acc, item) => {
    const discountedPrice = Math.round(item.product.price * (1 - item.product.discount / 100));
    return acc + (discountedPrice * item.quantity);
  }, 0);

  const deliveryCharge = subtotal > 799 || subtotal === 0 ? 0 : 70;
  
  const discountAmount = appliedDiscountAmount;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponCode.trim()) {
      setCouponError('Please enter a valid coupon code.');
      return;
    }

    try {
      setIsValidatingCoupon(true);
      const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          cartSubtotal: subtotal,
          cartItems: cart
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAppliedDiscountAmount(data.data.discountAmount || 0);
        setAppliedCouponData(data.data.coupon || null);
        setCouponSuccess(data.message || '✓ Coupon applied successfully!');
      } else {
        setAppliedDiscountAmount(0);
        setAppliedCouponData(null);
        setCouponError(data.message || 'Invalid coupon code.');
      }
    } catch (err) {
      console.error("Error validating coupon code:", err);
      // Fallback for offline/mock demo codes if backend API server is down
      const code = couponCode.trim().toUpperCase();
      if (code === 'BIHAR15') {
        const amt = Math.round(subtotal * 0.15);
        setAppliedDiscountAmount(amt);
        setCouponSuccess('✓ Coupon applied: 15% off on your heritage order!');
      } else if (code === 'FESTIVE10') {
        const amt = Math.round(subtotal * 0.10);
        setAppliedDiscountAmount(amt);
        setCouponSuccess('✓ Coupon applied: 10% off on all sweets!');
      } else {
        setCouponError('Error connecting to coupon validation service.');
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        subtotal,
        discount: discountAmount,
        couponCode: appliedCouponData?.code || couponCode,
        deliveryCharge,
        total: finalTotal
      }
    });
  };

  if (cartCount === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-cream border border-brand-gold/20 rounded-full flex items-center justify-center mx-auto text-brand-gold">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-brand-green font-serif">Your Cart is Empty</h2>
        <p className="text-sm text-brand-charcoalLight max-w-md mx-auto font-sans">
          Looks like you haven't added any of our authentic traditional Bihari delicacies to your cart yet.
        </p>
        <Link 
          to="/shop" 
          className="inline-flex items-center space-x-2 bg-brand-green hover:bg-brand-greenDark text-brand-cream px-8 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <span>Explore Heritage Treats</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title */}
      <div className="border-b border-brand-creamDark pb-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-green font-serif">
          Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs md:text-sm text-brand-charcoalLight mt-1 font-sans">
          Review your selection of artisanal Bihari delicacies before proceeding to checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-brand-ivory border border-brand-gold/10 rounded-lg overflow-hidden shadow-premium">
            <div className="divide-y divide-brand-creamDark">
              {cart.map((item) => {
                const discountedPrice = Math.round(item.product.price * (1 - item.product.discount / 100));
                const itemTotal = discountedPrice * item.quantity;

                return (
                  <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    
                    {/* Item Image */}
                    <Link to={`/product/${item.product.id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded overflow-hidden border border-brand-gold/20 shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <span className="text-[10px] text-brand-gold uppercase tracking-widest font-bold font-sans">
                        {item.product.category}
                      </span>
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="text-base font-bold text-brand-green font-serif hover:text-brand-gold transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-brand-charcoalLight font-sans">
                        Net Weight: <span className="font-semibold text-brand-green">{item.product.weight}</span>
                      </p>
                      
                      <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1 font-sans">
                        <span className="text-sm font-bold text-brand-green">₹{discountedPrice}</span>
                        {item.product.discount > 0 && (
                          <span className="text-xs text-brand-charcoalLight line-through">
                            ₹{item.product.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Total */}
                    <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-4">
                      
                      {/* Quantity Buttons */}
                      <div className="flex items-center border border-brand-gold/30 rounded overflow-hidden bg-white">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-brand-green hover:bg-brand-cream text-xs font-bold"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-brand-green font-sans">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-brand-green hover:bg-brand-cream text-xs font-bold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total & Remove */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-brand-green font-sans">
                          ₹{itemTotal}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-brand-charcoalLight hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link 
              to="/shop" 
              className="text-xs font-bold text-brand-green hover:text-brand-gold flex items-center space-x-1 transition-colors uppercase tracking-widest font-sans"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>

        </div>

        {/* Right Side: Order Summary Card */}
        <div className="space-y-6">
          
          {/* Coupon Code Input */}
          <div className="bg-brand-ivory border border-brand-gold/10 rounded-lg p-6 shadow-premium space-y-4">
            <h3 className="font-bold text-xs text-brand-green tracking-wider uppercase flex items-center space-x-2 font-serif border-b border-brand-creamDark pb-3">
              <Tag className="w-4 h-4 text-brand-gold" />
              <span>Apply Promo Coupon</span>
            </h3>
            
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-white border border-brand-gold/30 rounded px-3 py-2 text-xs font-sans text-brand-green uppercase focus:outline-none focus:border-brand-gold"
              />
              <button 
                type="submit"
                disabled={isValidatingCoupon}
                className="bg-brand-green hover:bg-brand-greenDark text-brand-cream py-2 px-4 rounded text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isValidatingCoupon ? 'Checking...' : 'Apply'}
              </button>
            </form>

            {couponError && <p className="text-[11px] text-red-500 font-bold font-sans">{couponError}</p>}
            {couponSuccess && <p className="text-[11px] text-green-600 font-bold font-sans">{couponSuccess}</p>}
          </div>

          {/* Checkout Totals Summary */}
          <div className="bg-brand-ivory border border-brand-gold/10 rounded-lg p-6 shadow-premium space-y-6">
            <h3 className="font-bold text-sm text-brand-green tracking-wider uppercase font-serif border-b border-brand-creamDark pb-3">
              Order Summary
            </h3>

            <div className="space-y-3.5 text-xs md:text-sm text-brand-charcoalLight font-sans">
              
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-brand-green">₹{subtotal}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon Discount {appliedCouponData?.code ? `(${appliedCouponData.code})` : ''}</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>Total Amount</span>
                <span className="text-brand-gold font-black">₹{finalTotal}</span>
              </div>

            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-brand-green hover:bg-brand-greenDark text-brand-cream py-4 rounded font-sans text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center space-x-2 shadow-gold-glow"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {deliveryCharge > 0 && (
              <p className="text-[10px] text-brand-gold font-bold text-center font-sans tracking-wide">
                💡 Add ₹{800 - subtotal} more to unlock FREE SHIPPING!
              </p>
            )}

            <div className="pt-4 border-t border-brand-creamDark flex items-center justify-center space-x-2 text-[10px] text-brand-charcoalLight/70 font-sans">
              <ShieldCheck className="w-4.5 h-4.5 text-brand-gold" />
              <span>Safe & Secure Payments Only</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
