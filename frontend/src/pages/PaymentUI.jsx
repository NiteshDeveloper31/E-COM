import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import { ShieldCheck, Lock, CreditCard, Smartphone, Landmark, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentUI() {
  const { placeOrder } = useReetSutra();
  const location = useLocation();
  const navigate = useNavigate();

  // Load order data from router state
  const orderDetails = location.state || {};

  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success'
  const [processingStep, setProcessingStep] = useState(0);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const getSteps = () => {
    if (orderDetails.paymentMethod === 'COD') {
      return [
        'Verifying Shipping Address...',
        'Verifying Billing Information...',
        'Checking Item Stock Availability...',
        'Confirming Order and Allocating Stock...'
      ];
    }
    return [
      'Initializing Secure Transaction Handshake...',
      'Encrypting Credentials (AES-256)...',
      'Verifying Funds Availability with Bank...',
      'Confirming Order and Allocating Stock...'
    ];
  };

  const steps = getSteps();

  useEffect(() => {
    if (!orderDetails.total) {
      navigate('/cart');
    }
  }, [orderDetails, navigate]);

  useEffect(() => {
    let timer;
    if (paymentStatus === 'processing') {
      if (processingStep < steps.length) {
        timer = setTimeout(() => {
          setProcessingStep(prev => prev + 1);
        }, 800);
      } else {
        // Place the order in state
        const executeOrderPlacement = async () => {
          try {
            const orderId = await placeOrder({
              subtotal: orderDetails.subtotal,
              discount: orderDetails.discount,
              deliveryCharge: orderDetails.deliveryCharge,
              total: orderDetails.total,
              address: orderDetails.address,
              paymentMethod: orderDetails.paymentMethod,
              buyNowItem: orderDetails.buyNowItem
            });

            if (orderId) {
              setPaymentStatus('success');
              setTimeout(() => {
                navigate('/order-success', {
                  state: { orderId }
                });
              }, 1200);
            } else {
              setPaymentStatus('idle');
            }
          } catch (err) {
            console.error("Failed to place order:", err);
            setPaymentStatus('idle');
          }
        };
        executeOrderPlacement();
      }
    }
    return () => clearTimeout(timer);
  }, [paymentStatus, processingStep, orderDetails, navigate, placeOrder, steps.length]);

  const handlePaySubmit = (e) => {
    e.preventDefault();
    setPaymentStatus('processing');
    setProcessingStep(0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 min-h-[80vh] flex flex-col justify-center">
      
      {paymentStatus === 'processing' ? (
        
        /* Processing Screen */
        <div className="bg-brand-ivory border border-brand-gold/10 p-10 rounded-lg text-center space-y-6 shadow-2xl flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-brand-gold border-t-brand-green rounded-full animate-spin" />
          <h2 className="text-xl md:text-2xl font-bold text-brand-green font-serif">
            Processing Secure Payment
          </h2>
          <div className="space-y-2 max-w-sm">
            <p className="text-xs md:text-sm text-brand-charcoalLight font-sans font-medium transition-all">
              {steps[processingStep] || 'Finalizing...'}
            </p>
            {/* Custom loader bar */}
            <div className="w-48 h-1.5 bg-brand-creamDark rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-brand-gold transition-all duration-700" 
                style={{ width: `${(processingStep / steps.length) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-brand-charcoalLight/60 flex items-center justify-center space-x-1 font-sans">
            <Lock className="w-3.5 h-3.5" />
            <span>Do not refresh the page or press back button.</span>
          </p>
        </div>

      ) : paymentStatus === 'success' ? (
        
        /* Success Screen transition */
        <div className="bg-brand-ivory border border-brand-gold/10 p-10 rounded-lg text-center space-y-4 shadow-2xl flex flex-col items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
          <h2 className="text-xl md:text-2xl font-bold text-brand-green font-serif">
            {orderDetails.paymentMethod === 'COD' ? 'Order Confirmed!' : 'Transaction Authorized'}
          </h2>
          <p className="text-xs md:text-sm text-brand-charcoalLight font-sans">
            {orderDetails.paymentMethod === 'COD' 
              ? 'Your Cash On Delivery order has been successfully placed.' 
              : 'Your payment was authenticated successfully. Generating invoice...'}
          </p>
        </div>

      ) : (

        /* Payment Forms */
        <div className="bg-brand-ivory border border-brand-gold/10 rounded-lg overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="bg-brand-green p-6 text-brand-cream text-center space-y-1">
            <h2 className="text-lg md:text-xl font-bold font-serif tracking-wider">
              Simulated Payment Portal
            </h2>
            <p className="text-[11px] text-brand-cream/80 uppercase tracking-widest font-semibold font-sans">
              Paying ReetSutra: <span className="text-brand-gold">₹{orderDetails.total}</span>
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            <div className="flex items-center space-x-2 text-brand-gold text-xs font-bold font-sans uppercase tracking-wider pb-3 border-b border-brand-creamDark">
              <ShieldCheck className="w-5 h-5" />
              <span>Simulated Payment Gateway (No Real Money Charged)</span>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-6">
              
              {/* Conditional interfaces based on chosen payment type */}
              
              {orderDetails.paymentMethod === 'UPI' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-brand-green">
                    <Smartphone className="w-6 h-6 text-brand-gold" />
                    <h3 className="font-bold text-sm md:text-base font-serif">Pay via UPI App</h3>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">
                      Enter UPI ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. nikhil@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-white border border-brand-gold/30 rounded px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-brand-gold text-brand-green font-sans"
                    />
                  </div>
                  
                  <p className="text-[10px] text-brand-charcoalLight/60 leading-relaxed font-sans">
                    💡 An authorization request will be sent to your GPay/PhonePe application. Approve it to complete the transaction.
                  </p>
                </div>
              )}

              {orderDetails.paymentMethod === 'Card' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-brand-green">
                    <CreditCard className="w-6 h-6 text-brand-gold" />
                    <h3 className="font-bold text-sm md:text-base font-serif">Credit / Debit Card Details</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        maxLength="19"
                        placeholder="4532 9821 0045 9210"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        className="w-full bg-white border border-brand-gold/30 rounded px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-brand-gold text-brand-green font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          maxLength="5"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border border-brand-gold/30 rounded px-4 py-3 text-xs focus:outline-none focus:border-brand-gold text-brand-green text-center font-sans"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">
                          CVV
                        </label>
                        <input
                          type="password"
                          required
                          maxLength="3"
                          placeholder="***"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-white border border-brand-gold/30 rounded px-4 py-3 text-xs focus:outline-none focus:border-brand-gold text-brand-green text-center font-sans"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {orderDetails.paymentMethod === 'NetBanking' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-brand-green">
                    <Landmark className="w-6 h-6 text-brand-gold" />
                    <h3 className="font-bold text-sm md:text-base font-serif">Select Your Netbanking Portal</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-sans">
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map(bank => (
                      <label key={bank} className="border border-brand-gold/20 rounded p-3 hover:bg-brand-cream hover:border-brand-gold cursor-pointer flex items-center justify-center font-bold text-brand-green">
                        <input type="radio" name="bank" defaultChecked className="mr-2 accent-brand-green" />
                        <span>{bank}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {orderDetails.paymentMethod === 'COD' && (
                <div className="space-y-4 text-center py-4 bg-brand-cream/50 border border-brand-gold/15 rounded">
                  <h3 className="font-bold text-brand-green font-serif text-base">Cash On Delivery Selection</h3>
                  <p className="text-xs text-brand-charcoalLight max-w-sm mx-auto leading-relaxed font-sans">
                    You have opted to pay in cash upon receiving the food items. Delivery carriers accept cash, UPI codes, and wallet transfers at the doorstep.
                  </p>
                </div>
              )}

              {/* Order Delivery Summary snippet */}
              <div className="border-t border-brand-creamDark pt-4 flex justify-between items-center text-xs font-sans text-brand-charcoalLight">
                <div>
                  <p className="font-bold">Delivering to:</p>
                  <p className="line-clamp-1">{orderDetails.address?.name} - {orderDetails.address?.street}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Estimated Delivery:</p>
                  <p className="text-brand-gold font-bold">3-5 Business Days</p>
                </div>
              </div>

              {/* Secure pay CTA */}
              <button
                type="submit"
                className="w-full bg-brand-green hover:bg-brand-greenDark text-brand-cream py-4 rounded font-sans text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center space-x-2 shadow-gold-glow"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {orderDetails.paymentMethod === 'COD' 
                    ? 'Confirm COD Order' 
                    : `Authorize Secure Payment • ₹${orderDetails.total}`
                  }
                </span>
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}
