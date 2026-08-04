import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, ShoppingCart } from 'lucide-react';
import { useReetSutra } from '../context/ReetSutraContext';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, toggleWishlist, isInWishlist } = useReetSutra();
  const inWishlist = isInWishlist(product.id);

  const discountedPrice = Math.round(product.price * (1 - product.discount / 100));

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="group relative bg-brand-ivory rounded-lg overflow-hidden shadow-premium hover:shadow-premium-hover border border-brand-gold/10 transition-all duration-300 flex flex-col h-full"
    >
      
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-brand-cream/40">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1.5 items-start">
          {product.bestseller && (
            <span className="bg-brand-green text-brand-cream text-[9px] font-semibold tracking-wider px-2 py-0.5 uppercase rounded-sm">
              Bestseller
            </span>
          )}
          {product.discount > 0 && (
            <span className="bg-brand-gold text-brand-green text-[9px] font-semibold tracking-wider px-2 py-0.5 uppercase rounded-sm">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full border shadow-sm transition-all duration-300 hover:scale-110 ${
            inWishlist 
              ? 'bg-red-50 border-red-200 text-red-500' 
              : 'bg-white/85 backdrop-blur-sm border-brand-gold/20 text-brand-green hover:text-red-500'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Image */}
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Hover Overlay Actions (Visible on larger screens) */}
        <div className="absolute inset-0 bg-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 pointer-events-none group-hover:pointer-events-auto">
          
          <button
            onClick={() => onQuickView(product)}
            className="p-3 bg-brand-ivory text-brand-green hover:bg-brand-gold hover:text-brand-green rounded-full shadow-md transition-all duration-300 hover:scale-110 pointer-events-auto"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </button>

          <button
            onClick={handleAddToCart}
            className="p-3 bg-brand-green text-brand-cream hover:bg-brand-gold hover:text-brand-green rounded-full shadow-md transition-all duration-300 hover:scale-110 pointer-events-auto"
            title="Add to Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>

        </div>

        {/* Quick Add To Cart on Mobile (visible bottom bar) */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent lg:hidden">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-brand-green hover:bg-brand-gold text-brand-cream hover:text-brand-green text-xs font-bold uppercase tracking-widest rounded flex items-center justify-center space-x-1 transition-colors duration-300"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>

      </div>

      {/* Product Info Area */}
      <div className="p-4 flex-1 flex flex-col justify-between text-center items-center">
        <div className="space-y-1.5 flex flex-col items-center w-full">
          {/* Category */}
          <span className="text-[9px] text-brand-gold font-sans tracking-[0.2em] uppercase font-bold">
            {product.category}
          </span>
 
          {/* Title */}
          <Link 
            to={`/product/${product.id}`}
            className="block text-sm md:text-base font-extrabold text-brand-green font-serif hover:text-brand-gold transition-colors duration-200 line-clamp-1 w-full"
          >
            {product.name}
          </Link>
 
          {/* Subtitle / Tagline */}
          <p className="text-[11px] text-brand-charcoalLight/80 font-sans font-medium line-clamp-1 leading-normal">
            {product.tagline}
          </p>
 
          {/* Price */}
          <div className="flex items-center justify-center space-x-2 pt-1.5">
            <span className="text-sm md:text-base font-bold text-[#A27A30]">
              ₹{discountedPrice}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-brand-charcoalLight/65 line-through">
                ₹{product.price}
              </span>
            )}
          </div>
        </div>
 
        {/* Add To Cart button (Mockup design: deep gold background, white text, green circle with gold cart icon) */}
        <div className="pt-3 w-full">
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#A27A30] hover:bg-[#8F6B28] text-white py-1 pl-4 pr-1 rounded-md font-sans text-[11px] font-extrabold tracking-widest uppercase transition-all duration-300 flex items-center justify-between cursor-pointer shadow-sm hover:scale-[1.01]"
          >
            <span>ADD TO CART</span>
            <div className="w-7 h-7 rounded-full bg-brand-green text-[#C8A25D] flex items-center justify-center shrink-0 ml-2 shadow-sm">
              <ShoppingCart className="w-3.5 h-3.5 text-[#C8A25D]" />
            </div>
          </button>
        </div>

 
      </div>

    </motion.div>
  );
}
