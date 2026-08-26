import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Leaf,
  Truck,
  Phone,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/rs_monogram_logo.png';

const LogoMonogram = () => (
  <img
    src={logoImg}
    alt="ReetSutra Monogram Logo"
    className="h-8 md:h-9 object-contain shrink-0 mix-blend-multiply"
  />
);

export default function Header() {
  const { cart, wishlist, user, logout } = useReetSutra();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Ghee', path: '/shop?category=Ghee' },
    { name: 'Pickles', path: '/shop?category=Pickles' },
    { name: 'Makhana', path: '/shop?category=Makhana' },
    { name: 'Thekua', path: '/shop?category=Thekua' },
    { name: 'Gift Boxes', path: '/shop?category=Gift Boxes' },
    { name: 'Combo Offers', path: '/shop?category=Combos' },
    { name: 'Our Story', path: '/about' },
    { name: 'Recipes & Blog', path: '/recipes-blog' }
  ];

  return (
    <>
      {/* Top Utility Bar with SHOP NOW Button Deep Forest Green Color */}
      <div className="hidden md:block w-full bg-[#143021] text-[#C5972E] border-b border-[#C5972E]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex justify-between items-center text-[10.5px] font-extrabold tracking-wider uppercase">
          <div className="flex items-center gap-1.5 text-[#C5972E]">
            <Leaf className="w-3 h-3 text-[#C5972E] fill-current shrink-0" />
            <span className="text-[#FAF6EF]">Made with Tradition, Shared with Love.</span>
          </div>
          <div className="flex items-center gap-4 text-[#FAF6EF]">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3 h-3 text-[#C5972E] shrink-0" />
              Free Shipping on Orders Above ₹999
            </span>
            <span className="text-[#C5972E]/40">|</span>
            <Link to="/profile/orders" className="flex items-center gap-1.5 hover:text-[#C5972E] transition-colors">
              <Phone className="w-3 h-3 text-[#C5972E] shrink-0" />
              Track Order
            </Link>
            <span className="text-[#C5972E]/40">|</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#C5972E] shrink-0" />
              Store Locator
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar Header: Warm Cream Background (#FAF6EF) & Exact Matching Nav Item Styling */}
      <header className="sticky top-0 z-50 w-full bg-[#FAF6EF] border-b border-[#C5972E]/20 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[84px] md:min-h-[96px] py-2 md:py-2.5 flex justify-between items-center">

          {/* Mobile Menu Icon (Left on Mobile) */}
          <button
            className="p-2 -ml-2 text-[#143021] lg:hidden hover:text-[#C5972E] transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo Brand: Vertically Stacked RS Monogram + ReetSutra + Tagline */}
          <Link to="/" className="flex flex-col items-center justify-center text-center group shrink-0 py-0.5">
            <LogoMonogram />
            <span
              className="text-lg md:text-2xl font-extrabold tracking-tight transition-all duration-300 leading-none mt-1"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              <span className="text-[#143021]">Reet</span>
              <span className="text-[#C5972E]">Sutra</span>
            </span>
            <span className="text-[7.5px] md:text-[8.5px] font-sans font-bold tracking-[0.24em] text-[#143021]/85 uppercase mt-0.5">
              Where Tradition Meets Purity
            </span>
          </Link>

          {/* Desktop Navigation: Matching Reference Image Color & Serif Typography */}
          <nav className="hidden lg:flex items-center space-x-1.5 xl:space-x-3 shrink min-w-0">
            {menuItems.map((item) => {
              const currentFullPath = location.pathname + location.search;
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : currentFullPath === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  className={`relative text-[10px] xl:text-[11.5px] tracking-wider uppercase font-extrabold transition-colors duration-200 py-1.5 whitespace-nowrap shrink-0 ${isActive ? 'text-[#143021]' : 'text-[#2C2216]/85 hover:text-[#C5972E]'
                    }`}
                >
                  {item.name}
                  {item.name === 'Shop' && (
                    <ChevronDown className="inline w-3 h-3 ml-0.5 -mb-0.5 text-[#2C2216]/70" />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#143021]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-2.5 shrink-0 z-10 ml-2">

            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#2C2216] hover:text-[#C5972E] transition-colors duration-200 cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5 md:w-5.5 h-5.5" />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-[#2C2216] hover:text-[#C5972E] transition-colors duration-200"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 md:w-5.5 h-5.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A37820] text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 text-[#2C2216] hover:text-[#C5972E] transition-colors duration-200"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 md:w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A37820] text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown / Login */}
            <div className="relative">
              {user.isLoggedIn ? (
                <div>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-1 p-2 text-[#143021] hover:text-[#C5972E] transition-colors duration-200 focus:outline-none cursor-pointer"
                  >
                    <User className="w-5 h-5 md:w-5.5 h-5.5" />
                    <ChevronDown className="w-3.5 h-3.5 hidden sm:inline" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-52 rounded-lg shadow-xl border border-[#C5972E]/20 bg-[#FAF6EF] z-20 py-2"
                        >
                          <div className="px-4 py-2 border-b border-[#C5972E]/15">
                            <p className="text-xs text-gray-500 font-medium">Logged in as</p>
                            <p className="text-sm font-bold text-[#143021] truncate">{user.name}</p>
                          </div>
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-[#143021] hover:bg-[#143021] hover:text-[#C5972E] transition-colors font-semibold"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            My Profile
                          </Link>
                          <Link
                            to="/profile/orders"
                            className="block px-4 py-2 text-sm text-[#143021] hover:bg-[#143021] hover:text-[#C5972E] transition-colors font-semibold"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            to="/profile/addresses"
                            className="block px-4 py-2 text-sm text-[#143021] hover:bg-[#143021] hover:text-[#C5972E] transition-colors font-semibold"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Saved Addresses
                          </Link>
                          <hr className="my-1 border-[#C5972E]/15" />
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileDropdownOpen(false);
                              navigate('/');
                            }}
                            className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-[#143021] hover:text-[#C5972E] transition-colors duration-200"
                  aria-label="Login"
                >
                  <User className="w-5 h-5 md:w-5.5 h-5.5" />
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Slide-out Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-[100]"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-[#FAF6EF] shadow-2xl z-[101] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#C5972E]/20 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <LogoMonogram />
                  <div className="flex flex-col items-start leading-none">
                    <span
                      className="font-serif text-xl font-extrabold tracking-tight"
                      style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                    >
                      <span className="text-[#143021]">Reet</span>
                      <span className="text-[#C5972E]">Sutra</span>
                    </span>
                    <span className="text-[8px] font-sans font-bold tracking-[0.2em] text-[#143021]/85 uppercase mt-0.5">
                      THE TASTE OF BIHAR
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-[#143021] hover:bg-white hover:text-[#C5972E] transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Menu Items */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-extrabold text-[#143021] hover:bg-white hover:text-[#C5972E] rounded-lg transition-colors tracking-wider uppercase font-sans border-b border-[#C5972E]/10"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-[#C5972E]/20 bg-white space-y-3">
                {user.isLoggedIn ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full py-2.5 bg-red-50 text-red-600 font-extrabold text-xs tracking-wider uppercase rounded-lg border border-red-200 flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-[#143021] text-[#C5972E] font-extrabold text-xs tracking-wider uppercase rounded-lg border border-[#C5972E]/40 flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <User className="w-4 h-4 text-[#C5972E]" />
                    <span>Login / Register</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full-width Search Bar Popup Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-0 z-[110] bg-white border-b border-[#C5972E]/30 p-4 sm:p-6 shadow-xl"
          >
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <Search className="w-6 h-6 text-[#C5972E] shrink-0" />
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search pure ghee, pickles, makhana, thekua..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-base md:text-lg font-serif text-[#143021] placeholder-gray-400 focus:outline-none"
                />
              </form>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-gray-500 hover:text-[#143021] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
