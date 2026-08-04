import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut, CheckCircle2 } from "lucide-react";
import { useData } from "../context/DataContext";

export const Navbar = ({ onMenuClick }) => {
  const { adminProfile, notifications, markAllNotificationsRead, showToast } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-primary/10 shadow-xs">
      {/* Left side: Burger Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-charcoal hover:bg-background transition-colors focus:outline-none"
        >
          <Menu size={20} />
        </button>

        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light" size={16} />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-full pl-9 pr-4 py-1.5 border border-primary/5 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
          />
        </div>
      </div>

      {/* Right side: Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Panel */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-background text-charcoal-light hover:text-primary transition-colors focus:outline-none"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold text-white bg-secondary rounded-full flex items-center justify-center border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-primary/10 py-2 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-primary/5 bg-background/50">
                  <span className="font-display font-semibold text-xs text-primary">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[10px] text-secondary hover:text-secondary-dark font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 size={10} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-primary/5">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs transition-colors hover:bg-background/40 ${
                          !notif.read ? "bg-secondary/5" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`font-semibold ${!notif.read ? "text-primary" : "text-charcoal"}`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-charcoal-light whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-charcoal-light mt-1 font-medium">{notif.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-charcoal-light">No new notifications</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative border-l border-primary/10 pl-4" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-background transition-colors focus:outline-none cursor-pointer"
          >
            <img
              src={adminProfile.avatar}
              alt={adminProfile.name}
              className="w-8 h-8 rounded-full border border-secondary shadow-xs object-cover"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-primary">{adminProfile.name}</p>
              <p className="text-[10px] text-charcoal-light -mt-0.5">{adminProfile.role}</p>
            </div>
            <ChevronDown size={14} className="text-charcoal-light hidden sm:block" />
          </button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-primary/10 py-1.5 z-50 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-primary/5 bg-background/30 sm:hidden">
                  <p className="text-xs font-bold text-primary">{adminProfile.name}</p>
                  <p className="text-[10px] text-charcoal-light">{adminProfile.role}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-charcoal hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <User size={14} className="text-charcoal-light" />
                  My Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-charcoal hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Settings size={14} className="text-charcoal-light" />
                  Store Settings
                </Link>

                <div className="border-t border-primary/5 my-1.5" />

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    showToast("Mock Logout: In a full project, this would clear authentication sessions.", "info");
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
