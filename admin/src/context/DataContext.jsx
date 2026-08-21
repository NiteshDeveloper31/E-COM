import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../config";

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
  const [subAdmins, setSubAdmins] = useState([]);
  const [grnLogs, setGrnLogs] = useState([]);
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
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

  const fetchCurrentProfile = useCallback(async () => {
    try {
      const res = await apiRequest("/auth/profile");
      if (res && res.user) {
        setAdminProfile(res.user);
        localStorage.setItem("rs_admin_profile", JSON.stringify(res.user));
      }
    } catch (err) {
      console.error("Failed to fetch latest admin profile:", err);
    }
  }, [apiRequest]);

  // Initial Load & 30s Polling Hook
  useEffect(() => {
    if (!token) return;

    // Load initial datasets
    setLoading(true);
    Promise.all([
      fetchCurrentProfile(),
      fetchProducts(),
      fetchCategories(),
      fetchOrders(),
      fetchCustomers(),
      fetchBanners(),
      fetchDashboardStats(),
      fetchSettings()
    ]).finally(() => setLoading(false));

    // Setup 30s Polling for admin metrics & permissions sync
    const pollingInterval = setInterval(() => {
      fetchCurrentProfile();
      fetchDashboardStats();
      fetchOrders();
      fetchCustomers();
    }, 30000);

    return () => clearInterval(pollingInterval);
  }, [token, fetchCurrentProfile, fetchProducts, fetchCategories, fetchOrders, fetchCustomers, fetchBanners, fetchDashboardStats]);

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

  const fetchSettings = useCallback(async () => {
    try {
      const data = await apiRequest("/settings");
      if (data) setSettings(data);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  }, [apiRequest]);

  const [settings, setSettings] = useState({
    storeName: "ReetSutra Traditional Foods",
    storeTagline: "रीत हमारी, स्वाद हमारा, साथ अपनों का",
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

  const updateSettings = async (newSettings) => {
    try {
      const updated = await apiRequest("/settings", "PUT", newSettings);
      setSettings(updated);
      showToast("Settings & Social Media links saved successfully!", "success");
    } catch (err) {
      showToast(`Failed to save settings: ${err.message}`);
    }
  };

  const fetchSubAdmins = useCallback(async () => {
    try {
      const data = await apiRequest("/auth/subadmins");
      if (Array.isArray(data)) setSubAdmins(data);
    } catch (err) {
      console.error("Failed to fetch sub-admins:", err);
    }
  }, [apiRequest]);

  const createSubAdmin = async (adminData) => {
    try {
      const created = await apiRequest("/auth/subadmins", "POST", adminData);
      setSubAdmins(prev => [created, ...prev]);
      showToast(`Admin ${created.name} created successfully!`, "success");
      return created;
    } catch (err) {
      showToast(`Failed to create admin: ${err.message}`);
      throw err;
    }
  };

  const updateSubAdmin = async (id, updatedData) => {
    try {
      const updated = await apiRequest(`/auth/subadmins/${id}`, "PUT", updatedData);
      setSubAdmins(prev => prev.map(a => (a._id === id || a.id === id ? updated : a)));
      showToast("Admin permissions updated successfully!", "success");
      return updated;
    } catch (err) {
      showToast(`Failed to update admin: ${err.message}`);
      throw err;
    }
  };

  const deleteSubAdmin = async (id) => {
    try {
      await apiRequest(`/auth/subadmins/${id}`, "DELETE");
      setSubAdmins(prev => prev.filter(a => a._id !== id && a.id !== id));
      showToast("Admin account deleted successfully.", "success");
    } catch (err) {
      showToast(`Failed to delete admin: ${err.message}`);
      throw err;
    }
  };

  const bulkImportProducts = async (productsArray) => {
    try {
      const res = await apiRequest("/products/bulk-import", "POST", { products: productsArray });
      await fetchProducts();
      showToast(`${productsArray.length} products imported successfully!`, "success");
      return res;
    } catch (err) {
      showToast(`Failed to import products: ${err.message}`);
      throw err;
    }
  };

  const fetchGRNLogs = useCallback(async () => {
    try {
      const data = await apiRequest("/grn");
      if (Array.isArray(data)) setGrnLogs(data);
    } catch (err) {
      console.error("Failed to fetch GRN logs:", err);
    }
  }, [apiRequest]);

  const submitGRN = async (grnPayload) => {
    try {
      const res = await apiRequest("/grn", "POST", grnPayload);
      await Promise.all([fetchProducts(), fetchGRNLogs()]);
      showToast(`GRN Entry Created! Live Stock Updated (+${grnPayload.goodQty} Good Items)`, "success");
      return res;
    } catch (err) {
      showToast(`Failed to submit GRN: ${err.message}`);
      throw err;
    }
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
        subAdmins,
        grnLogs,
        dashboardStats,
        loading,
        settings,
        notifications,
        loginAdmin,
        logoutAdmin,
        fetchSubAdmins,
        createSubAdmin,
        updateSubAdmin,
        deleteSubAdmin,
        fetchGRNLogs,
        submitGRN,
        addProduct,
        bulkImportProducts,
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
