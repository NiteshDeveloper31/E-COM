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
import logoImg from '../assets/logo_transparent.png';

const LogoMonogram = () => (
  <img 
    src={logoImg} 
    alt="ReetSutra Logo" 
    className="w-10 h-10 md:w-11 md:h-11 object-contain shrink-0 filter brightness-110" 
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
    { name: 'Recipes & Blog', path: '#' }
  ];

  return (
    <>
      {/* Top Utility Bar */}
      <div className="hidden md:block w-full bg-[#FAF7F2] text-[#1E3926] border-b border-brand-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex justify-between items-center text-[10.5px] font-bold tracking-wide">
          <div className="flex items-center gap-1.5">
            <Leaf className="w-3 h-3 text-brand-gold fill-current shrink-0" />
            <span>Made with Tradition, Shared with Love, From Bihar to Your Home.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3 h-3 text-brand-gold shrink-0" />
              Free Shipping on Orders Above ₹999
            </span>
            <span className="text-brand-gold/30">|</span>
            <Link to="/profile/orders" className="flex items-center gap-1.5 hover:text-brand-gold transition-colors">
              <Phone className="w-3 h-3 text-brand-gold shrink-0" />
              Track Order
            </Link>
            <span className="text-brand-gold/30">|</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-brand-gold shrink-0" />
              Store Locator
            </span>
          </div>
        </div>
      </div>


      <header className="sticky top-0 z-50 w-full bg-brand-green border-b border-brand-gold/20 shadow-premium transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">

          {/* Mobile Menu Icon (Left on Mobile) */}
          <button
            className="p-2 -ml-2 text-brand-gold lg:hidden hover:text-brand-goldLight transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo Brand */}
          <Link to="/" className="flex items-center space-x-2 group">
            <LogoMonogram />
            <span 
              className="text-xl md:text-2.5xl font-medium text-brand-gold group-hover:text-brand-goldLight transition-all duration-300 leading-none tracking-normal"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              ReetSutra
            </span>
          </Link>


          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3.5">
            {menuItems.map((item) => {
              const currentFullPath = location.pathname + location.search;
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : currentFullPath === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative font-sans text-[10px] xl:text-xs tracking-wider uppercase font-bold transition-colors duration-200 py-2 shrink-0 ${isActive ? 'text-brand-gold' : 'text-brand-cream/85 hover:text-brand-gold'
                    }`}
                >
                  {item.name}
                  {item.name === 'Shop' && (
                    <ChevronDown className="inline w-3 h-3 ml-0.5 -mb-0.5" />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 md:space-x-4">

            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-brand-gold hover:text-brand-goldLight transition-colors duration-200 cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5 md:w-5.5 h-5.5" />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-brand-gold hover:text-brand-goldLight transition-colors duration-200"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 md:w-5.5 h-5.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-brand-green">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 text-brand-gold hover:text-brand-goldLight transition-colors duration-200"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 md:w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-brand-green shadow-sm">
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
                    className="flex items-center space-x-1 p-2 text-brand-gold hover:text-brand-goldLight transition-colors duration-200 focus:outline-none cursor-pointer"
                  >
                    <User className="w-5 h-5 md:w-5.5 h-5.5" />
                    <ChevronDown className="w-3.5 h-3.5 hidden sm:inline" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-52 rounded-md shadow-premium border border-brand-gold/10 bg-brand-ivory z-20 py-2"
                        >
                          <div className="px-4 py-2 border-b border-brand-creamDark">
                            <p className="text-xs text-brand-charcoalLight font-medium">Logged in as</p>
                            <p className="text-sm font-semibold text-brand-green truncate">{user.name}</p>
                          </div>
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-cream hover:text-brand-gold transition-colors font-medium"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            My Profile
                          </Link>
                          <Link
                            to="/profile/orders"
                            className="block px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-cream hover:text-brand-gold transition-colors font-medium"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            to="/profile/addresses"
                            className="block px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-cream hover:text-brand-gold transition-colors font-medium"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Saved Addresses
                          </Link>
                          <hr className="my-1 border-brand-creamDark" />
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileDropdownOpen(false);
                              navigate('/');
                            }}
                            className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
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
                  className="p-2 text-brand-gold hover:text-brand-goldLight transition-colors duration-200"
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
              className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-brand-ivory shadow-2xl z-[101] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-brand-gold/15 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="serif-header text-xl font-bold text-brand-green">REETSUTRA</span>
                  <span className="text-[8px] text-brand-gold font-serif mt-0.5 font-medium">रीत हमारी, स्वाद हमारी, साथ अपनों का</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-brand-green hover:bg-brand-cream hover:text-brand-gold transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="flex-1 px-4 py-6 space-y-2.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const currentFullPath = location.pathname + location.search;
                  const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : currentFullPath === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${isActive
                        ? 'bg-brand-green text-brand-cream'
                        : 'text-brand-green hover:bg-brand-cream hover:text-brand-gold'
                        }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-brand-creamDark bg-brand-cream/50">
                {user.isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-brand-green text-brand-cream flex items-center justify-center font-bold font-serif text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-green truncate">{user.name}</p>
                        <p className="text-xs text-brand-charcoalLight truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold uppercase tracking-wider">
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-2.5 bg-white border border-brand-green text-brand-green rounded hover:bg-brand-cream"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                          navigate('/');
                        }}
                        className="py-2.5 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-brand-charcoalLight text-center font-medium">Join ReetSutra for exclusive offers & historical flavors.</p>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full py-3 bg-brand-green text-brand-cream text-center text-sm font-bold uppercase tracking-wider rounded shadow-gold-glow hover:bg-brand-greenDark transition-colors"
                    >
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Search Overlay Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-brand-green/95 flex flex-col justify-center items-center px-4"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-brand-cream hover:bg-brand-cream/10 hover:text-brand-gold transition-colors cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl text-center space-y-6">
              <label className="block text-brand-gold uppercase tracking-[0.25em] text-xs font-bold font-sans">
                Explore Traditional Bihar Delicacies
              </label>
              <div className="relative border-b-2 border-brand-gold/40 focus-within:border-brand-gold py-2">
                <input
                  type="text"
                  placeholder="Search for Thekua, Silaao Khaja, Makhana, Tilkut..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-brand-cream text-xl md:text-3xl font-serif text-center placeholder-brand-cream/40 focus:outline-none pr-10"
                  autoFocus
                />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-brand-gold hover:text-brand-cream cursor-pointer">
                  <Search className="w-6 h-6 md:w-8 h-8" />
                </button>
              </div>
              <p className="text-xs md:text-sm text-brand-cream/60 font-sans italic">
                Try searching for: <span className="underline cursor-pointer text-brand-gold" onClick={() => setSearchQuery('Thekua')}>Thekua</span>,{' '}
                <span className="underline cursor-pointer text-brand-gold" onClick={() => setSearchQuery('Khaja')}>Khaja</span>,{' '}
                <span className="underline cursor-pointer text-brand-gold" onClick={() => setSearchQuery('Makhana')}>Makhana</span>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
