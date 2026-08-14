import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider, useData } from "./context/DataContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Categories } from "./pages/Categories";
import { Orders } from "./pages/Orders";
import { Customers } from "./pages/Customers";
import { Banners } from "./pages/Banners";
import { Analytics } from "./pages/Analytics";
import { Inventory } from "./pages/Inventory";
import { GRN } from "./pages/GRN";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";

const RequirePermission = ({ permissionKey, children }) => {
  const { adminProfile } = useData();
  const isSuperAdmin = adminProfile?.role === "superadmin" || adminProfile?.email === "admin@reetsutra.com";
  const userPermissions = isSuperAdmin
    ? ["dashboard", "products", "inventory", "categories", "orders", "customers", "banners", "analytics", "settings", "profile"]
    : (adminProfile?.permissions || []);

  const hasAccess = isSuperAdmin || userPermissions.includes(permissionKey);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] bg-white rounded-2xl border border-primary/10 p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl shadow-xs">
          🔒
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-xl font-bold font-display text-primary">Module Access Restricted</h2>
          <p className="text-xs text-charcoal-light leading-relaxed">
            You do not have permission to view or edit this module (<strong>{permissionKey.toUpperCase()}</strong>). Please request access approval from Super Admin (<span className="text-primary font-bold">admin@reetsutra.com</span>).
          </p>
        </div>
      </div>
    );
  }

  return children;
};

function AppContent() {
  const { token, loginAdmin } = useData();

  // If no auth token exists, render only the Login Screen
  if (!token) {
    return <Login onLoginSuccess={loginAdmin} />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<RequirePermission permissionKey="dashboard"><Dashboard /></RequirePermission>} />
          <Route path="/products" element={<RequirePermission permissionKey="products"><Products /></RequirePermission>} />
          <Route path="/inventory" element={<RequirePermission permissionKey="inventory"><Inventory /></RequirePermission>} />
          <Route path="/grn" element={<RequirePermission permissionKey="inventory"><GRN /></RequirePermission>} />
          <Route path="/categories" element={<RequirePermission permissionKey="categories"><Categories /></RequirePermission>} />
          <Route path="/orders" element={<RequirePermission permissionKey="orders"><Orders /></RequirePermission>} />
          <Route path="/customers" element={<RequirePermission permissionKey="customers"><Customers /></RequirePermission>} />
          <Route path="/banners" element={<RequirePermission permissionKey="banners"><Banners /></RequirePermission>} />
          <Route path="/analytics" element={<RequirePermission permissionKey="analytics"><Analytics /></RequirePermission>} />
          <Route path="/settings" element={<RequirePermission permissionKey="settings"><Settings /></RequirePermission>} />
          <Route path="/profile" element={<RequirePermission permissionKey="profile"><Profile /></RequirePermission>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;
