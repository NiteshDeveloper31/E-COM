import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import {
  Heart,
  Award,
  Sparkles,
  Map,
  ArrowRight,
  Star,
  ShieldCheck,
  MapPin,
  Leaf,
  RotateCcw,
  Truck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import heroBg from '../assets/MainBannerImage.png';
import storyImage from '../assets/reet_sutra_story.png';

const PickleJarIcon = () => (
  <svg className="w-4 h-4 text-[#B8934E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3h8v3H8z" fill="currentColor" opacity="0.15" />
    <rect x="5" y="6" width="14" height="15" rx="2" />
    <line x1="5" y1="10" x2="19" y2="10" />
    <line x1="5" y1="15" x2="19" y2="15" />
  </svg>
);

export default function Home() {
  const { products } = useReetSutra();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedBestsellerCategory, setSelectedBestsellerCategory] = useState('All Products');
  const bestsellerCategories = ['All Products', 'Ghee', 'Pickles', 'Makhana', 'Thekua', 'Combos', 'Gift Boxes'];
  const scrollRef = useRef(null);

  const [heroBanners, setHeroBanners] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/banners");
        const resJson = await response.json();
        if (response.ok && resJson.success) {
          const active = resJson.data.filter(b => b.status === "Active" && b.placement.toLowerCase() === "main hero");
          setHeroBanners(active || []);
        }
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      }
    };
    fetchBanners();
  }, []);

  const displayBanners = [{ isDefault: true }, ...heroBanners];
  const currentBanner = displayBanners[currentSlideIndex];

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % displayBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayBanners.length]);

  const nextSlide = () => {
    setCurrentSlideIndex(prev => (prev + 1) % displayBanners.length);
  };
  const prevSlide = () => {
    setCurrentSlideIndex(prev => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  const getBannerImage = (banner) => {
    if (!banner || banner.isDefault || !banner.image) return heroBg;
    if (banner.image.startsWith("http://") || banner.image.startsWith("https://")) {
      return banner.image;
    }
    return `http://localhost:5000${banner.image.startsWith("/") ? "" : "/"}${banner.image}`;
  };

  // Filter bestsellers dynamically
  const filteredBestsellers = products.filter(p => {
    const isBestseller = p.bestseller || true; // Show all products since they are bestsellers in our seed!
    if (!isBestseller) return false;

    if (selectedBestsellerCategory === 'All Products') return true;
    if (selectedBestsellerCategory === 'Combos') {
      return p.category === 'Combos' || p.category === 'Gift Boxes';
    }
    return p.category === selectedBestsellerCategory;
  });

  // Scroll function for bestsellers carousel
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth * 0.75
        : scrollLeft + clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Categories list
  const categories = [
    { name: 'Pickles', displayName: 'Pickle', image: '/images/mango_pickle.jpg' },
    { name: 'Ghee', displayName: 'Ghee', image: '/images/desi_cow_ghee.jpg' },
    { name: 'Makhana', displayName: 'Makhana', image: '/images/makhana.jpg' },
    { name: 'Thekua', displayName: 'Thekua', image: '/images/thekua.jpg' },
    { name: 'Honey', displayName: 'Theney', image: '/images/honey.jpg' },
    { name: 'Sattu', displayName: 'Sattu', image: '/images/sattu.jpg' },
    { name: 'Snacks', displayName: 'Snacks', image: '/images/snacks.jpg' },
    { name: 'Gift Boxes', displayName: 'Gift Boxes', image: '/images/premium_combo_box.jpg' }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Ananya S.',
      role: 'Home Cook & Critic',
      rating: 5,
      comment: 'The mango pickle tastes exactly like homemade. Absolutely loved it!',
      city: 'Patna',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Rajiv K.',
      role: 'Gourmet Enthusiast',
      rating: 5,
      comment: 'Pure, natural and authentic. The aroma is divine!',
      city: 'Gaya',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Meera T.',
      role: 'Brand Manager',
      rating: 5,
      comment: 'Best ghee I have ever used. The texture is perfect.',
      city: 'Patna',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Pankaj V.',
      role: 'Daily Snack Buyer',
      rating: 5,
      comment: 'Perfect packaging and super fast delivery.',
      city: 'Bihar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    }
  ];

  // Instagram items
  const instagramGems = [
    'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80'
  ];

  return (
    <div className="pb-20 overflow-x-hidden">

      {/* Self-contained style for hiding scrollbars */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 1. Premium Hero Section with correct background image */}
      <section
        className="relative w-full min-h-[460px] sm:min-h-[500px] md:min-h-[460px] lg:h-auto lg:min-h-[410px] xl:min-h-[435px] lg:aspect-[2017/528] border-b border-brand-gold/15 bg-cover bg-center bg-no-repeat flex flex-col lg:flex-row items-center justify-center lg:justify-start py-8 lg:py-0 overflow-hidden transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${getBannerImage(currentBanner)})` }}
      >



        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 z-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">

            {/* Left Block: Copy — clean solid text, center-aligned */}
            <div className="lg:col-span-7 space-y-3 lg:space-y-2.5 xl:space-y-3.5 flex flex-col items-center text-center max-w-xl mx-auto lg:mx-0 relative z-10">
              {/* Sunburst radial glow spotlight */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_70%)] pointer-events-none -z-10 scale-[1.6] blur-xl" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col items-center space-y-3 lg:space-y-2.5 xl:space-y-3.5 bg-white/60 backdrop-blur-[3px] rounded-2xl px-5 py-6 sm:px-7 sm:py-7 lg:bg-transparent lg:backdrop-blur-none lg:rounded-none lg:px-0 lg:py-0"
                >
                  {!currentBanner.isDefault ? (
                    /* Dynamic Admin Banner */
                    <>
                      <div className="space-y-2.5 flex flex-col items-center w-full">
                        <h1
                          className="text-2xl sm:text-3xl md:text-[34px] lg:text-[36px] xl:text-[40px] font-extrabold tracking-wide leading-tight text-[#1E3926] font-serif"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {currentBanner.title}
                        </h1>

                        {/* Gold Ornament Separator */}
                        <div className="flex items-center justify-center space-x-3 w-full py-0.5">
                          <div className="h-[1px] bg-[#C8A25D]/50 w-12" />
                          <svg className="w-5 h-2.5 text-[#C8A25D] fill-current shrink-0" viewBox="0 0 24 12">
                            <path d="M12 1L17 6L12 11L7 6Z" />
                            <circle cx="2" cy="6" r="1.5" />
                            <circle cx="22" cy="6" r="1.5" />
                          </svg>
                          <div className="h-[1px] bg-[#C8A25D]/50 w-12" />
                        </div>

                        <p
                          className="text-xs sm:text-sm md:text-[14.5px] text-[#1E3926] font-medium leading-relaxed tracking-wide font-serif"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {currentBanner.subtitle}
                        </p>
                      </div>

                      <div className="flex flex-row gap-4 w-full justify-center pt-2">
                        <Link
                          to={currentBanner.buttonLink}
                          className="bg-[#1E3926] hover:bg-[#13251A] text-[#C8A25D] font-extrabold text-[11px] tracking-widest uppercase py-3 px-8 rounded shadow-md hover:scale-[1.01] transition-all duration-300 text-center flex items-center justify-center space-x-2 cursor-pointer border border-[#1E3926]"
                        >
                          <span>{currentBanner.buttonText}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C8A25D]" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    /* Fallback Mockup Banner */
                    <>
                      <div className="space-y-2.5 flex flex-col items-center w-full">
                        <h1
                          className="text-2xl sm:text-3xl md:text-[34px] lg:text-[36px] xl:text-[40px] font-extrabold tracking-wide leading-tight text-[#1E3926] font-serif"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          The True Taste of Bihar,<br />
                          <span className="text-[#C8A25D] font-bold">Now at Your Home</span>
                        </h1>

                        {/* Gold Ornament Separator */}
                        <div className="flex items-center justify-center space-x-3 w-full py-0.5">
                          <div className="h-[1px] bg-[#C8A25D]/50 w-12" />
                          <svg className="w-5 h-2.5 text-[#C8A25D] fill-current shrink-0" viewBox="0 0 24 12">
                            <path d="M12 1L17 6L12 11L7 6Z" />
                            <circle cx="2" cy="6" r="1.5" />
                            <circle cx="22" cy="6" r="1.5" />
                          </svg>
                          <div className="h-[1px] bg-[#C8A25D]/50 w-12" />
                        </div>

                        <p
                          className="text-xs sm:text-sm md:text-[14.5px] text-[#1E3926] font-medium leading-relaxed tracking-wide font-serif"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          Pure Ingredients. Traditional Recipes.<br />
                          Made with Love.
                        </p>
                      </div>

                      <div className="flex flex-row gap-4 w-full justify-center pt-1">
                        <Link
                          to="/shop?category=Ghee"
                          className="bg-[#1E3926] hover:bg-[#13251A] text-[#C8A25D] font-extrabold text-[10.5px] tracking-widest uppercase py-2.5 px-4.5 rounded shadow-md hover:scale-[1.01] transition-all duration-300 text-center flex items-center justify-center space-x-2 cursor-pointer border border-[#1E3926]"
                        >
                          <span>SHOP GHEE</span>
                          <Leaf className="w-3.5 h-3.5 text-[#C8A25D] fill-current" />
                        </Link>
                        <Link
                          to="/shop?category=Pickles"
                          className="bg-[#FAF7F2]/80 hover:bg-brand-cream border border-[#C8A25D] text-[#C8A25D] font-extrabold text-[10.5px] tracking-widest uppercase py-2.5 px-4.5 rounded shadow-sm hover:scale-[1.01] transition-all duration-300 text-center flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <span>SHOP PICKLES</span>
                          <PickleJarIcon />
                        </Link>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Block is empty to let the background image's jars show through */}
            <div className="hidden lg:block lg:col-span-5" />



          </div>
        </div>

        {/* Slide Navigation Controls */}
        {displayBanners.length > 1 && (
          <>
            {/* Left Chevron Button */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/45 text-[#1E3926] flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-xs"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Chevron Button */}
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/45 text-[#1E3926] flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-xs"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Bottom Indicator Dots */}
            <div className="absolute bottom-16 sm:bottom-18 lg:bottom-20 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5">
              {displayBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlideIndex 
                      ? 'bg-[#1E3926] scale-110' 
                      : 'bg-[#1E3926]/20 hover:bg-[#1E3926]/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* 1.2 Bottom Translucent Features Bar - Floating at the bottom-left */}
        <div className="relative mt-5 mx-4 sm:mx-6 max-w-[620px] lg:absolute lg:mt-0 lg:mx-0 lg:bottom-4 xl:bottom-5 lg:left-12 bg-[#1E3926]/90 border border-[#B8934E]/30 backdrop-blur-md py-2 px-3.5 rounded-xl shadow-lg z-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[
              { icon: MapPin, title: "MADE WITH PRIDE", desc: "In Bihar" },
              { icon: Leaf, title: "100% NATURAL", desc: "No Preservatives" },
              { icon: Heart, title: "HANDMADE", desc: "In Small Batches" },
              { icon: Award, title: "AUTHENTIC RECIPES", desc: "Passed Down Generations" }
            ].map((feat, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <div className="w-6 h-6 rounded-full bg-white/10 text-brand-gold flex items-center justify-center shrink-0 mt-0.5">
                  <feat.icon className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-[8.5px] text-brand-cream tracking-wider uppercase leading-none">{feat.title}</h4>
                  <p className="text-[7.5px] text-brand-cream/70 font-sans leading-snug">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 1.3 Under-Hero 6-Feature Bar - Light cream background, dark green text */}
      <section className="bg-[#FAF7F2] border-b border-brand-gold/15 py-5 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center lg:text-left">
            {[
              { icon: ShieldCheck, title: "PURE & AUTHENTIC", desc: "Made with Natural Ingredients" },
              { icon: Award, title: "TRADITIONAL RECIPES", desc: "From Bihar's Heritage" },
              { icon: Leaf, title: "NO PRESERVATIVES", desc: "100% Chemical Free" },
              { icon: Map, title: "SECURE PACKAGING", desc: "Hygienic & Fresh" },
              { icon: Truck, title: "FAST DELIVERY", desc: "Across India" },
              { icon: RotateCcw, title: "EASY RETURNS", desc: "Customer Friendly" }
            ].map((feat, idx) => (
              <div key={idx} className="flex flex-col lg:flex-row items-center lg:items-start gap-2.5 justify-center lg:justify-start">
                <div className="w-7.5 h-7.5 rounded-full bg-brand-green/5 text-brand-gold flex items-center justify-center shrink-0">
                  <feat.icon className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 text-center lg:text-left">
                  <h4 className="font-bold text-[10px] text-brand-green tracking-wider uppercase">{feat.title}</h4>
                  <p className="text-[9px] text-brand-charcoalLight font-sans leading-snug">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spaced container for subsequent sections */}
      <div className="space-y-16 md:space-y-20 mt-16 md:mt-20">

        {/* 2. Featured Categories Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs text-brand-gold font-bold tracking-[0.25em] uppercase block">
              EXPLORE OUR COLLECTION
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-green serif-header">
              Explore Our Collection
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 pt-4">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex flex-col items-center"
              >
                <Link
                  to={`/shop?category=${cat.name}`}
                  className="group flex flex-col items-center space-y-3 w-full"
                >
                  <div className="aspect-square w-24 rounded-full overflow-hidden border border-brand-gold/20 group-hover:border-brand-gold p-1 bg-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-xs text-brand-green font-serif group-hover:text-brand-gold transition-colors truncate">
                      {cat.displayName || cat.name}
                    </h3>
                    <span className="text-[10px] font-bold text-brand-gold hover:text-brand-green tracking-wider uppercase flex items-center justify-center gap-0.5">
                      <span>Shop Now</span>
                      <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. Best Sellers Section with Horizontal Carousel */}
        <section className="bg-[#FAF7F2] border-y border-brand-gold/15 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

            <div className="text-center space-y-4">
              <span className="text-xs text-brand-gold font-bold tracking-[0.25em] uppercase block">
                PEOPLE'S FAVORITES
              </span>
              {/* Heading with gold lines and ornaments */}
              <div className="flex items-center justify-center space-x-4">
                <div className="h-[1px] bg-brand-gold/40 w-12 md:w-24" />
                <span className="text-brand-gold text-xs md:text-sm">✦</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-green serif-header">
                  Shop Our Bestsellers
                </h2>
                <span className="text-brand-gold text-xs md:text-sm">✦</span>
                <div className="h-[1px] bg-brand-gold/40 w-12 md:w-24" />
              </div>
            </div>

            {/* Bestseller Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 py-2 border-b border-brand-creamDark max-w-3xl mx-auto">
              {bestsellerCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedBestsellerCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${selectedBestsellerCategory === cat
                    ? 'bg-brand-green text-brand-cream shadow-sm scale-105'
                    : 'bg-brand-cream/45 border border-brand-gold/15 text-brand-green hover:bg-brand-cream'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Horizontal Carousel Container */}
            <div className="relative px-2 md:px-4">
              {/* Left Scroll Button */}
              <button
                onClick={() => scroll('left')}
                className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-brand-cream text-brand-gold border border-brand-gold/30 hover:border-brand-gold p-2.5 rounded-full shadow-md hover:scale-110 transition-all duration-300 cursor-pointer hidden md:flex items-center justify-center"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Scroll Button */}
              <button
                onClick={() => scroll('right')}
                className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-brand-cream text-brand-gold border border-brand-gold/30 hover:border-brand-gold p-2.5 rounded-full shadow-md hover:scale-110 transition-all duration-300 cursor-pointer hidden md:flex items-center justify-center"
                aria-label="Next products"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Scroll Area */}
              <div
                ref={scrollRef}
                className="no-scrollbar flex space-x-6 overflow-x-auto scroll-smooth py-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredBestsellers.map((product) => (
                  <div key={product.id} className="w-[280px] shrink-0 snap-start">
                    <ProductCard
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* 4. Why ReetSutra Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center space-y-2">
            <span className="text-xs text-brand-gold font-bold tracking-[0.25em] uppercase block">
              OUR PRINCIPLES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-green serif-header">
              The ReetSutra Guarantee
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Card 1 */}
            <div className="bg-brand-ivory p-8 rounded-lg border border-brand-gold/10 hover:border-brand-gold/30 transition-all text-center space-y-4 shadow-premium">
              <div className="w-12 h-12 rounded-full bg-brand-green text-brand-gold flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-green font-serif">
                Natural Ingredients
              </h3>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed font-sans">
                No artificial chemical preservatives, food colorings, or refined sugars. We use pure organic sugarcane jaggery (gur) and cold-ground spices.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-brand-ivory p-8 rounded-lg border border-brand-gold/10 hover:border-brand-gold/30 transition-all text-center space-y-4 shadow-premium">
              <div className="w-12 h-12 rounded-full bg-brand-green text-brand-gold flex items-center justify-center mx-auto shadow-md">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-green font-serif">
                Handmade With Love
              </h3>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed font-sans">
                All recipes are prepared in small batches by local self-help women collectives using traditional wooden templates (Saancha) and mortar tools.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-brand-ivory p-8 rounded-lg border border-brand-gold/10 hover:border-brand-gold/30 transition-all text-center space-y-4 shadow-premium">
              <div className="w-12 h-12 rounded-full bg-brand-green text-brand-gold flex items-center justify-center mx-auto shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-green font-serif">
                Authentic Bihar Recipes
              </h3>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed font-sans">
                No compromises on flavor. We strictly preserve age-old spices and cooking dynamics handed down through grandma generations.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-brand-ivory p-8 rounded-lg border border-brand-gold/10 hover:border-brand-gold/30 transition-all text-center space-y-4 shadow-premium">
              <div className="w-12 h-12 rounded-full bg-brand-green text-brand-gold flex items-center justify-center mx-auto shadow-md">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-green font-serif">
                From Bihar With Pride
              </h3>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed font-sans">
                We proudly celebrate Bihar's deep food heritage—from Silaao's layered Khajas to Gaya's hand-pounded tilkuts and Mithila's giant Makhana fields.
              </p>
            </div>

          </div>

        </section>

        {/* 5. Brand Heritage & Gifts Split Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Card: Bihar's Kitchens */}
            <div className="bg-brand-green text-brand-cream rounded-lg overflow-hidden flex flex-col justify-between border border-brand-gold/15 shadow-2xl relative min-h-[420px]">
              <div className="absolute inset-0 z-0">
                <img
                  src={storyImage}
                  alt="From Bihar's Kitchens"
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-green via-brand-green/70 to-transparent" />
              </div>

              <div className="p-8 md:p-10 space-y-6 relative z-10 my-auto flex flex-col items-start justify-center h-full">
                <span className="text-[10px] text-brand-gold font-bold tracking-[0.25em] uppercase">
                  HERITAGE & TRADITION
                </span>
                <h2 className="text-3xl font-extrabold font-serif leading-tight">
                  From Bihar's Kitchens <br />to Your Home
                </h2>
                <p className="text-xs md:text-sm text-brand-cream/80 leading-relaxed font-sans font-medium max-w-md">
                  Our recipes have been passed down through generations. Every jar is prepared with patience, purity and love.
                </p>
                <Link
                  to="/about"
                  className="inline-block bg-transparent hover:bg-brand-cream/10 border border-brand-gold text-brand-gold hover:text-brand-cream font-bold text-xs tracking-widest uppercase py-3 px-6 rounded transition-all duration-300"
                >
                  Our Story
                </Link>
              </div>
            </div>

            {/* Right Card: Premium Gift Collections */}
            <div className="bg-brand-ivory text-brand-green rounded-lg overflow-hidden border border-brand-gold/15 shadow-2xl p-8 md:p-10 flex flex-col md:flex-row gap-6 justify-between items-center min-h-[420px]">
              <div className="space-y-6 flex-1 text-left w-full">
                <span className="text-[10px] text-brand-gold font-bold tracking-[0.25em] uppercase block">
                  CURATED FOR CELEBRATIONS
                </span>
                <h2 className="text-3xl font-extrabold font-serif leading-tight text-brand-green">
                  Premium Gift <br />Collections
                </h2>
                <p className="text-xs md:text-sm text-brand-charcoalLight/90 leading-normal font-sans font-medium">
                  Perfect for Every Occasion
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brand-creamDark w-full">
                  {[
                    { name: "Wedding Gifts", path: "/shop?category=Gift Boxes" },
                    { name: "Corporate Gifts", path: "/shop?category=Gift Boxes" },
                    { name: "Festive Collection", path: "/shop?category=Gift Boxes" },
                    { name: "Luxury Boxes", path: "/shop?category=Gift Boxes" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-brand-creamDark pb-2 pr-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-brand-green">{item.name}</span>
                      <Link to={item.path} className="text-[10px] font-bold text-brand-gold hover:text-brand-green transition-colors uppercase tracking-widest underline decoration-brand-gold/50 cursor-pointer">
                        Explore
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-44 h-44 md:w-52 md:h-52 shrink-0 relative rounded-lg overflow-hidden border border-brand-gold/15 bg-white shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80"
                  alt="Premium Gift Box"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </section>

        {/* 6. Traditional Bihar Heritage Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center space-y-2">
            <span className="text-xs text-brand-gold font-bold tracking-[0.25em] uppercase block">
              CULTURAL GEOGRAPHY
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-green serif-header">
              Traditional Bihar Heritage
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Heritage Item 1 */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded overflow-hidden shadow-md border border-brand-gold/15">
                <img
                  src="https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=500&q=80"
                  alt="Gaya Tilkut pounding"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-lg font-bold text-brand-green font-serif">
                Gaya Hand-Pounded Tilkut
              </h3>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed font-sans">
                Gaya's winter Tilkut is legendary. The flakiness is achieved only when toasted white sesame seeds and hot jaggery are pounded in heavy iron mortars. Our chefs preserve this delicate manual labor.
              </p>
            </div>

            {/* Heritage Item 2 */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded overflow-hidden shadow-md border border-brand-gold/15">
                <img
                  src="https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=500&q=80"
                  alt="Silaao Khaja folding"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-lg font-bold text-brand-green font-serif">
                Silaao GI-Tagged Layered Khaja
              </h3>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed font-sans">
                Hailing from the historic regions of Nalanda and Rajgir, this sweet pastry requires rolling dough into multiple paper-thin sheets, folding them 52 times, and deep frying in clean A2 cow ghee.
              </p>
            </div>

            {/* Heritage Item 3 */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded overflow-hidden shadow-md border border-brand-gold/15">
                <img
                  src="https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=500&q=80"
                  alt="Mithila Makhana Harvesting"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-lg font-bold text-brand-green font-serif">
                Mithila Premium Fox Nuts
              </h3>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed font-sans">
                Mithila produces over 85% of the world's makhana. Sourced from organic water lily farms, the seeds are harvested, sun-dried, and hand-popped on heavy wood fire pans to create large, crunchy puff snacks.
              </p>
            </div>

          </div>

        </section>

        {/* 7. Customer Testimonials Section */}
        <section className="bg-brand-ivory border-y border-brand-gold/15 py-20 px-4">
          <div className="max-w-7xl mx-auto space-y-12">

            <div className="text-center space-y-2">
              <span className="text-xs text-brand-gold font-bold tracking-[0.25em] uppercase block">
                TESTIMONIALS
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-green serif-header">
                Loved by Thousands
              </h2>
              <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((test, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-lg shadow-premium border border-brand-gold/10 flex flex-col justify-between items-center text-center space-y-4"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-gold/30">
                      <img src={test.avatar} alt={test.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center text-brand-gold">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    <p className="text-xs text-brand-charcoalLight font-sans italic leading-relaxed">
                      "{test.comment}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-brand-creamDark w-full">
                    <h4 className="font-bold text-xs text-brand-green font-serif">{test.name}</h4>
                    <p className="text-[9px] text-brand-gold font-bold uppercase tracking-wider">{test.role} • {test.city}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 8. Instagram Style Gallery */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="text-center space-y-2">
            <span className="text-xs text-brand-gold font-bold tracking-[0.25em] uppercase block">
              SOCIAL GALLERY
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-green serif-header">
              #ReetSutraLoves
            </h2>
            <p className="text-xs md:text-sm text-brand-charcoalLight font-sans">
              Tag us on Instagram with your family tea-time layouts to get featured.
            </p>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {instagramGems.map((imgUrl, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded border border-brand-gold/10 group shadow-sm hover:shadow-premium"
              >
                <img
                  src={imgUrl}
                  alt="Heritage food setup"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-green/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-brand-cream text-xs font-bold uppercase tracking-wider font-sans border border-brand-cream px-3 py-1 bg-brand-green/30 backdrop-blur-xs">
                    View Post
                  </span>
                </div>
              </div>
            ))}
          </div>

        </section>

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
