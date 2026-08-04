import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart } = useReetSutra();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Math Calculations
  const subtotal = cart.reduce((acc, item) => {
    const discountedPrice = Math.round(item.product.price * (1 - item.product.discount / 100));
    return acc + (discountedPrice * item.quantity);
  }, 0);

  const deliveryCharge = subtotal > 799 || subtotal === 0 ? 0 : 70;
  
  const discountAmount = Math.round(subtotal * (appliedDiscountPercent / 100));
  const finalTotal = subtotal - discountAmount + deliveryCharge;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const code = couponCode.trim().toUpperCase();
    if (code === 'BIHAR15') {
      setAppliedDiscountPercent(15);
      setCouponSuccess('✓ Coupon applied: 15% off on your heritage order!');
    } else if (code === 'FESTIVE10') {
      setAppliedDiscountPercent(10);
      setCouponSuccess('✓ Coupon applied: 10% off on all sweets!');
    } else if (code === 'FREESHIP' && subtotal < 799) {
      // Custom logic
      setCouponSuccess('✓ Free Shipping applied!');
    } else {
      setCouponError('✗ Invalid Coupon Code. Try "BIHAR15" or "FESTIVE10".');
    }
  };

  const handleProceedToCheckout = () => {
    // Navigate and pass state or handle checkout routing
    navigate('/checkout', {
      state: {
        subtotal,
        discount: discountAmount,
        deliveryCharge,
        total: finalTotal
      }
    });
  };

  if (cartCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6 min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-brand-cream border-2 border-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold mx-auto shadow-md">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-brand-green font-serif">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs md:text-sm text-brand-charcoalLight max-w-sm mx-auto leading-relaxed">
          Add some delicious, handcrafted delicacies from the fields of Bihar to start your culinary journey.
        </p>
        <Link
          to="/shop"
          className="bg-brand-green hover:bg-brand-greenDark text-brand-cream py-3 px-8 rounded font-sans text-xs font-bold tracking-widest uppercase transition-colors inline-block"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-extrabold text-brand-green font-serif">
          Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs text-brand-charcoalLight uppercase tracking-wider font-semibold">
          Review your items and proceed to secure checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Cart Items list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cart Header */}
          <div className="hidden sm:grid grid-cols-6 text-xs text-brand-gold font-bold uppercase tracking-wider border-b border-brand-creamDark pb-3 font-sans">
            <span className="col-span-3">Product Description</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            {cart.map((item) => {
              const discountedPrice = Math.round(item.product.price * (1 - item.product.discount / 100));
              return (
                <div 
                  key={item.product.id}
                  className="bg-brand-ivory border border-brand-gold/10 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-6 items-center gap-4 shadow-sm hover:shadow-premium transition-all duration-300"
                >
                  
                  {/* Thumbnail & Description */}
                  <div className="col-span-3 flex items-center space-x-4">
                    <div className="w-16 h-16 rounded overflow-hidden shrink-0 border border-brand-creamDark bg-white">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link 
                        to={`/product/${item.product.id}`}
                        className="font-bold text-sm md:text-base text-brand-green font-serif hover:text-brand-gold line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-[10px] text-brand-gold font-bold uppercase font-sans tracking-wide mt-0.5">
                        {item.product.category} • {item.product.weight}
                      </p>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-widest flex items-center space-x-1 mt-2 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Item</span>
                      </button>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="text-left sm:text-center">
                    <span className="sm:hidden text-xs text-brand-charcoalLight mr-2 font-bold font-sans">Price:</span>
                    <span className="font-extrabold text-brand-green">₹{discountedPrice}</span>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex justify-start sm:justify-center">
                    <div className="flex items-center justify-between border border-brand-gold/20 rounded bg-white w-28">
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-brand-green hover:bg-brand-cream font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-brand-green">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-brand-green hover:bg-brand-cream font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="text-left sm:text-right">
                    <span className="sm:hidden text-xs text-brand-charcoalLight mr-2 font-bold font-sans">Total:</span>
                    <span className="font-black text-brand-green text-sm md:text-base">₹{discountedPrice * item.quantity}</span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Cart Actions */}
          <div className="flex justify-between items-center pt-2">
            <Link 
              to="/shop"
              className="text-xs font-bold text-brand-gold hover:text-brand-green uppercase tracking-wider flex items-center space-x-1"
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
                placeholder="Enter coupon (e.g. BIHAR15)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-white border border-brand-gold/30 rounded px-3 py-2 text-xs font-sans text-brand-green uppercase focus:outline-none focus:border-brand-gold"
              />
              <button 
                type="submit"
                className="bg-brand-green hover:bg-brand-greenDark text-brand-cream py-2 px-4 rounded text-xs font-bold tracking-widest uppercase transition-colors"
              >
                Apply
              </button>
            </form>

            {couponError && <p className="text-[10px] text-red-500 font-bold font-sans">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] text-green-600 font-bold font-sans">{couponSuccess}</p>}

            <div className="pt-2 text-[10px] text-brand-charcoalLight/60 font-sans italic space-y-1">
              <p>💡 Tip: Use <span className="font-bold text-brand-gold">BIHAR15</span> for 15% off orders.</p>
              <p>💡 Tip: Use <span className="font-bold text-brand-gold">FESTIVE10</span> for 10% off orders.</p>
            </div>
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
              
              {appliedDiscountPercent > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon Discount ({appliedDiscountPercent}%)</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-bold text-brand-green">
                  {deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="border-t border-brand-creamDark pt-3.5 flex justify-between text-base md:text-lg font-extrabold text-brand-green">
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
