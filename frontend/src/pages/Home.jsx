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

// 100% Pixel-Perfect SVG Icons matching the reference image
const SmallBatchesIcon = () => (
  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#C8A25D] shrink-0" viewBox="0 0 44 44" fill="none">
    {/* Knob */}
    <ellipse cx="22" cy="7.5" rx="2.5" ry="2" fill="#C8A25D" />
    {/* Lid dome */}
    <path d="M14 13.5c1.5-3.5 5.5-4.5 8-4.5s6.5 1 8 4.5H14z" fill="#C8A25D" />
    {/* Neck rim */}
    <rect x="12" y="13.5" width="20" height="2.5" rx="1" fill="#A8823D" />
    {/* Body */}
    <path d="M13 16c-5 3.5-5.5 12.5-0.5 16.5C15.5 35 28.5 35 31.5 32.5c5-4 4.5-13-0.5-16.5H13z" fill="#C8A25D" />
    {/* Pot shadow & highlight lines */}
    <path d="M15 22c3.5 2 10.5 2 14 0" stroke="#FAF6EF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    <path d="M17 33h10" stroke="#A8823D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BiharRecipesIcon = () => (
  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#C8A25D] shrink-0" viewBox="0 0 44 44" fill="none">
    {/* Central Stem */}
    <path d="M22 36V16" stroke="#C8A25D" strokeWidth="2.2" strokeLinecap="round" />
    {/* Top Center Leaf */}
    <path d="M22 17C22 8 16 6 13 11c-1.5 4.5 3 9 9 6z" fill="#C8A25D" />
    <path d="M22 17c0-9 6-11 9-6 1.5 4.5-3 9-9 6z" fill="#C8A25D" />
    {/* Left Leaf */}
    <path d="M22 25c-7-2-11-8-7-12 4.5-2.5 9.5 3 7 12z" fill="#C8A25D" />
    {/* Right Leaf */}
    <path d="M22 25c7-2 11-8 7-12-4.5-2.5-9.5 3-7 12z" fill="#C8A25D" />
  </svg>
);

const PremiumIngredientsIcon = () => (
  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#C8A25D] shrink-0" viewBox="0 0 44 44" fill="none" stroke="#C8A25D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Stem */}
    <path d="M22 36V10" strokeWidth="2" />
    {/* Top Leaf */}
    <path d="M22 10c-3.5-5 0-8 3.5-7 1 4.5-1 6.5-3.5 7z" fill="#C8A25D" fillOpacity="0.25" />
    <path d="M22 6v4" strokeWidth="1" />
    {/* Upper Left Leaf */}
    <path d="M22 16c-5-4-9-2-7 3 2.5 4 6 2.5 7-3z" fill="#C8A25D" fillOpacity="0.25" />
    <path d="M17 14.5l5 1.5" strokeWidth="1" />
    {/* Upper Right Leaf */}
    <path d="M22 16c5-4 9-2 7 3-2.5 4-6 2.5-7-3z" fill="#C8A25D" fillOpacity="0.25" />
    <path d="M27 14.5l-5 1.5" strokeWidth="1" />
    {/* Lower Left Leaf */}
    <path d="M22 24c-6-4-10-1-8 4 3 4.5 7 2 8-4z" fill="#C8A25D" fillOpacity="0.25" />
    <path d="M16 22l6 2" strokeWidth="1" />
    {/* Lower Right Leaf */}
    <path d="M22 24c6-4 10-1 8 4-3 4.5-7 2-8-4z" fill="#C8A25D" fillOpacity="0.25" />
    <path d="M28 22l-6 2" strokeWidth="1" />
  </svg>
);

const NoPreservativesIcon = () => (
  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#C8A25D] shrink-0" viewBox="0 0 44 44" fill="none" stroke="#C8A25D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {/* Outer Circle */}
    <circle cx="22" cy="22" r="16" strokeWidth="1.8" />
    {/* Slash */}
    <line x1="11" y1="33" x2="33" y2="11" strokeWidth="2" />
    {/* Crossed Flask/Drop inside */}
    <path d="M22 14c-3 4-4.5 6.5-4.5 9.5a4.5 4.5 0 0 0 9 0c0-3-1.5-5.5-4.5-9.5z" strokeWidth="1.3" opacity="0.8" />
  </svg>
);

const PrideInBiharIcon = () => (
  <svg className="w-9 h-9 sm:w-10 sm:h-10 text-[#C8A25D] shrink-0" viewBox="0 0 44 44" fill="none" stroke="#C8A25D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Geographic Bihar Map Outline */}
    <path
      d="M 9 16 
         L 14 13.5 
         L 19 15 
         L 24 13 
         L 31 14.5 
         L 35 18 
         L 33 22 
         L 36 26 
         L 34 31 
         L 28 30 
         L 25 33 
         L 19 32 
         L 15 34 
         L 11 30 
         L 12 24 
         L 8 21 
         Z"
      fill="#C8A25D"
      fillOpacity="0.12"
      strokeWidth="1.8"
    />
    <path d="M 9 22 C 16 23, 24 21, 35 23" stroke="#C8A25D" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.6" />
  </svg>
);

const FreshShieldIcon = () => (
  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#C8A25D] shrink-0" viewBox="0 0 44 44" fill="none" stroke="#C8A25D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {/* Shield Outer */}
    <path d="M22 6l13 5v11c0 10-8 16-13 18C14 38 6 32 6 22V11l13-5z" fill="#C8A25D" fillOpacity="0.12" strokeWidth="1.8" />
    {/* Inner Leaf & Checkmark */}
    <path d="M15 22.5l5 5L29 16" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
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
  const [showFloatingBanner, setShowFloatingBanner] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/banners");
        const resJson = await response.json();
        if (response.ok && resJson.success) {
          const active = resJson.data.filter(b => b.status === "Active");
          setHeroBanners(active || []);
        }
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      }
    };
    fetchBanners();
  }, []);

  // Main Default Hero + All Active Admin Banners
  const displayBanners = [
    {
      isDefault: true,
      title: "The True Taste of Bihar,\nNow at Your Home",
      subtitle: "Pure Ingredients. Traditional Recipes.\nMade with Love.",
      image: heroBg
    },
    ...heroBanners
  ];
  
  const currentBanner = displayBanners[currentSlideIndex % displayBanners.length];

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % displayBanners.length);
    }, 3500);
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
    if (banner.image.startsWith("data:") || banner.image.startsWith("http://") || banner.image.startsWith("https://")) {
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

  // Instagram Social Gallery items with real product images & category links
  const socialGalleryItems = [
    {
      image: '/images/desi_cow_ghee.jpg',
      title: 'Pure A2 Cow Ghee',
      category: 'Ghee',
      link: '/shop?category=Ghee'
    },
    {
      image: '/images/mango_pickle.jpg',
      title: 'Traditional Mango Pickle',
      category: 'Pickles',
      link: '/shop?category=Pickles'
    },
    {
      image: '/images/thekua.jpg',
      title: 'Homemade Bihari Thekua',
      category: 'Thekua',
      link: '/shop?category=Thekua'
    },
    {
      image: '/images/makhana.jpg',
      title: 'Mithila Roasted Makhana',
      category: 'Makhana',
      link: '/shop?category=Makhana'
    },
    {
      image: '/images/premium_combo_box.jpg',
      title: 'Festive Gift Collection',
      category: 'Gift Boxes',
      link: '/shop?category=Gift Boxes'
    },
    {
      image: '/images/sattu.jpg',
      title: 'Authentic Chana Sattu',
      category: 'Sattu',
      link: '/shop?category=Sattu'
    }
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
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1E3926]/80 hover:bg-[#1E3926] text-[#C8A25D] border border-[#C8A25D]/40 flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md shadow-xl hover:scale-110"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6 text-[#C8A25D]" />
            </button>

            {/* Right Chevron Button */}
            <button
              onClick={nextSlide}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1E3926]/80 hover:bg-[#1E3926] text-[#C8A25D] border border-[#C8A25D]/40 flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md shadow-xl hover:scale-110"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6 text-[#C8A25D]" />
            </button>

            {/* Bottom Indicator Dots & Slide Counter */}
            <div className="absolute bottom-2.5 right-6 sm:right-12 z-30 flex items-center space-x-2 bg-[#1E3926]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#C8A25D]/30 shadow-md">
              {displayBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 transition-all duration-300 cursor-pointer rounded-full ${
                    idx === currentSlideIndex % displayBanners.length
                      ? 'w-6 bg-[#C8A25D]'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] font-mono font-bold text-[#C8A25D] pl-1">
                {(currentSlideIndex % displayBanners.length) + 1}/{displayBanners.length}
              </span>
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



      {/* 1.3 Under-Hero 6-Feature Bar - Light ivory cream background, gold dividers, matching reference image */}
      <section className="bg-[#FAF6EF] border-y border-[#B8934E]/20 py-4 sm:py-5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-4 sm:gap-y-0">
            {[
              {
                icon: SmallBatchesIcon,
                title1: "HANDMADE",
                title2: "IN SMALL BATCHES",
                subtitle: "Made with Love"
              },
              {
                icon: BiharRecipesIcon,
                title1: "TRADITIONAL",
                title2: "BIHAR RECIPES",
                subtitle: "Passed Down Generations"
              },
              {
                icon: PremiumIngredientsIcon,
                title1: "PREMIUM",
                title2: "INGREDIENTS",
                subtitle: "Finest Quality"
              },
              {
                icon: NoPreservativesIcon,
                title1: "NO ARTIFICIAL",
                title2: "PRESERVATIVES",
                subtitle: "100% Natural"
              },
              {
                icon: PrideInBiharIcon,
                title1: "MADE WITH PRIDE",
                title2: "IN BIHAR",
                subtitle: "From Our Roots to You"
              },
              {
                icon: FreshShieldIcon,
                title1: "FRESHLY",
                title2: "PACKED",
                subtitle: "For Purity & Taste"
              }
            ].map((feat, idx, arr) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-center gap-2.5 sm:gap-3 py-2 px-2 text-left ${idx !== arr.length - 1 ? 'lg:border-r lg:border-[#B8934E]/25' : ''
                    }`}
                >
                  <IconComp />
                  <div className="flex flex-col justify-center">
                    <h4 className="font-extrabold text-[10px] sm:text-[11px] text-[#1E3926] tracking-wider uppercase leading-tight font-sans">
                      {feat.title1}
                      <span className="block">{feat.title2}</span>
                    </h4>
                    <p className="text-[9px] sm:text-[9.5px] text-[#8C6D34] font-serif italic mt-0.5 leading-none">
                      {feat.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
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
                  src="/images/premium_combo_box.jpg"
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

            {/* Heritage Item 1: Traditional Thekua */}
            <Link to="/shop?category=Thekua" className="group space-y-4 text-left block cursor-pointer">
              <div className="aspect-[4/3] rounded overflow-hidden shadow-md border border-brand-gold/15 bg-white group-hover:border-brand-gold transition-all duration-300">
                <img
                  src="/images/thekua.jpg"
                  alt="Authentic Bihar Thekua"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-lg font-bold text-brand-green font-serif group-hover:text-brand-gold transition-colors flex items-center justify-between">
                <span>Authentic Bihar Thekua & Sweets</span>
                <ArrowRight className="w-4 h-4 text-brand-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed font-sans">
                Handmade traditional Bihari Thekua prepared using pure organic jaggery (gur), whole wheat, cardamoms, and fried in pure desi ghee using traditional carved wooden molds (Saancha).
              </p>
            </Link>

            {/* Heritage Item 2: Pure Desi Cow Ghee */}
            <Link to="/shop?category=Ghee" className="group space-y-4 text-left block cursor-pointer">
              <div className="aspect-[4/3] rounded overflow-hidden shadow-md border border-brand-gold/15 bg-white group-hover:border-brand-gold transition-all duration-300">
                <img
                  src="/images/desi_cow_ghee.jpg"
                  alt="Pure A2 Bilona Cow Ghee"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-lg font-bold text-brand-green font-serif group-hover:text-brand-gold transition-colors flex items-center justify-between">
                <span>Pure A2 Bilona Cow Ghee</span>
                <ArrowRight className="w-4 h-4 text-brand-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed font-sans">
                Crafted from grass-fed cow milk using the ancient Vedic Bilona method. Rich granular texture, natural aroma, and essential healthy fats handed down through traditional Indian kitchen heritage.
              </p>
            </Link>

            {/* Heritage Item 3: Mithila Premium Makhana */}
            <Link to="/shop?category=Makhana" className="group space-y-4 text-left block cursor-pointer">
              <div className="aspect-[4/3] rounded overflow-hidden shadow-md border border-brand-gold/15 bg-white group-hover:border-brand-gold transition-all duration-300">
                <img
                  src="/images/makhana.jpg"
                  alt="Mithila Premium Fox Nuts"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-lg font-bold text-brand-green font-serif group-hover:text-brand-gold transition-colors flex items-center justify-between">
                <span>Mithila Premium Fox Nuts (Makhana)</span>
                <ArrowRight className="w-4 h-4 text-brand-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed font-sans">
                Mithila produces over 85% of the world's makhana. Sourced from organic water lily farms, the seeds are harvested, sun-dried, and hand-popped on wood fire pans to create large, crunchy puff snacks.
              </p>
            </Link>

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
            {socialGalleryItems.map((item, i) => (
              <Link
                key={i}
                to={item.link}
                className="relative aspect-square overflow-hidden rounded-lg border border-brand-gold/15 group shadow-sm hover:shadow-premium block cursor-pointer bg-white"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-green/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-brand-gold text-[10px] font-bold tracking-widest uppercase mb-1">
                    {item.category}
                  </span>
                  <span className="text-brand-cream text-[11px] font-bold uppercase tracking-wider font-sans border border-brand-gold/40 px-3 py-1 bg-brand-green/40 backdrop-blur-xs rounded shadow-xs">
                    View Post
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </section>

      </div>

      {/* Animated Floating Promotional Offer Banner */}
      <AnimatePresence>
        {showFloatingBanner && heroBanners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{
              y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              opacity: { duration: 0.4 }
            }}
            className="fixed bottom-6 left-6 z-[9999] max-w-xs sm:max-w-sm w-full bg-[#1E3926] text-white p-4 rounded-2xl border-2 border-[#C8A25D] shadow-2xl overflow-hidden"
          >
            {/* Glowing Accent Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C8A25D] via-[#FAF7F2] to-[#C8A25D]" />

            <button
              onClick={() => setShowFloatingBanner(false)}
              className="absolute top-2.5 right-2.5 text-[#C8A25D] hover:text-white bg-black/30 hover:bg-black/60 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-all cursor-pointer z-10"
              title="Close Banner"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3.5">
              {/* Banner Image Thumbnail */}
              {currentBanner?.image && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#C8A25D]/40 shrink-0 bg-black/20">
                  <img
                    src={getBannerImage(currentBanner)}
                    alt={currentBanner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0 pr-3 space-y-1">
                <span className="inline-block text-[9px] font-extrabold text-[#1E3926] bg-[#C8A25D] px-2 py-0.5 rounded uppercase tracking-widest shadow-xs">
                  ⚡ FESTIVE OFFER
                </span>
                <h4 className="font-serif font-extrabold text-xs text-white truncate leading-tight">
                  {currentBanner?.title || 'Special Heritage Discount'}
                </h4>
                <p className="text-[10px] text-[#FAF7F2]/80 line-clamp-1 font-sans">
                  {currentBanner?.subtitle || 'Order now and enjoy fresh Bihari delicacies!'}
                </p>
                <Link
                  to={currentBanner?.buttonLink || '/shop'}
                  onClick={() => setShowFloatingBanner(false)}
                  className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-[#C8A25D] hover:underline uppercase tracking-wider pt-0.5"
                >
                  <span>{currentBanner?.buttonText || 'Shop Now'}</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </motion.div>
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
