import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// Helper to recursively duplicate MongoDB _id to id for frontend compatibility
const mapMongoIds = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => mapMongoIds(item));
  }
  if (typeof data === "object") {
    const mapped = { ...data };
    if (mapped._id && !mapped.id) {
      mapped.id = mapped._id.toString();
    }
    for (const key in mapped) {
      if (mapped[key] && typeof mapped[key] === "object") {
        mapped[key] = mapMongoIds(mapped[key]);
      }
    }
    return mapped;
  }
  return data;
};

export const DataProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("rs_admin_token") || null);
  const [adminProfile, setAdminProfile] = useState(() => {
    const saved = localStorage.getItem("rs_admin_profile");
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Low stock alert", text: "Gaya Tilkut stock is down to 45 items", time: "1 hour ago", read: false }
  ]);

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

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem("rs_admin_token");
    localStorage.removeItem("rs_admin_profile");
    setToken(null);
    setAdminProfile(null);
    setProducts([]);
    setOrders([]);
    setCustomers([]);
  }, []);

  // Unified API Request Helper
  const apiRequest = useCallback(async (endpoint, method = "GET", body = null) => {
    const headers = {
      "Content-Type": "application/json"
    };

    const activeToken = localStorage.getItem("rs_admin_token");
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }

    const config = {
      method,
      headers
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`http://localhost:5000/api${endpoint}`, config);
      
      if (response.status === 401 || response.status === 403) {
        logoutAdmin();
        showToast("Session expired or unauthorized. Please login again.", "error");
        throw new Error("Unauthorized access");
      }

      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(resJson.message || "API request failed.");
      }

      // Map Mongo IDs dynamically
      return mapMongoIds(resJson.data);
    } catch (err) {
      console.error(`[API ERROR] Endpoint: ${endpoint}, Error:`, err);
      throw err;
    }
  }, [logoutAdmin, showToast]);

  // --- FETCH DATA MODULES ---

  const fetchProducts = useCallback(async () => {
    try {
      const data = await apiRequest("/products?limit=100");
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }, [apiRequest]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiRequest("/categories");
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, [apiRequest]);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await apiRequest("/orders?limit=100");
      const mappedOrders = (data.orders || []).map((order) => {
        const u = order.userId || {};
        return {
          ...order,
          id: order._id || order.id,
          customerName: u.name || "N/A",
          customerEmail: u.email || "",
          customerPhone: u.phone || order.shippingAddress?.phone || "N/A",
          date: order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })
            : "N/A",
          timeline: (order.timeline || []).map((log) => ({
            ...log,
            date: log.date ? new Date(log.date).toLocaleString("en-IN") : ""
          }))
        };
      });
      setOrders(mappedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }, [apiRequest]);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await apiRequest("/customers?limit=100");
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  }, [apiRequest]);

  const fetchBanners = useCallback(async () => {
    try {
      const data = await apiRequest("/banners");
      setBanners(data || []);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    }
  }, [apiRequest]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const data = await apiRequest("/dashboard/stats");
      setDashboardStats(data || null);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  }, [apiRequest]);

  // Initial Load & 30s Polling Hook
  useEffect(() => {
    if (!token) return;

    // Load initial datasets
    setLoading(true);
    Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchOrders(),
      fetchCustomers(),
      fetchBanners(),
      fetchDashboardStats()
    ]).finally(() => setLoading(false));

    // Setup 30s Polling for admin metrics
    const pollingInterval = setInterval(() => {
      console.log("[POLLING] Fetching latest metrics...");
      fetchDashboardStats();
      fetchOrders();
      fetchCustomers();
    }, 30000);

    return () => clearInterval(pollingInterval);
  }, [token, fetchProducts, fetchCategories, fetchOrders, fetchCustomers, fetchBanners, fetchDashboardStats]);

  // --- CRUD HANDLERS ---

  // Auth Handlers
  const loginAdmin = (newToken, userProfile) => {
    localStorage.setItem("rs_admin_token", newToken);
    localStorage.setItem("rs_admin_profile", JSON.stringify(userProfile));
    setToken(newToken);
    setAdminProfile(userProfile);
    addNotification("Logged In", `Welcome back, ${userProfile.name}. Session established.`);
  };



  // Product CRUD
  const addProduct = async (productData) => {
    try {
      const newProduct = await apiRequest("/products", "POST", productData);
      setProducts((prev) => [newProduct, ...prev]);
      addNotification("Product Added", `${newProduct.name} has been published.`);
      showToast(`${newProduct.name} published successfully.`, "success");
      fetchCategories(); // Refresh product counts on categories
    } catch (err) {
      showToast(`Error publishing product: ${err.message}`);
    }
  };

  const updateProduct = async (id, updatedFields) => {
    try {
      const updated = await apiRequest(`/products/${id}`, "PUT", updatedFields);
      setProducts((prev) => prev.map((p) => (p._id === id || p.id === id ? updated : p)));
      addNotification("Product Updated", `${updated.name} changes saved.`);
      showToast("Product updates saved successfully.", "success");
      fetchCategories(); // Refresh categories counts
    } catch (err) {
      showToast(`Error saving changes: ${err.message}`);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiRequest(`/products/${id}`, "DELETE");
      setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      addNotification("Product Deleted", "Product removed from database catalog.");
      showToast("Product deleted successfully.", "success");
      fetchCategories(); // Refresh category counts
    } catch (err) {
      showToast(`Error deleting product: ${err.message}`);
    }
  };

  // Category CRUD
  const addCategory = async (categoryData) => {
    try {
      const newCat = await apiRequest("/categories", "POST", categoryData);
      setCategories((prev) => [...prev, newCat]);
      showToast("Category created successfully.", "success");
    } catch (err) {
      showToast(`Error creating category: ${err.message}`);
    }
  };

  const updateCategory = async (id, updatedFields) => {
    try {
      const updated = await apiRequest(`/categories/${id}`, "PUT", updatedFields);
      setCategories((prev) => prev.map((c) => (c._id === id || c.id === id ? updated : c)));
      showToast("Category updated successfully.", "success");
    } catch (err) {
      showToast(`Error updating category: ${err.message}`);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await apiRequest(`/categories/${id}`, "DELETE");
      setCategories((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      showToast("Category deleted successfully.", "success");
    } catch (err) {
      showToast(`Error deleting category: ${err.message}`);
    }
  };

  // Order Fulfillment
  const updateOrderStatus = async (id, newStatus, extraFields = {}) => {
    try {
      const updatedRaw = await apiRequest(`/orders/${id}/status`, "PUT", { orderStatus: newStatus, ...extraFields });
      setOrders((prev) =>
        prev.map((o) => {
          if (o._id === id || o.id === id) {
            return {
              ...o,
              ...updatedRaw,
              id: updatedRaw._id || updatedRaw.id,
              timeline: (updatedRaw.timeline || []).map((log) => ({
                ...log,
                date: log.date ? new Date(log.date).toLocaleString("en-IN") : ""
              }))
            };
          }
          return o;
        })
      );
      addNotification("Order Updated", `Order ${id} is now ${newStatus}`);
      showToast(`Order status updated to ${newStatus}.`, "success");
    } catch (err) {
      showToast(`Failed to update order: ${err.message}`);
    }
  };

  // Customer account actions
  const updateCustomerStatus = async (id, newStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (c._id === id || c.id === id ? { ...c, status: newStatus } : c))
    );
    addNotification("Customer Alert", `Customer status marked as ${newStatus}`);
  };

  // Banner CRUD
  const addBanner = async (bannerData) => {
    try {
      const newBanner = await apiRequest("/banners", "POST", bannerData);
      setBanners((prev) => [newBanner, ...prev]);
      showToast("Banner uploaded successfully.", "success");
    } catch (err) {
      showToast(`Failed to upload banner: ${err.message}`);
    }
  };

  const updateBanner = async (id, updatedFields) => {
    try {
      const updated = await apiRequest(`/banners/${id}`, "PUT", updatedFields);
      setBanners((prev) => prev.map((b) => (b._id === id || b.id === id ? updated : b)));
      showToast("Banner updated successfully.", "success");
    } catch (err) {
      showToast(`Failed to edit banner: ${err.message}`);
    }
  };

  const deleteBanner = async (id) => {
    try {
      await apiRequest(`/banners/${id}`, "DELETE");
      setBanners((prev) => prev.filter((b) => b._id !== id && b.id !== id));
      showToast("Banner deleted successfully.", "success");
    } catch (err) {
      showToast(`Failed to delete banner: ${err.message}`);
    }
  };

  // Notifications Helpers
  const addNotification = (title, text) => {
    setNotifications((prev) => [
      { id: Date.now(), title, text, time: "Just now", read: false },
      ...prev
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Mock Settings configuration stored locally in admin panel
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("rs_admin_settings");
    return saved ? JSON.parse(saved) : {
      storeName: "ReetSutra Traditional Foods",
      storeTagline: "Savor the Legacy of Taste and Health",
      storeLogo: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=100&q=80",
      currency: "INR (₹)",
      timezone: "IST (UTC+05:30)",
      taxRate: 5,
      orderPrefix: "ORD-",
      seoTitle: "ReetSutra | Authentic Traditional Sweets & Healthy Indian Roasted Snacks",
      seoMetaDescription: "Shop authentic handcrafted Indian traditional foods.",
      seoKeywords: "Thekua, Sattu, Khaja",
      robotsTxt: "User-agent: *\nAllow: /"
    };
  });

  const updateSettings = (newSettings) => {
    localStorage.setItem("rs_admin_settings", JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  return (
    <DataContext.Provider
      value={{
        token,
        adminProfile,
        products,
        categories,
        orders,
        customers,
        banners,
        dashboardStats,
        loading,
        settings,
        notifications,
        loginAdmin,
        logoutAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        updateCustomerStatus,
        addBanner,
        updateBanner,
        deleteBanner,
        updateSettings,
        markAllNotificationsRead,
        showToast
      }}
    >
      {children}
      {toast && (
        <>
          <style>{`
            @keyframes toastSlideIn {
              from { transform: translateY(-20px) scale(0.95); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
            .custom-admin-toast {
              animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div className="custom-admin-toast fixed top-6 right-6 z-[99999] flex items-center gap-3 bg-white border border-primary/10 p-4.5 rounded-lg shadow-2xl max-w-md min-w-[280px]">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 shadow-sm border border-slate-100">
              {toast.type === 'success' ? (
                <span className="text-emerald-600 text-lg font-bold">✓</span>
              ) : (
                <span className="text-rose-600 text-lg font-bold">⚠️</span>
              )}
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Alert</h4>
              <p className="text-xs font-semibold text-primary leading-normal mt-0.5">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-primary font-bold text-sm cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        </>
      )}
    </DataContext.Provider>
  );
};
export default DataContext;
