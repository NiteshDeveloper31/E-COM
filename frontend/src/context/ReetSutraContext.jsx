import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const ReetSutraContext = createContext();

export const useReetSutra = () => useContext(ReetSutraContext);

export const ReetSutraProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [popupTimeoutId, setPopupTimeoutId] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("rs_token") || null);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('reetsutra_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('reetsutra_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('reetsutra_user');
    return saved ? JSON.parse(saved) : { isLoggedIn: false };
  });

  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);

  // Toast System state
  const [toast, setToast] = useState(null);
  const [toastTimeoutId, setToastTimeoutId] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    setToast({ message, type });
    const id = setTimeout(() => {
      setToast(null);
    }, 4000);
    setToastTimeoutId(id);
  }, [toastTimeoutId]);

  const logout = useCallback(() => {
    localStorage.removeItem("rs_token");
    localStorage.removeItem("reetsutra_user");
    setToken(null);
    setUser({ isLoggedIn: false });
  }, []);

  // Helper to map backend order details to frontend expected structures
  const mapOrderData = useCallback((order) => {
    if (!order) return order;
    return {
      ...order,
      id: order._id || order.id,
      date: order.createdAt || order.date,
      status: order.orderStatus || order.status,
      items: (order.items || []).map(item => ({
        ...item,
        product: {
          name: item.productName || item.product?.name || "Traditional Item",
          price: item.price || item.product?.price || 0,
          discount: item.discount || item.product?.discount || 0,
          image: item.image || item.product?.image || "",
          category: item.category || item.product?.category || "Traditional Food"
        }
      })),
      trackingTimeline: (order.timeline || order.trackingTimeline || []).map(log => ({
        status: log.status,
        time: new Date(log.date || log.time).toLocaleString(),
        completed: true
      }))
    };
  }, []);

  // Fetch Products Catalog
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products?limit=100");
      const resJson = await response.json();
      
      if (response.ok && resJson.success) {
        const mapped = resJson.data.products.map(p => ({
          ...p,
          id: p._id || p.id,
          tagline: p.tagline || p.description?.slice(0, 60) || 'Delicious traditional snack item',
          discount: p.compareAtPrice ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0,
          rating: p.rating || 4.7,
          reviews: p.reviewsCount || 15,
          bestseller: p.rating >= 4.8,
          category: p.category?.name || 'Uncategorized',
          image: p.image,
          description: p.description,
          ingredients: p.ingredients || ['Natural ingredients', 'Prepared with love', 'Hygienically Packed'],
          benefits: p.benefits || ['High quality', 'Rich taste', 'No artificial colors'],
          weight: p.weight || '400g'
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch products from backend:", err);
    }
  }, []);

  const [settings, setSettings] = useState({
    contactEmail: "hello@reetsutra.com",
    contactPhone: "+91 91234 56789",
    contactAddress: "Patna, Bihar, India",
    socialInstagram: "https://instagram.com/reetsutra",
    socialFacebook: "https://facebook.com/reetsutra",
    socialYoutube: "https://youtube.com/@reetsutra",
    socialTelegram: "https://t.me/reetsutra",
    socialWhatsapp: "https://wa.me/919123456789",
    socialTwitter: "https://twitter.com/reetsutra",
    socialLinkedin: "https://linkedin.com/company/reetsutra"
  });

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/settings");
      const resJson = await response.json();
      if (response.ok && resJson.success && resJson.data) {
        setSettings(resJson.data);
      }
    } catch (err) {
      console.error("Failed to fetch settings in frontend:", err);
    }
  }, []);

  // Fetch initially and set up 1-minute polling for products catalog & settings
  useEffect(() => {
    fetchProducts();
    fetchSettings();

    const interval = setInterval(() => {
      fetchProducts();
      fetchSettings();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchProducts, fetchSettings]);

  // Fetch Customer Addresses
  const fetchAddresses = useCallback(async (activeToken) => {
    if (!activeToken || !user.id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/customers/${user.id}/addresses`, {
        headers: { "Authorization": `Bearer ${activeToken}` }
      });
      if (res.status === 401) {
        logout();
        showToast("Session expired. Please login again.");
        return;
      }
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        const mapped = (resJson.data || []).map(addr => ({
          ...addr,
          id: addr._id || addr.id,
          street: addr.line || addr.street,
          type: addr.tag || addr.type
        }));
        setAddresses(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  }, [user.id]);

  // Fetch and Poll Customer Orders (My Orders / Tracking Timeline)
  const fetchOrders = useCallback(async (activeToken) => {
    if (!activeToken) return;
    try {
      const res = await fetch("http://localhost:5000/api/orders/my-orders", {
        headers: { "Authorization": `Bearer ${activeToken}` }
      });
      if (res.status === 401) {
        logout();
        showToast("Session expired. Please login again.");
        return;
      }
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        const mapped = (resJson.data.orders || []).map(mapOrderData);
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
    }
  }, [mapOrderData]);

  // Initialize and poll orders & addresses when token changes
  useEffect(() => {
    if (!token) {
      setOrders([]);
      setAddresses([]);
      return;
    }

    fetchOrders(token);
    fetchAddresses(token);

    // Setup 30s Polling for user orders (satisfying the frontend requirement)
    const interval = setInterval(() => {
      console.log("[POLLING FRONTEND] Syncing orders timeline logs...");
      fetchOrders(token);
    }, 30000);

    return () => clearInterval(interval);
  }, [token, fetchOrders, fetchAddresses]);

  // Persist State
  useEffect(() => {
    localStorage.setItem('reetsutra_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('reetsutra_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart Functions
  const addToCart = (productId, quantity = 1) => {
    const product = products.find(p => p.id === productId || p._id === productId);
    if (!product) return;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === productId || item.product._id === productId);
      if (existing) {
        return prevCart.map(item =>
          (item.product.id === productId || item.product._id === productId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });

    setLastAddedItem({ product, quantity });
    setShowCartPopup(true);

    if (popupTimeoutId) clearTimeout(popupTimeoutId);

    const tId = setTimeout(() => {
      setShowCartPopup(false);
    }, 4000);
    setPopupTimeoutId(tId);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId && item.product._id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        (item.product.id === productId || item.product._id === productId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist Functions
  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Address Functions (Persisted in Backend)
  const addAddress = async (newAddr) => {
    const activeToken = localStorage.getItem("rs_token");
    if (!activeToken || !user.id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/customers/${user.id}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify(newAddr)
      });
      if (response.status === 401) {
        logout();
        showToast("Session expired. Please login again.");
        return;
      }
      const resJson = await response.json();
      if (response.ok && resJson.success) {
        const mappedAddr = {
          ...resJson.data,
          id: resJson.data._id || resJson.data.id,
          street: resJson.data.line || resJson.data.street,
          type: resJson.data.tag || resJson.data.type
        };
        setAddresses(prev => [...prev, mappedAddr]);
        showToast("New delivery address saved successfully.", "success");
        return mappedAddr;
      } else {
        showToast(resJson.message || "Failed to add address.");
      }
    } catch (err) {
      console.error("Failed to add address:", err);
      showToast("Error adding address.");
    }
  };

  const deleteAddress = async (addressId) => {
    const activeToken = localStorage.getItem("rs_token");
    if (!activeToken || !user.id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/customers/${user.id}/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${activeToken}`
        }
      });
      if (response.status === 401) {
        logout();
        showToast("Session expired. Please login again.");
        return;
      }
      const resJson = await response.json();
      if (response.ok && resJson.success) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId && addr._id !== addressId));
        showToast("Address deleted successfully.", "success");
      } else {
        showToast(resJson.message || "Failed to delete address.");
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
      showToast("Error deleting address.");
    }
  };

  const updateAddress = async (addressId, updatedFields) => {
    const activeToken = localStorage.getItem("rs_token");
    if (!activeToken || !user.id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/customers/${user.id}/addresses/${addressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify(updatedFields)
      });
      if (response.status === 401) {
        logout();
        showToast("Session expired. Please login again.");
        return;
      }
      const resJson = await response.json();
      if (response.ok && resJson.success) {
        const mappedAddr = {
          ...resJson.data,
          id: resJson.data._id || resJson.data.id,
          street: resJson.data.line || resJson.data.street,
          type: resJson.data.tag || resJson.data.type
        };
        setAddresses(prev => prev.map(addr => addr.id === addressId ? mappedAddr : addr));
        showToast("Address updated successfully.", "success");
        return mappedAddr;
      } else {
        showToast(resJson.message || "Failed to update address.");
      }
    } catch (err) {
      console.error("Failed to update address:", err);
      showToast("Error updating address.");
    }
  };

  const setDefaultAddress = async (addressId) => {
    const activeToken = localStorage.getItem("rs_token");
    if (!activeToken || !user.id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/customers/${user.id}/addresses/${addressId}/default`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${activeToken}`
        }
      });
      if (response.status === 401) {
        logout();
        showToast("Session expired. Please login again.");
        return;
      }
      const resJson = await response.json();
      if (response.ok && resJson.success) {
        setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: addr.id === addressId })));
        showToast("Default address updated.", "success");
      } else {
        showToast(resJson.message || "Failed to set default address.");
      }
    } catch (err) {
      console.error("Failed to set default address:", err);
      showToast("Error setting default address.");
    }
  };

  // Profile Functions (Persisted in Backend)
  const updateProfile = async (profileData) => {
    const activeToken = localStorage.getItem("rs_token");
    if (!activeToken) return;

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        })
      });
      if (response.status === 401) {
        logout();
        showToast("Session expired. Please login again.");
        return false;
      }
      const resJson = await response.json();
      if (response.ok && resJson.success) {
        const updatedUser = {
          ...user,
          ...resJson.data.user,
          isLoggedIn: true
        };
        setUser(updatedUser);
        localStorage.setItem("reetsutra_user", JSON.stringify(updatedUser));
        showToast("Profile credentials updated successfully.", "success");
        return true;
      } else {
        showToast(resJson.message || "Failed to update profile.");
        return false;
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast("Error updating profile.");
      return false;
    }
  };



  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const resJson = await response.json();
      
      if (!response.ok) {
        throw new Error(resJson.message || "Login failed.");
      }

      const { token: newToken, user: userProfile } = resJson.data;

      localStorage.setItem("rs_token", newToken);
      localStorage.setItem("reetsutra_user", JSON.stringify({ ...userProfile, isLoggedIn: true }));
      
      setToken(newToken);
      setUser({ ...userProfile, isLoggedIn: true });
      showToast("Welcome back! Login successful.", "success");
      return true;
    } catch (err) {
      showToast(`Login failed: ${err.message}`);
      return false;
    }
  };

  const register = async (name, email, password, address = null) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address ? { name, email, password, address } : { name, email, password })
      });
      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(resJson.message || "Registration failed.");
      }

      const { token: newToken, user: userProfile } = resJson.data;

      localStorage.setItem("rs_token", newToken);
      localStorage.setItem("reetsutra_user", JSON.stringify({ ...userProfile, isLoggedIn: true }));

      setToken(newToken);
      setUser({ ...userProfile, isLoggedIn: true });
      showToast("Account created successfully. Welcome to ReetSutra!", "success");
      return true;
    } catch (err) {
      showToast(`Registration failed: ${err.message}`);
      return false;
    }
  };

  const sendOTP = async (phone, password = null, isLogin = false) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, isLogin })
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "Failed to send OTP.");
      }
      showToast(resJson.message, "success");
      return resJson.data;
    } catch (err) {
      showToast(err.message);
      return null;
    }
  };

  const verifyOTPLogin = async (phone, otp) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "OTP Verification failed.");
      }

      const { token: newToken, user: userProfile } = resJson.data;

      localStorage.setItem("rs_token", newToken);
      localStorage.setItem("reetsutra_user", JSON.stringify({ ...userProfile, isLoggedIn: true }));

      setToken(newToken);
      setUser({ ...userProfile, isLoggedIn: true });
      showToast("Welcome back! Login successful.", "success");
      return true;
    } catch (err) {
      showToast(err.message);
      return false;
    }
  };

  const registerWithOTP = async (name, email, phone, password, otp, address) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, otp, address })
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "Registration failed.");
      }

      const { token: newToken, user: userProfile } = resJson.data;

      localStorage.setItem("rs_token", newToken);
      localStorage.setItem("reetsutra_user", JSON.stringify({ ...userProfile, isLoggedIn: true }));

      setToken(newToken);
      setUser({ ...userProfile, isLoggedIn: true });
      showToast("Registration completed & logged in automatically!", "success");
      return true;
    } catch (err) {
      showToast(err.message);
      return false;
    }
  };

  const changePhoneWithOTP = async (newPhone, otp) => {
    const activeToken = localStorage.getItem("rs_token");
    if (!activeToken) return false;

    try {
      const response = await fetch("http://localhost:5000/api/auth/change-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify({ newPhone, otp })
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "Failed to update phone number.");
      }

      const updatedUser = {
        ...user,
        ...resJson.data.user,
        isLoggedIn: true
      };
      setUser(updatedUser);
      localStorage.setItem("reetsutra_user", JSON.stringify(updatedUser));
      showToast("Mobile number verified and updated successfully!", "success");
      return true;
    } catch (err) {
      showToast(err.message);
      return false;
    }
  };

  const changeEmailWithOTP = async (newEmail, otp) => {
    const activeToken = localStorage.getItem("rs_token");
    if (!activeToken) return false;

    try {
      const response = await fetch("http://localhost:5000/api/auth/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify({ newEmail, otp })
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "Failed to update email address.");
      }

      const updatedUser = {
        ...user,
        ...resJson.data.user,
        isLoggedIn: true
      };
      setUser(updatedUser);
      localStorage.setItem("reetsutra_user", JSON.stringify(updatedUser));
      showToast("Email address verified and updated successfully!", "success");
      return true;
    } catch (err) {
      showToast(err.message);
      return false;
    }
  };

  // Orders Checkout Handler (POST /api/orders)
  const placeOrder = async (orderData) => {
    const activeToken = localStorage.getItem("rs_token");
    if (!activeToken) {
      showToast("Please login to place your order.");
      return null;
    }

    try {
      const isBuyNow = !!orderData.buyNowItem;
      const orderItems = isBuyNow
        ? [
            {
              productId: orderData.buyNowItem.product._id || orderData.buyNowItem.product.id,
              quantity: orderData.buyNowItem.quantity
            }
          ]
        : cart.map(item => ({
            productId: item.product._id || item.product.id,
            quantity: item.quantity
          }));

      const payload = {
        items: orderItems,
        shippingAddress: {
          name: orderData.address.name || "",
          phone: orderData.address.phone || "",
          line: orderData.address.street || orderData.address.line || "",
          city: orderData.address.city,
          state: orderData.address.state,
          zip: orderData.address.zip
        },
        billingAddress: orderData.billingAddress || null,
        paymentMethod: orderData.paymentMethod || "COD"
      };

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });
      if (response.status === 401) {
        logout();
        showToast("Session expired. Please login again.");
        return null;
      }

      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(resJson.message || "Order placement failed.");
      }

      // Add standard fields dynamically for local UI tracking
      const createdOrder = mapOrderData(resJson.data);

      setOrders(prev => [createdOrder, ...prev]);

      if (!isBuyNow) {
        clearCart();
      }

      showToast("Order placed successfully!", "success");
      return createdOrder.id;
    } catch (err) {
      showToast(`Failed to place order: ${err.message}`);
      return null;
    }
  };

  const initializeRazorpayOrder = async (orderData) => {
    const activeToken = localStorage.getItem("rs_token");
    if (!activeToken) {
      showToast("Please login to place your order.");
      return null;
    }

    try {
      const isBuyNow = !!orderData.buyNowItem;
      const orderItems = isBuyNow
        ? [
            {
              productId: orderData.buyNowItem.product._id || orderData.buyNowItem.product.id,
              quantity: orderData.buyNowItem.quantity
            }
          ]
        : cart.map(item => ({
            productId: item.product._id || item.product.id,
            quantity: item.quantity
          }));

      const payload = {
        items: orderItems,
        shippingAddress: {
          name: orderData.address.name || "",
          phone: orderData.address.phone || "",
          line: orderData.address.street || orderData.address.line || "",
          city: orderData.address.city,
          state: orderData.address.state,
          zip: orderData.address.zip
        },
        billingAddress: orderData.billingAddress || null
      };

      const response = await fetch("http://localhost:5000/api/orders/razorpay/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        logout();
        showToast("Session expired. Please login again.");
        return null;
      }

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "Failed to initialize payment order.");
      }

      return resJson.data;
    } catch (err) {
      showToast(`Payment error: ${err.message}`);
      return null;
    }
  };

  const verifyRazorpayPayment = async (verificationData) => {
    const activeToken = localStorage.getItem("rs_token");
    if (!activeToken) {
      showToast("Session expired. Please login again.");
      return false;
    }

    try {
      const response = await fetch("http://localhost:5000/api/orders/razorpay/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          orderId: verificationData.orderId,
          razorpayOrderId: verificationData.razorpayOrderId,
          razorpayPaymentId: verificationData.razorpayPaymentId,
          razorpaySignature: verificationData.razorpaySignature
        })
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "Payment verification failed.");
      }

      const createdOrder = mapOrderData(resJson.data);
      setOrders(prev => [createdOrder, ...prev]);

      const isBuyNow = !!verificationData.buyNowItem;
      if (!isBuyNow) {
        clearCart();
      }

      showToast("Payment verified and order placed successfully!", "success");
      return true;
    } catch (err) {
      showToast(`Verification failed: ${err.message}`);
      return false;
    }
  };

  return (
    <ReetSutraContext.Provider value={{
      products,
      fetchProducts,
      settings,
      cart,
      wishlist,
      user,
      addresses,
      orders,
      lastAddedItem,
      showCartPopup,
      setShowCartPopup,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      addAddress,
      deleteAddress,
      updateAddress,
      setDefaultAddress,
      updateProfile,
      login,
      logout,
      register,
      sendOTP,
      verifyOTPLogin,
      registerWithOTP,
      changePhoneWithOTP,
      changeEmailWithOTP,
      placeOrder,
      initializeRazorpayOrder,
      verifyRazorpayPayment,
      showToast,
      toast
    }}>
      {children}
      {toast && (
        <>
          <style>{`
            @keyframes toastSlideIn {
              from { transform: translateY(-20px) scale(0.95); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
            .custom-toast-container {
              animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div className="custom-toast-container fixed top-6 right-6 z-[99999] flex items-center gap-3 bg-brand-ivory border border-brand-gold/30 p-4.5 rounded-lg shadow-2xl max-w-md min-w-[280px]">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-brand-gold/10">
              {toast.type === 'success' ? (
                <span className="text-emerald-600 text-lg font-bold">✓</span>
              ) : (
                <span className="text-rose-600 text-lg font-bold">⚠️</span>
              )}
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">System Notification</h4>
              <p className="text-xs font-semibold text-brand-green leading-normal mt-0.5">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-brand-charcoalLight/50 hover:text-brand-green font-bold text-sm cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        </>
      )}
    </ReetSutraContext.Provider>
  );
};
export default ReetSutraContext;
