import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export const Drawer = ({ isOpen, onClose, title, children, size = "md" }) => {
  // Close on Escape key press and block scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary-dark/30 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            {/* Slide-over Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
              className={`w-screen ${sizeClasses[size]} pointer-events-auto`}
            >
              <div className="h-full flex flex-col bg-white shadow-2xl border-l border-primary/10">
                {/* Header */}
                <div className="px-6 py-5 border-b border-primary/5 bg-background flex items-center justify-between">
                  <h2 className="font-display font-semibold text-lg text-primary">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-charcoal-light hover:bg-primary/5 hover:text-primary transition-colors focus:outline-none"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 py-6 overflow-y-auto px-6">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
