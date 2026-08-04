import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  ClipboardList,
  Users,
  Image,
  BarChart3,
  Settings,
  User,
  X
} from "lucide-react";
import { useData } from "../context/DataContext";

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { orders } = useData();

  // Calculate pending orders count for a badge
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "Pending").length;

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: ShoppingBag },
    { name: "Categories", path: "/categories", icon: FolderTree },
    { name: "Orders", path: "/orders", icon: ClipboardList, badge: pendingOrdersCount },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Banners", path: "/banners", icon: Image },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Profile", path: "/profile", icon: User }
  ];

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
        {menuItems.map((item) => (
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
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-primary-light bg-primary-dark/55 text-center text-xs text-white/40">
        <p>&copy; {new Date().getFullYear()} ReetSutra</p>
        <p className="mt-0.5">v1.0.0 (SaaS Dashboard)</p>
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
    </>
  );
};
