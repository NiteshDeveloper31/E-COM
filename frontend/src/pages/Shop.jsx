import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { SlidersHorizontal, ArrowUpDown, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Shop() {
  const { products } = useReetSutra();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All'); // 'All' | 'under250' | '250to500' | 'above500'
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'priceLow' | 'priceHigh' | 'rating'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync with search/category params in URL
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      // clean param from URL after setting it to local state to prevent loop, or keep it synced.
    } else {
      setSelectedCategory('All');
    }
  }, [categoryParam]);

  // Categories list derived from products
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    // 1. Search Query
    if (searchParam && !product.name.toLowerCase().includes(searchParam.toLowerCase()) && !product.description.toLowerCase().includes(searchParam.toLowerCase())) {
      return false;
    }

    // 2. Category
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }

    // 3. Price
    const discountedPrice = Math.round(product.price * (1 - product.discount / 100));
    if (priceRange === 'under250' && discountedPrice >= 250) return false;
    if (priceRange === '250to500' && (discountedPrice < 250 || discountedPrice > 500)) return false;
    if (priceRange === 'above500' && discountedPrice <= 500) return false;

    // 4. Rating
    if (product.rating < minRating) return false;

    return true;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Math.round(a.price * (1 - a.discount / 100));
    const priceB = Math.round(b.price * (1 - b.discount / 100));

    if (sortBy === 'priceLow') return priceA - priceB;
    if (sortBy === 'priceHigh') return priceB - priceA;
    if (sortBy === 'rating') return b.rating - a.rating;
    
    // Featured (Bestsellers first, then regular)
    if (a.bestseller && !b.bestseller) return -1;
    if (!a.bestseller && b.bestseller) return 1;
    return 0;
  });

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('All');
    setPriceRange('All');
    setMinRating(0);
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Banner / Title Header */}
      <div className="bg-brand-green text-brand-cream py-10 px-6 rounded-lg text-center border-b-2 border-brand-gold/30 shadow-premium">
        <h1 className="text-3xl md:text-5xl font-black serif-header tracking-wider">
          {selectedCategory === 'All' ? 'Our Heritage Delicacies' : selectedCategory}
        </h1>
        <p className="text-xs md:text-sm text-brand-cream/80 max-w-xl mx-auto mt-2 font-sans">
          {searchParam 
            ? `Search results for "${searchParam}"`
            : 'Explore traditional sand-roasted makhanas, hand-pounded winter sweets, and authentic wood-pressed festival cookies.'
          }
        </p>
      </div>

      {/* Control Bar (Count, Mobile Filter Toggle, Sort) */}
      <div className="flex items-center justify-between border-b border-brand-creamDark pb-4">
        
        {/* Results Count */}
        <p className="text-xs md:text-sm text-brand-charcoalLight font-sans">
          Showing <span className="font-bold text-brand-green">{sortedProducts.length}</span> delicacies
        </p>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-brand-green border border-brand-green/30 px-3 py-2 rounded bg-white hover:bg-brand-cream transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-brand-gold hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs md:text-sm text-brand-green bg-white border border-brand-gold/30 rounded px-2.5 py-2 font-bold focus:outline-none focus:border-brand-gold"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Content Layout */}
      <div className="flex gap-8 items-start">
        
        {/* Sidebar Filters (Desktop only) */}
        <aside className="hidden lg:block w-64 shrink-0 bg-brand-ivory border border-brand-gold/10 rounded-lg p-6 space-y-8 shadow-premium">
          
          <div className="flex justify-between items-center border-b border-brand-creamDark pb-3">
            <h3 className="font-bold text-sm text-brand-green tracking-wider uppercase font-serif">
              Filter Delicacies
            </h3>
            <button 
              onClick={resetFilters}
              className="text-[10px] font-bold text-brand-gold hover:text-brand-green uppercase tracking-wider underline"
            >
              Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider">
              Category
            </h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center space-x-2 text-xs md:text-sm text-brand-charcoalLight hover:text-brand-green cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => {
                      setSelectedCategory(cat);
                      setSearchParams(cat === 'All' ? {} : { category: cat });
                    }}
                    className="accent-brand-green w-4 h-4"
                  />
                  <span className={selectedCategory === cat ? 'font-bold text-brand-green' : ''}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider">
              Price Range
            </h4>
            <div className="space-y-2">
              {[
                { label: 'All Prices', value: 'All' },
                { label: 'Under ₹250', value: 'under250' },
                { label: '₹250 - ₹500', value: '250to500' },
                { label: 'Above ₹500', value: 'above500' }
              ].map((range) => (
                <label key={range.value} className="flex items-center space-x-2 text-xs md:text-sm text-brand-charcoalLight hover:text-brand-green cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    checked={priceRange === range.value}
                    onChange={() => setPriceRange(range.value)}
                    className="accent-brand-green w-4 h-4"
                  />
                  <span className={priceRange === range.value ? 'font-bold text-brand-green' : ''}>
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider">
              Minimum Rating
            </h4>
            <div className="space-y-2">
              {[0, 4.6, 4.8].map((ratingVal) => (
                <label key={ratingVal} className="flex items-center space-x-2 text-xs md:text-sm text-brand-charcoalLight hover:text-brand-green cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === ratingVal}
                    onChange={() => setMinRating(ratingVal)}
                    className="accent-brand-green w-4 h-4"
                  />
                  <span className={`flex items-center space-x-1 ${minRating === ratingVal ? 'font-bold text-brand-green' : ''}`}>
                    {ratingVal === 0 ? (
                      <span>All Ratings</span>
                    ) : (
                      <>
                        <span>{ratingVal}</span>
                        <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold inline" />
                        <span>& Above</span>
                      </>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* Product Grid Area */}
        <main className="flex-1">
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-brand-ivory border border-brand-gold/10 rounded-lg space-y-4">
              <p className="text-lg font-bold text-brand-green font-serif">
                No Heritage Delicacies Found
              </p>
              <p className="text-xs md:text-sm text-brand-charcoalLight max-w-sm mx-auto">
                No items match your filter settings. Try resetting or adjusting your category, price range, or search string.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 bg-brand-gold hover:bg-brand-goldLight text-brand-green py-2 px-6 rounded font-sans text-xs font-bold tracking-widest uppercase transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>

      </div>

      {/* Mobile Filters Slide-in Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black z-[100] lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 bottom-0 right-0 w-80 max-w-[85vw] bg-brand-ivory z-[101] shadow-2xl p-6 flex flex-col justify-between lg:hidden"
            >
              <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                <div className="flex justify-between items-center border-b border-brand-creamDark pb-3">
                  <h3 className="font-bold text-sm text-brand-green tracking-wider uppercase font-serif">
                    Filter Options
                  </h3>
                  <button 
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 rounded-full text-brand-green hover:bg-brand-cream"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider">
                    Category
                  </h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center space-x-2 text-xs md:text-sm text-brand-charcoalLight cursor-pointer">
                        <input
                          type="radio"
                          name="mobileCategory"
                          checked={selectedCategory === cat}
                          onChange={() => {
                            setSelectedCategory(cat);
                            setSearchParams(cat === 'All' ? {} : { category: cat });
                          }}
                          className="accent-brand-green w-4 h-4"
                        />
                        <span className={selectedCategory === cat ? 'font-bold text-brand-green' : ''}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider">
                    Price Range
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: 'All Prices', value: 'All' },
                      { label: 'Under ₹250', value: 'under250' },
                      { label: '₹250 - ₹500', value: '250to500' },
                      { label: 'Above ₹500', value: 'above500' }
                    ].map((range) => (
                      <label key={range.value} className="flex items-center space-x-2 text-xs md:text-sm text-brand-charcoalLight cursor-pointer">
                        <input
                          type="radio"
                          name="mobilePrice"
                          checked={priceRange === range.value}
                          onChange={() => setPriceRange(range.value)}
                          className="accent-brand-green w-4 h-4"
                        />
                        <span className={priceRange === range.value ? 'font-bold text-brand-green' : ''}>
                          {range.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider">
                    Minimum Rating
                  </h4>
                  <div className="space-y-2">
                    {[0, 4.6, 4.8].map((ratingVal) => (
                      <label key={ratingVal} className="flex items-center space-x-2 text-xs md:text-sm text-brand-charcoalLight cursor-pointer">
                        <input
                          type="radio"
                          name="mobileRating"
                          checked={minRating === ratingVal}
                          onChange={() => setMinRating(ratingVal)}
                          className="accent-brand-green w-4 h-4"
                        />
                        <span className={`flex items-center space-x-1 ${minRating === ratingVal ? 'font-bold text-brand-green' : ''}`}>
                          {ratingVal === 0 ? (
                            <span>All Ratings</span>
                          ) : (
                            <>
                              <span>{ratingVal}</span>
                              <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold inline" />
                              <span>& Above</span>
                            </>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Action CTAs */}
              <div className="pt-4 border-t border-brand-creamDark flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 border border-brand-green text-brand-green text-xs font-bold uppercase tracking-wider rounded text-center"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-brand-green text-brand-cream text-xs font-bold uppercase tracking-wider rounded text-center"
                >
                  Apply
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

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
