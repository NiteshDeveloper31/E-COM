import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  FolderTree,
  ClipboardList,
  Users,
  Image,
  BarChart3,
  Settings,
  User,
  X,
  Lock,
  UserPlus,
  Shield,
  PackageCheck
} from "lucide-react";
import { useData } from "../context/DataContext";
import { ManageAdminsModal } from "./ManageAdminsModal";

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { orders, adminProfile, showToast } = useData();
  const [isManageAdminsOpen, setIsManageAdminsOpen] = useState(false);

  // Calculate pending orders count for a badge
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "Pending").length;

  const isSuperAdmin = adminProfile?.role === "superadmin" || adminProfile?.email === "admin@reetsutra.com";
  const userPermissions = isSuperAdmin
    ? ["dashboard", "products", "inventory", "categories", "orders", "customers", "banners", "analytics", "settings", "profile"]
    : (adminProfile?.permissions || []);

  const menuItems = [
    { key: "dashboard", name: "Dashboard", path: "/", icon: LayoutDashboard },
    { key: "products", name: "Products", path: "/products", icon: ShoppingBag },
    { key: "inventory", name: "Inventory", path: "/inventory", icon: Boxes },
    { key: "inventory", name: "GRN Entry", path: "/grn", icon: PackageCheck },
    { key: "categories", name: "Categories", path: "/categories", icon: FolderTree },
    { key: "orders", name: "Orders", path: "/orders", icon: ClipboardList, badge: pendingOrdersCount },
    { key: "customers", name: "Customers", path: "/customers", icon: Users },
    { key: "banners", name: "Banners", path: "/banners", icon: Image },
    { key: "analytics", name: "Analytics", path: "/analytics", icon: BarChart3 },
    { key: "settings", name: "Settings", path: "/settings", icon: Settings },
    { key: "profile", name: "Profile", path: "/profile", icon: User }
  ];

  const handleLockedClick = (itemName) => {
    showToast(`🔒 Access Restricted: You do not have permission to view ${itemName}. Please contact Super Admin.`, "error");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-primary text-white border-r border-primary-light">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-primary-light bg-primary-dark">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-display font-bold text-primary text-lg shadow-sm">
            R
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-white">
            ReetSutra <span className="text-secondary text-xs block font-sans tracking-normal -mt-1 font-medium">ADMIN</span>
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1 rounded-md hover:bg-primary-light text-white/80 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const hasAccess = isSuperAdmin || userPermissions.includes(item.key);

          if (!hasAccess) {
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleLockedClick(item.name)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-white/35 bg-primary-dark/30 border border-transparent hover:border-rose-400/20 hover:bg-rose-950/20 transition-all duration-200 cursor-not-allowed group"
                title="🔒 Access Locked by Super Admin"
              >
                <div className="flex items-center gap-3.5 opacity-60">
                  <item.icon size={18} className="text-white/30" />
                  <span className="line-through">{item.name}</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <Lock size={10} /> Locked
                </div>
              </button>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-secondary text-primary font-bold shadow-md shadow-secondary/15"
                    : "text-white/70 hover:bg-primary-light hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <item.icon
                      size={18}
                      className={`transition-colors ${
                        isActive ? "text-primary" : "text-white/50 group-hover:text-white"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-primary text-secondary" : "bg-secondary text-primary"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Super Admin Manage Admins Button */}
      {isSuperAdmin && (
        <div className="px-4 py-2 border-t border-primary-light/50">
          <button
            onClick={() => setIsManageAdminsOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-secondary text-primary rounded-lg font-display font-bold text-xs shadow-md hover:bg-secondary-light transition-all cursor-pointer"
          >
            <UserPlus size={14} /> Create / Manage Admins
          </button>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-primary-light bg-primary-dark/55 text-center text-xs text-white/40">
        <p>&copy; {new Date().getFullYear()} ReetSutra</p>
        <p className="mt-0.5 font-bold text-[10px] text-secondary/80">
          {isSuperAdmin ? "👑 Super Admin Mode" : "🛡️ Sub-Admin Mode"}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-primary-dark/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Responsive Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-45 w-64 transform lg:translate-x-0 lg:static lg:block flex-shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Super Admin Manage Admins Modal */}
      <ManageAdminsModal
        isOpen={isManageAdminsOpen}
        onClose={() => setIsManageAdminsOpen(false)}
      />
    </>
  );
};
