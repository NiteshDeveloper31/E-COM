import React, { useState, useEffect } from "react";
import { UserPlus, Shield, Lock, Trash2, Edit, Check, X, ShieldAlert, Key } from "lucide-react";
import { useData } from "../context/DataContext";
import { Modal } from "./Modal";

const ALL_MODULES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "inventory", label: "Inventory" },
  { id: "categories", label: "Categories" },
  { id: "orders", label: "Orders" },
  { id: "customers", label: "Customers" },
  { id: "banners", label: "Banners" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
  { id: "profile", label: "Profile" }
];

export const ManageAdminsModal = ({ isOpen, onClose }) => {
  const { subAdmins, fetchSubAdmins, createSubAdmin, updateSubAdmin, deleteSubAdmin, showToast } = useData();

  const [activeTab, setActiveTab] = useState("list"); // "list" | "create" | "edit"
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form states for Create/Edit Admin
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPermissions, setFormPermissions] = useState([
    "dashboard", "products", "inventory", "categories", "orders", "customers", "banners", "analytics", "settings", "profile"
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubAdmins();
    }
  }, [isOpen, fetchSubAdmins]);

  const handleOpenCreate = () => {
    setSelectedAdmin(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormPassword("");
    setFormPermissions(["dashboard", "products", "inventory", "categories", "orders"]);
    setActiveTab("create");
  };

  const handleOpenEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormName(admin.name || "");
    setFormEmail(admin.email || "");
    setFormPhone(admin.phone || "");
    setFormPassword(""); // Leave empty unless changing
    setFormPermissions(admin.permissions || []);
    setActiveTab("edit");
  };

  const togglePermission = (moduleId) => {
    if (formPermissions.includes(moduleId)) {
      setFormPermissions(formPermissions.filter(p => p !== moduleId));
    } else {
      setFormPermissions([...formPermissions, moduleId]);
    }
  };

  const selectAllPermissions = () => {
    setFormPermissions(ALL_MODULES.map(m => m.id));
  };

  const clearAllPermissions = () => {
    setFormPermissions([]);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      showToast("Name, email, and password are required.");
      return;
    }
    if (formPermissions.length === 0) {
      showToast("Please assign at least one feature permission.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSubAdmin({
        name: formName,
        email: formEmail,
        phone: formPhone,
        password: formPassword,
        permissions: formPermissions
      });
      setActiveTab("list");
      fetchSubAdmins();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    if (formPermissions.length === 0) {
      showToast("Please assign at least one feature permission.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName,
        phone: formPhone,
        permissions: formPermissions
      };
      if (formPassword.trim()) {
        payload.password = formPassword;
      }
      await updateSubAdmin(selectedAdmin._id || selectedAdmin.id, payload);
      setActiveTab("list");
      fetchSubAdmins();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adminId, adminName) => {
    if (window.confirm(`Are you sure you want to remove sub-admin account "${adminName}"?`)) {
      try {
        await deleteSubAdmin(adminId);
        fetchSubAdmins();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Role-Based Admin Access & Sub-Admins Manager"
      size="lg"
    >
      <div className="space-y-4">
        {/* Navigation Tabs inside modal */}
        <div className="flex items-center justify-between border-b border-primary/10 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "list"
                  ? "bg-primary text-secondary shadow-xs"
                  : "bg-background text-charcoal hover:bg-primary/5"
              }`}
            >
              All Admins List ({subAdmins.length})
            </button>
            {activeTab !== "list" && (
              <span className="px-3.5 py-1.5 bg-secondary/20 text-primary font-bold text-xs rounded-lg">
                {activeTab === "create" ? "Add New Sub-Admin" : `Editing Permissions: ${selectedAdmin?.name}`}
              </span>
            )}
          </div>

          {activeTab === "list" && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-secondary rounded-lg font-bold text-xs shadow-xs hover:bg-primary-light transition-all cursor-pointer"
            >
              <UserPlus size={14} /> Create New Admin
            </button>
          )}
        </div>

        {/* LIST TAB */}
        {activeTab === "list" && (
          <div className="space-y-3">
            {subAdmins.length === 0 ? (
              <div className="text-center py-8 bg-background/50 rounded-xl border border-primary/5 space-y-2">
                <ShieldAlert className="w-8 h-8 text-charcoal-light mx-auto" />
                <p className="text-sm font-semibold text-primary">No Sub-Admins Created Yet</p>
                <p className="text-xs text-charcoal-light">Click "Create New Admin" to add team members with custom permissions.</p>
              </div>
            ) : (
              <div className="divide-y divide-primary/5 bg-background rounded-xl border border-primary/10 overflow-hidden">
                {subAdmins.map((adm) => {
                  const isSuper = adm.role === "superadmin" || adm.email === "admin@reetsutra.com";
                  const permList = adm.permissions || [];

                  return (
                    <div key={adm._id || adm.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-primary">{adm.name}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            isSuper
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}>
                            {isSuper ? "👑 Super Admin" : "🛡️ Sub-Admin"}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-light font-medium">
                          {adm.email} {adm.phone ? `• ${adm.phone}` : ""}
                        </p>
                        
                        {/* Assigned permissions pills */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {isSuper ? (
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                              ✨ Full System Unrestricted Access
                            </span>
                          ) : permList.length === ALL_MODULES.length ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                              All 10 Modules Allowed
                            </span>
                          ) : (
                            ALL_MODULES.map(m => {
                              const hasIt = permList.includes(m.id);
                              return (
                                <span
                                  key={m.id}
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                    hasIt
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-rose-50 text-rose-600 border border-rose-200 line-through opacity-60"
                                  }`}
                                >
                                  {hasIt ? "✓" : "🔒"} {m.label}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {!isSuper && (
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <button
                            onClick={() => handleOpenEdit(adm)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/10 text-xs font-bold text-primary hover:bg-primary/5 transition-all cursor-pointer"
                            title="Edit Admin Permissions"
                          >
                            <Edit size={12} /> Edit Permissions
                          </button>
                          <button
                            onClick={() => handleDelete(adm._id || adm.id, adm.name)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Delete Admin Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CREATE / EDIT FORM */}
        {(activeTab === "create" || activeTab === "edit") && (
          <form onSubmit={activeTab === "create" ? handleSubmitCreate : handleSubmitEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  disabled={activeTab === "edit"}
                  placeholder="admin@reetsutra.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Password {activeTab === "edit" ? "(Leave blank to keep unchanged)" : <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="password"
                  required={activeTab === "create"}
                  placeholder="••••••••"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary"
                />
              </div>
            </div>

            {/* Feature Access Permissions Manager */}
            <div className="space-y-2 pt-2 border-t border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <Shield size={14} className="text-secondary" /> Feature Module Access Permissions
                  </h4>
                  <p className="text-[11px] text-charcoal-light">Unchecked modules will show a 🔒 Lock icon in their sidebar and block access.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-charcoal-light/30">|</span>
                  <button
                    type="button"
                    onClick={clearAllPermissions}
                    className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {ALL_MODULES.map((mod) => {
                  const isChecked = formPermissions.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      onClick={() => togglePermission(mod.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none ${
                        isChecked
                          ? "bg-primary/5 border-primary text-primary shadow-2xs"
                          : "bg-background border-primary/10 text-charcoal-light hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by label click
                        className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>{isChecked ? "✓" : "🔒"} {mod.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-primary/10">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-4 py-2 border border-primary/10 rounded-lg text-xs font-bold text-charcoal hover:bg-primary/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-primary text-secondary rounded-lg text-xs font-bold shadow-md hover:bg-primary-light transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : activeTab === "create" ? "Create Admin Account" : "Save Permissions"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
