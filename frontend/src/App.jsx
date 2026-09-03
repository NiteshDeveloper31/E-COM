import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReetSutraProvider } from './context/ReetSutraContext';

// Core Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CartNotification from './components/CartNotification';
import WhatsAppButton from './components/WhatsAppButton';

// Page Components
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentUI from './pages/PaymentUI';
import OrderSuccess from './pages/OrderSuccess';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import RecipesBlog from './pages/RecipesBlog';
import { AboutUs, ContactUs, PrivacyPolicy, TermsConditions } from './pages/InfoPages';

export default function App() {
  return (
    <ReetSutraProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-brand-cream text-brand-charcoal font-sans antialiased">
          
          {/* Header */}
          <Header />

          {/* Global Cart Add Toast Notification */}
          <CartNotification />

          {/* Main page content area */}
          <main className="flex-grow">
            <Routes>
              
              {/* Main Flows */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-ui" element={<PaymentUI />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              
              {/* Wishlist */}
              <Route path="/wishlist" element={<Wishlist />} />

              {/* Authentication */}
              <Route path="/login" element={<Auth initialMode="login" />} />
              <Route path="/register" element={<Auth initialMode="register" />} />
              <Route path="/forgot-password" element={<Auth initialMode="forgot" />} />

              {/* Account / Profile (tab-driven matching routes) */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/orders" element={<Profile />} />
              <Route path="/profile/addresses" element={<Profile />} />
              <Route path="/profile/track-order/:orderId" element={<Profile />} />

              {/* Information / Policy / Blog pages */}
              <Route path="/about" element={<AboutUs />} />
              <Route path="/recipes-blog" element={<RecipesBlog />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />

              {/* Fallback route */}
              <Route path="*" element={<Home />} />

            </Routes>
          </main>

          {/* Footer */}
          <Footer />

          {/* Floating Sticky WhatsApp Button */}
          <WhatsAppButton />

        </div>
      </Router>
    </ReetSutraProvider>
  );
}
