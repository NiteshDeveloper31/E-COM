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
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";

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
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/banners" element={<Banners />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
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
