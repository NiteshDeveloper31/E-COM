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

import { API_BASE_URL, BACKEND_URL } from '../config';

import heroBg from '../assets/Final_Banner_Img_web.png';
import mobileHeroBg from '../assets/Mobile_view_Banner_image.jpg';
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

const PrideInBiharIcon = ({ className = "w-8 h-8 sm:w-10 sm:h-10 text-[#C8A25D] shrink-0" }) => (
  <svg className={className} viewBox="0 0 50 44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {/* Geographic Bihar Map Outline */}
    <path
      d="M 12 18 
         L 13 11 
         L 17 9 
         L 23 10 
         L 29 8 
         L 36 9 
         L 43 12 
         L 44 17 
         L 41 21 
         L 44 25 
         L 42 30 
         L 36 29 
         L 33 34 
         L 26 33 
         L 22 37 
         L 16 33 
         L 14 35 
         L 10 31 
         L 11 25 
         L 7 22 
         Z"
      fill="currentColor"
      fillOpacity="0.12"
      strokeWidth="1.8"
    />
    <path d="M 8 22 C 16 23, 26 21, 42 24" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.6" />
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
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showFloatingBanner, setShowFloatingBanner] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/banners`);
        const resJson = await response.json();
        if (response.ok && resJson.success) {
          const active = resJson.data.filter(b => b.status === "Active");
          setHeroBanners(active || []);
        }
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories?status=Active`);
        const resJson = await response.json();
        if (response.ok && resJson.success && Array.isArray(resJson.data) && resJson.data.length > 0) {
          setDynamicCategories(resJson.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchBanners();
    fetchCategories();
  }, []);

  // Main Default Hero + All Active Admin Banners
  const displayBanners = [
    {
      isDefault: true,
      title: "The Taste of Bihar,\nCrafted with Tradition",
      subtitle: "Every Bite, A Story of Bihar,\nShared With Loved Ones.",
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
    return `${BACKEND_URL}${banner.image.startsWith("/") ? "" : "/"}${banner.image}`;
  };

  const getMobileBannerImage = (banner) => {
    if (!banner || banner.isDefault || !banner.image) return mobileHeroBg;
    if (banner.image.startsWith("data:") || banner.image.startsWith("http://") || banner.image.startsWith("https://")) {
      return banner.image;
    }
    return `${BACKEND_URL}${banner.image.startsWith("/") ? "" : "/"}${banner.image}`;
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

  // Default fallback categories
  const defaultCategories = [
    { name: 'Pickles', displayName: 'Pickle', image: '/images/mango_pickle.jpg' },
    { name: 'Ghee', displayName: 'Ghee', image: '/images/desi_cow_ghee.jpg' },
    { name: 'Makhana', displayName: 'Makhana', image: '/images/makhana.jpg' },
    { name: 'Thekua', displayName: 'Thekua', image: '/images/thekua.jpg' },
    { name: 'Honey', displayName: 'Theney', image: '/images/honey.jpg' },
    { name: 'Sattu', displayName: 'Sattu', image: '/images/sattu.jpg' },
    { name: 'Snacks', displayName: 'Snacks', image: '/images/snacks.jpg' },
    { name: 'Gift Boxes', displayName: 'Gift Boxes', image: '/images/premium_combo_box.jpg' }
  ];

  const categories = dynamicCategories.length > 0 ? dynamicCategories : defaultCategories;

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

      {/* 1. Premium Hero Section */}

      {/* 1A. MOBILE VIEW: Dedicated Mobile Hero Layout using Mobile_view_Banner_image.jpg */}
      <div className="block lg:hidden relative w-full overflow-hidden border-b border-brand-gold/15 bg-[#FAF6EF]">
        <div className="relative w-full overflow-hidden">
          {/* Mobile Banner Image */}
          <img
            src={getMobileBannerImage(currentBanner)}
            alt="ReetSutra Mobile Banner"
            className="w-full h-auto object-contain block"
          />

          {/* Render Text Overlay ONLY for custom active Admin Banners (Default banner has pre-rendered graphic text) */}
          {!currentBanner.isDefault && (
            <div className="absolute inset-x-0 top-[15%] px-4 flex flex-col items-center text-center space-y-2.5 z-10">
              <div className="bg-white/85 backdrop-blur-md p-4 rounded-xl shadow-lg border border-[#C5972E]/30 w-full max-w-[320px]">
                <h1
                  className="text-[22px] font-extrabold tracking-tight leading-tight text-[#143021] font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {currentBanner.title}
                </h1>
                <p
                  className="text-[12px] text-[#143021] font-medium leading-relaxed font-serif mt-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {currentBanner.subtitle}
                </p>
              </div>
            </div>
          )}

          {/* Buttons Overlay for Mobile View - Shifted 15px higher up */}
          <div className="absolute left-[4%] xs:left-[5%] sm:left-[6%] bottom-[23%] xs:bottom-[24%] sm:bottom-[25%] z-20 flex flex-col items-start space-y-1.5 xs:space-y-2">
            {/* SHOP NOW Button */}
            <Link
              to={currentBanner.buttonLink || "/shop"}
              className="bg-[#143021] hover:bg-[#0E2317] text-[#C5972E] font-extrabold text-[10px] xs:text-[11px] tracking-[0.14em] uppercase py-1.5 xs:py-2 px-3.5 xs:px-4 rounded-md shadow-md flex items-center justify-center space-x-1.5 border border-[#C5972E]/40 active:scale-95 transition-all w-[150px] xs:w-[170px]"
            >
              <span>{currentBanner.buttonText || "SHOP NOW"}</span>
              <Leaf className="w-3.5 h-3.5 text-[#C5972E] fill-current shrink-0" />
            </Link>

            {/* EXPLORE COLLECTION Button */}
            <Link
              to="/shop"
              className="bg-[#FAF6EF]/95 hover:bg-[#FAF6EF] border border-[#C5972E]/60 text-[#7A5822] font-extrabold text-[10px] xs:text-[11px] tracking-[0.14em] uppercase py-1.5 xs:py-2 px-3.5 xs:px-4 rounded-md shadow-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all w-[150px] xs:w-[170px]"
            >
              <span>EXPLORE COLLECTION</span>
            </Link>
          </div>

          {/* Mobile Slider Controls */}
          {displayBanners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#143021]/80 text-[#C5972E] border border-[#C5972E]/40 flex items-center justify-center shadow-md active:scale-95"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 text-[#C5972E]" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#143021]/80 text-[#C5972E] border border-[#C5972E]/40 flex items-center justify-center shadow-md active:scale-95"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4 text-[#C5972E]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 1B. DESKTOP VIEW: Clean Full-Width Banner Image using new_banner_img.jpg */}
      <section className="hidden lg:block relative w-full overflow-hidden border-b border-brand-gold/15 bg-[#FAF6EF]">
        <div className="relative w-full overflow-hidden">
          <img
            src={getBannerImage(currentBanner)}
            alt="ReetSutra Desktop Banner"
            className="w-full h-auto object-contain block"
          />

          {/* Overlay Buttons for Default Desktop Banner positioned 20px higher up */}
          {currentBanner.isDefault && (
            <div className="absolute left-[7.5%] lg:left-[8.5%] xl:left-[9.5%] bottom-[4.3%] lg:bottom-[4.5%] xl:bottom-[5%] z-20 flex flex-row items-center space-x-3 xl:space-x-4">
              {/* SHOP NOW Button */}
              <Link
                to={currentBanner.buttonLink || "/shop"}
                className="bg-[#143021] hover:bg-[#0E2317] text-[#C5972E] font-extrabold text-[11px] lg:text-[12px] xl:text-[13px] tracking-[0.14em] uppercase py-2 lg:py-2.5 px-5 xl:px-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 flex items-center justify-center space-x-2 border border-[#C5972E]/40 cursor-pointer active:scale-95 min-w-[170px] lg:min-w-[190px] xl:min-w-[210px]"
              >
                <span>{currentBanner.buttonText || "SHOP NOW"}</span>
                <Leaf className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#C5972E] fill-current" />
              </Link>

              {/* EXPLORE COLLECTION Button */}
              <Link
                to="/shop"
                className="bg-[#FAF6EF]/95 hover:bg-[#FAF6EF] text-[#7A5822] hover:text-[#5B4017] font-extrabold text-[11px] lg:text-[12px] xl:text-[13px] tracking-[0.14em] uppercase py-2 lg:py-2.5 px-5 xl:px-6 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-300 flex items-center justify-center space-x-2 border border-[#C5972E]/70 cursor-pointer active:scale-95 min-w-[170px] lg:min-w-[190px] xl:min-w-[210px]"
              >
                <span>EXPLORE COLLECTION</span>
              </Link>
            </div>
          )}

          {/* Render Text Overlay ONLY for custom active Admin Banners (Default banner has pre-rendered graphic text) */}
          {!currentBanner.isDefault && (
            <div className="absolute inset-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 z-10 flex items-center">
              <div className="max-w-lg space-y-3 flex flex-col items-center text-center p-6 bg-white/85 backdrop-blur-md rounded-2xl shadow-xl border border-[#C5972E]/30">
                <h1
                  className="text-[32px] xl:text-[36px] font-extrabold tracking-wide leading-tight text-[#143021] font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {currentBanner.title}
                </h1>
                <p
                  className="text-[14px] text-[#143021] font-medium leading-relaxed tracking-wide font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {currentBanner.subtitle}
                </p>
                {currentBanner.buttonText && (
                  <Link
                    to={currentBanner.buttonLink || "/shop"}
                    className="bg-[#143021] hover:bg-[#0E2317] text-[#C5972E] font-extrabold text-[11px] tracking-widest uppercase py-3 px-8 rounded-md shadow-md flex items-center justify-center space-x-2"
                  >
                    <span>{currentBanner.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5972E]" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Desktop Slider Controls */}
          {displayBanners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#143021]/80 hover:bg-[#143021] text-[#C5972E] border border-[#C5972E]/40 flex items-center justify-center shadow-lg active:scale-95 transition-all"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5 text-[#C5972E]" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#143021]/80 hover:bg-[#143021] text-[#C5972E] border border-[#C5972E]/40 flex items-center justify-center shadow-lg active:scale-95 transition-all"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5 text-[#C5972E]" />
              </button>
            </>
          )}
        </div>
      </section>

      {/* 1.3 Under-Hero 6-Feature Bar - Light ivory cream background, gold dividers, matching reference image */}
      <section className="bg-[#FAF6EF] border-y border-[#B8934E]/20 py-5 sm:py-6 px-3 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6 md:gap-y-0 gap-x-2 sm:gap-x-4">
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
                  className={`flex items-center justify-start gap-2.5 sm:gap-3 py-1.5 px-1 sm:px-2 text-left w-full max-w-[200px] xs:max-w-[220px] mx-auto ${idx !== arr.length - 1 ? 'lg:border-r lg:border-[#B8934E]/25' : ''
                    }`}
                >
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                    <IconComp />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="font-extrabold text-[9.5px] xs:text-[10px] sm:text-[11px] text-[#1E3926] tracking-wider uppercase leading-tight font-sans">
                      {feat.title1}
                      <span className="block">{feat.title2}</span>
                    </h4>
                    <p className="text-[8.5px] xs:text-[9px] sm:text-[9.5px] text-[#8C6D34] font-serif italic mt-0.5 leading-none">
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
                    <Link
                      key={idx}
                      to={item.path}
                      className="group flex items-center justify-between border-b border-brand-creamDark pb-2.5 pr-2 hover:border-brand-gold transition-all duration-300 cursor-pointer"
                    >
                      <span className="font-bold text-xs uppercase tracking-wider text-brand-green group-hover:text-brand-gold transition-colors flex items-center gap-1.5">
                        {item.name}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-gold opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
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
