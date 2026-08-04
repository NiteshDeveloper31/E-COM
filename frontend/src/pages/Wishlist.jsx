import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Wishlist() {
  const { wishlist, products } = useReetSutra();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Filter products in wishlist
  const wishlistItems = products.filter(p => wishlist.includes(p.id));

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6 min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-brand-cream border-2 border-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold mx-auto shadow-md">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-brand-green font-serif">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs md:text-sm text-brand-charcoalLight max-w-sm mx-auto leading-relaxed font-sans">
          Save your favorite traditional Bihari sweets and snacks here to easily buy them later.
        </p>
        <Link
          to="/shop"
          className="bg-brand-green hover:bg-brand-greenDark text-brand-cream py-3 px-8 rounded font-sans text-xs font-bold tracking-widest uppercase transition-colors inline-block"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-extrabold text-brand-green font-serif">
          My Saved Wishlist
        </h1>
        <p className="text-xs text-brand-charcoalLight uppercase tracking-wider font-semibold">
          Your curated list of premium traditional Bihar delicacies
        </p>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {wishlistItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        ))}
      </div>

      {/* Quick View Modal Overlay */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

    </div>
  );
}
