import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { useReetSutra } from '../context/ReetSutraContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickViewModal({ product, onClose }) {
  const navigate = useNavigate();
  const { addToCart, user, showToast } = useReetSutra();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('ingredients'); // 'ingredients' | 'benefits'
  const [selectedImage, setSelectedImage] = useState(product?.image || '');

  const allImages = React.useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.image) list.push(product.image);
    if (Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [product]);

  if (!product) return null;

  const discountedPrice = Math.round(product.price * (1 - product.discount / 100));

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    onClose();
  };

  const adjustQuantity = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] overflow-y-auto">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal container */}
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-4xl bg-brand-ivory rounded-xl shadow-2xl border border-brand-gold/20 overflow-hidden flex flex-col md:flex-row"
          >
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-brand-cream/80 text-brand-green hover:bg-brand-gold hover:text-brand-green transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Image Carousel / Preview */}
            <div className="w-full md:w-1/2 bg-brand-cream/30 relative flex flex-col justify-between p-4">
              <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.bestseller && (
                  <span className="absolute top-4 left-4 bg-brand-green text-brand-cream text-[10px] font-bold tracking-wider px-2.5 py-1 uppercase rounded-sm shadow-md">
                    Bestseller
                  </span>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 pt-3 justify-center">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-12 h-12 rounded border overflow-hidden transition-all cursor-pointer ${
                        (selectedImage ? selectedImage === img : idx === 0)
                          ? 'border-brand-gold ring-2 ring-brand-gold/60 shadow-sm scale-105'
                          : 'border-brand-gold/20 hover:border-brand-gold/60 opacity-80'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Product Details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[500px] md:max-h-none">
              
              <div>
                
                {/* Category & Ratings */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-brand-gold uppercase tracking-widest font-bold">
                    {product.category}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center text-brand-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'opacity-30'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-brand-charcoalLight font-semibold">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-xl md:text-2xl font-extrabold text-brand-green font-serif mt-2">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline space-x-3 mt-3">
                  <span className="text-xl md:text-2xl font-black text-brand-green">
                    ₹{discountedPrice}
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-sm text-brand-charcoalLight line-through">
                        ₹{product.price}
                      </span>
                      <span className="text-xs text-brand-gold font-bold">
                        ({product.discount}% OFF)
                      </span>
                    </>
                  )}
                  <span className="text-xs text-brand-charcoalLight ml-2">
                    | Net Weight: {product.weight}
                  </span>
                </div>

                {/* Short description callout */}
                {product.shortDescription && (
                  <p className="text-xs text-brand-charcoalLight leading-relaxed font-sans font-medium bg-brand-cream/35 border-l-2 border-brand-gold pl-2.5 py-1 mt-3">
                    {product.shortDescription}
                  </p>
                )}

                {/* Description */}
                <p className="text-xs md:text-sm text-brand-charcoalLight font-sans mt-3 leading-relaxed line-clamp-2">
                  {product.description}
                </p>

                {/* Interactive Tabs */}
                <div className="mt-6">
                  <div className="flex border-b border-brand-creamDark">
                    <button
                      onClick={() => setActiveTab('ingredients')}
                      className={`pb-2 pr-6 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                        activeTab === 'ingredients'
                          ? 'border-brand-gold text-brand-green'
                          : 'border-transparent text-brand-charcoalLight hover:text-brand-gold'
                      }`}
                    >
                      Ingredients
                    </button>
                    <button
                      onClick={() => setActiveTab('benefits')}
                      className={`pb-2 px-6 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                        activeTab === 'benefits'
                          ? 'border-brand-gold text-brand-green'
                          : 'border-transparent text-brand-charcoalLight hover:text-brand-gold'
                      }`}
                    >
                      Key Benefits
                    </button>
                  </div>

                  <div className="py-3 max-h-[100px] overflow-y-auto">
                    {activeTab === 'ingredients' ? (
                      <p className="text-xs text-brand-charcoalLight leading-relaxed font-sans">
                        {product.ingredients && product.ingredients.length > 0
                          ? product.ingredients.join(', ')
                          : '100% natural heritage ingredients.'}
                      </p>
                    ) : (
                      <ul className="list-disc pl-4 text-xs text-brand-charcoalLight space-y-1.5 font-sans">
                        {product.benefits && product.benefits.length > 0 ? (
                          product.benefits.slice(0, 2).map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))
                        ) : (
                          <li>Traditional nourishing recipe.</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

              </div>

              {/* Purchase Actions */}
              <div className="pt-6 border-t border-brand-creamDark flex flex-col sm:flex-row gap-2 mt-6">
                
                {/* Quantity adjustment */}
                <div className="flex items-center justify-between border border-brand-gold/30 rounded w-full sm:w-24 bg-white">
                  <button 
                    type="button"
                    onClick={() => adjustQuantity(-1)}
                    className="px-2.5 py-1.5 text-brand-green hover:bg-brand-cream text-base font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-brand-green">
                    {quantity}
                  </span>
                  <button 
                    type="button"
                    onClick={() => adjustQuantity(1)}
                    className="px-2.5 py-1.5 text-brand-green hover:bg-brand-cream text-base font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-green hover:bg-brand-greenDark text-brand-cream py-2.5 px-3 rounded font-sans text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center space-x-1.5 shadow-gold-glow cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add To Cart</span>
                </button>

                {/* Buy Now button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (!user || !user.isLoggedIn) {
                      showToast('Please login to complete your purchase.');
                      navigate('/login');
                    } else {
                      navigate('/checkout', {
                        state: {
                          buyNowItem: {
                            product,
                            quantity
                          }
                        }
                      });
                    }
                  }}
                  className="flex-1 bg-brand-gold hover:bg-brand-goldDark text-brand-green py-2.5 px-3 rounded font-sans text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center space-x-1.5 shadow-gold-glow cursor-pointer"
                >
                  <span>Buy Now</span>
                </button>

              </div>

              {/* Link to Full Product Page */}
              <div className="text-center mt-4">
                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="inline-flex items-center space-x-1.5 text-xs text-brand-gold hover:text-brand-green font-bold uppercase tracking-wider transition-colors"
                >
                  <span>View Full Product Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </motion.div>
        </div>

      </div>
    </AnimatePresence>
  );
}
