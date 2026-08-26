import React, { useState } from "react";
import { Plus, Edit2, Trash2, Calendar, Link2, Eye, AlertTriangle, EyeOff, Monitor, Smartphone, Layers } from "lucide-react";
import { useData } from "../context/DataContext";
import { Modal } from "../components/Modal";

// Read 100% UNTOUCHED RAW ORIGINAL FILE (Preserves 100% exact original resolution & 0% blur quality up to 15MB)
const readHighQualityImageFile = (file, callback, showError) => {
  const MAX_BYTES = 15 * 1024 * 1024; // 15MB limit
  if (file.size > MAX_BYTES) {
    if (showError) {
      showError("File size exceeds 15MB limit. Please upload an image under 15MB.");
    }
    return;
  }

  // Direct untouched raw file reader
  const reader = new FileReader();
  reader.onloadend = () => {
    callback(reader.result);
  };
  reader.readAsDataURL(file);
};

export const Banners = () => {
  const { banners, addBanner, updateBanner, deleteBanner, showToast } = useData();

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [deleteBannerId, setDeleteBannerId] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formBannerType, setFormBannerType] = useState("Permanent"); // Permanent vs Floating
  const [formTargetDevice, setFormTargetDevice] = useState("Both"); // Both, Desktop, Mobile
  const [formDesktopImage, setFormDesktopImage] = useState("");
  const [formMobileImage, setFormMobileImage] = useState("");
  const [formButtonLink, setFormButtonLink] = useState("/shop");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [formError, setFormError] = useState("");

  const handleOpenAdd = () => {
    setCurrentBanner(null);
    setFormTitle("");
    setFormBannerType("Permanent");
    setFormTargetDevice("Both");
    setFormDesktopImage("");
    setFormMobileImage("");
    setFormButtonLink("/shop");
    setFormStartDate("");
    setFormEndDate("");
    setFormStatus("Active");
    setFormError("");
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (ban) => {
    setCurrentBanner(ban);
    setFormTitle(ban.title || "");
    setFormBannerType(ban.bannerType || "Permanent");
    setFormTargetDevice(ban.targetDevice || "Both");
    setFormDesktopImage(ban.desktopImage || ban.image || "");
    setFormMobileImage(ban.mobileImage || ban.image || "");
    setFormButtonLink(ban.buttonLink || "/shop");
    setFormStartDate(ban.startDate ? new Date(ban.startDate).toISOString().slice(0, 10) : "");
    setFormEndDate(ban.endDate ? new Date(ban.endDate).toISOString().slice(0, 10) : "");
    setFormStatus(ban.status || "Active");
    setFormError("");
    setIsAddEditOpen(true);
  };

  const handleOpenDelete = (id) => {
    setDeleteBannerId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmitBanner = (e) => {
    e.preventDefault();
    if (!formDesktopImage && !formMobileImage) {
      setFormError("Please select at least one Banner Image (Desktop or Mobile).");
      return;
    }

    if (formBannerType === "Floating" && (!formStartDate || !formEndDate)) {
      setFormError("Floating banners require Start Date and End Date.");
      return;
    }

    const bannerTitle = formTitle || `${formBannerType} Banner (${formTargetDevice})`;

    const payload = {
      title: bannerTitle,
      bannerType: formBannerType,
      targetDevice: formTargetDevice,
      desktopImage: formDesktopImage || "",
      mobileImage: formMobileImage || "",
      image: formDesktopImage || formMobileImage || "",
      buttonText: "SHOP NOW",
      buttonLink: formButtonLink || "/shop",
      placement: formBannerType === "Permanent" ? "Main Hero Permanent" : "Floating Offer",
      startDate: formBannerType === "Floating" ? formStartDate : null,
      endDate: formBannerType === "Floating" ? formEndDate : null,
      status: formStatus
    };

    if (currentBanner) {
      updateBanner(currentBanner.id, payload);
    } else {
      addBanner(payload);
    }

    setIsAddEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteBannerId) {
      deleteBanner(deleteBannerId);
      setIsDeleteOpen(false);
      setDeleteBannerId(null);
    }
  };

  const handleStatusToggle = (ban) => {
    const nextStatus = ban.status === "Active" ? "Inactive" : "Active";
    updateBanner(ban.id, { status: nextStatus });
  };

  const getAdminImageUrl = (imgPath) => {
    if (!imgPath) return "";
    if (imgPath.startsWith("data:") || imgPath.startsWith("http://") || imgPath.startsWith("https://")) {
      return imgPath;
    }
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    return `${backendUrl}${imgPath.startsWith("/") ? "" : "/"}${imgPath}`;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Banner Management
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Manage main continuous hero banners, floating campaign offers, and target device views.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-primary text-secondary rounded-lg font-display font-bold text-sm shadow-md hover:bg-primary-light transition-all duration-200 cursor-pointer self-start sm:self-center"
        >
          <Plus size={16} /> Create Banner
        </button>
      </div>

      {/* Grid listing of banners */}
      <div className="grid grid-cols-1 gap-6">
        {banners.map((ban) => {
          const isPermanent = ban.bannerType === "Permanent" || ban.placement?.includes("Permanent");
          const targetDev = ban.targetDevice || "Both";
          const isValidImg = (img) => img && !img.startsWith('/assets/');
          const rawBg = isValidImg(ban.desktopImage) ? ban.desktopImage
                      : isValidImg(ban.mobileImage) ? ban.mobileImage
                      : isValidImg(ban.image) ? ban.image
                      : ban.desktopImage || ban.mobileImage || ban.image;
          const bgImg = getAdminImageUrl(rawBg);

          return (
            <div
              key={ban.id}
              className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 grid grid-cols-1 lg:grid-cols-3"
            >
              {/* Visual Preview Panel */}
              <div className="relative h-48 lg:h-auto min-h-40 bg-primary-dark overflow-hidden lg:col-span-1 border-r border-primary/5">
                <img
                  src={bgImg}
                  alt={ban.title}
                  className="w-full h-full object-cover opacity-85"
                />
                {/* Overlay simulation */}
                <div className="absolute inset-0 bg-linear-to-t from-primary-dark/85 via-primary-dark/30 to-transparent p-5 flex flex-col justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${
                      isPermanent
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-950/80 text-amber-300 border-amber-500/40"
                    }`}>
                      {isPermanent ? "📌 Permanent Banner" : "✨ Floating Banner"}
                    </span>

                    <span className="text-[10px] font-bold text-white bg-primary-dark/80 px-2 py-0.5 rounded border border-white/20 flex items-center gap-1">
                      {targetDev === "Desktop" && <Monitor size={12} />}
                      {targetDev === "Mobile" && <Smartphone size={12} />}
                      {targetDev === "Both" && <Layers size={12} />}
                      {targetDev}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-sm leading-snug line-clamp-1">
                      {ban.title}
                    </h4>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[9px] font-bold text-white bg-emerald-800 px-2.5 py-1 rounded shadow-xs uppercase tracking-wider">
                        SHOP NOW 🍃
                      </span>
                      <span className="text-[9px] font-bold text-amber-200 border border-amber-300/40 px-2.5 py-1 rounded shadow-xs uppercase tracking-wider">
                        EXPLORE COLLECTION
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data & Actions Panel */}
              <div className="p-6 lg:col-span-2 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-primary">
                        {ban.title}
                      </h3>
                      <p className="text-xs text-charcoal-light font-medium flex items-center gap-1 mt-0.5">
                        <Link2 size={13} className="text-secondary" />
                        Redirect Target: <code className="bg-background px-1.5 py-0.5 rounded text-primary border border-primary/10">{ban.buttonLink || "/shop"}</code>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusToggle(ban)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          ban.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {ban.status === "Active" ? <Eye size={12} /> : <EyeOff size={12} />}
                        {ban.status}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-primary/5">
                    <div className="bg-background p-3 rounded-lg border border-primary/5 space-y-1">
                      <span className="text-[10px] font-bold text-charcoal-light uppercase block">Banner Classification</span>
                      <span className="font-semibold text-primary">
                        {isPermanent ? "Permanent (Continuous Main Hero)" : "Floating Offer Campaign"}
                      </span>
                    </div>

                    <div className="bg-background p-3 rounded-lg border border-primary/5 space-y-1">
                      <span className="text-[10px] font-bold text-charcoal-light uppercase block">Campaign Duration</span>
                      <span className="font-semibold text-primary flex items-center gap-1">
                        <Calendar size={13} className="text-primary/60" />
                        {isPermanent ? (
                          <span className="text-emerald-700 font-bold">Always Active (No Expiry)</span>
                        ) : (
                          `${ban.startDate ? new Date(ban.startDate).toLocaleDateString() : 'Immediate'} - ${ban.endDate ? new Date(ban.endDate).toLocaleDateString() : 'No Limit'}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-primary/5">
                  <button
                    onClick={() => handleOpenEdit(ban)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} /> Edit Banner
                  </button>
                  <button
                    onClick={() => handleOpenDelete(ban.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {banners.length === 0 && (
          <div className="bg-white rounded-xl border border-primary/10 p-12 text-center space-y-3">
            <Layers size={36} className="mx-auto text-primary/30" />
            <h3 className="font-display font-bold text-lg text-primary">No Banners Found</h3>
            <p className="text-xs text-charcoal-light max-w-sm mx-auto">
              Create your first Permanent or Floating banner campaign to display on the storefront hero section.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-secondary rounded-lg font-bold text-xs shadow-md hover:bg-primary-light transition-all cursor-pointer"
            >
              <Plus size={14} /> Create Banner
            </button>
          </div>
        )}
      </div>

      {/* Simplified Add / Edit Banner Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={currentBanner ? "Edit Banner Campaign" : "Create Banner Campaign"}
      >
        <form onSubmit={handleSubmitBanner} className="space-y-4">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Banner Type: Permanent vs Floating */}
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Banner Type *
              </label>
              <select
                value={formBannerType}
                onChange={(e) => setFormBannerType(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all font-semibold"
              >
                <option value="Permanent">📌 Permanent Banner (Main Hero)</option>
                <option value="Floating">✨ Floating Banner (Offer Campaign)</option>
              </select>
            </div>

            {/* Target Device View */}
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Target Device View *
              </label>
              <select
                value={formTargetDevice}
                onChange={(e) => setFormTargetDevice(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all font-semibold"
              >
                <option value="Both">💻📱 Both (Desktop + Mobile)</option>
                <option value="Desktop">💻 Laptop / Desktop View Only</option>
                <option value="Mobile">📱 Mobile View Only</option>
              </select>
            </div>

            {/* Redirect Link & Status */}
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Button Redirect Link *
              </label>
              <input
                type="text"
                placeholder="e.g. /shop or /category/sweets"
                value={formButtonLink}
                onChange={(e) => setFormButtonLink(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Default Status *
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Conditional Start Date & End Date (ONLY SHOWN IF FLOATING) */}
          {formBannerType === "Floating" && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-amber-900 block">
                ✨ Floating Offer Duration (Auto-Expires when End Date passes)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-primary/10 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-primary/10 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Desktop & Mobile Banner Images Upload */}
          <div className="space-y-3 pt-2 border-t border-primary/5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-primary">
                  Desktop / Laptop Banner Image *
                </label>
                <span className="text-[10px] text-charcoal-light font-medium">Supports JPG, PNG, WEBP</span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-center border border-dashed border-secondary/40 hover:border-secondary bg-primary/5 p-2.5 rounded-lg cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        readHighQualityImageFile(file, (dataUrl) => {
                          setFormDesktopImage(dataUrl);
                          showToast("Desktop banner image loaded!", "success");
                        }, showToast);
                      }
                    }}
                    className="hidden"
                  />
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    📁 Choose Desktop File or Drag & Drop (Max 8MB)
                  </span>
                </label>

                {/* Desktop Image Preview */}
                {formDesktopImage && (
                  <div className="relative rounded-lg overflow-hidden border border-primary/10 h-24 bg-black/5">
                    <img
                      src={getAdminImageUrl(formDesktopImage)}
                      alt="Desktop Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormDesktopImage("")}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center shadow-md hover:bg-rose-700"
                      title="Remove Desktop Image"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                      Desktop Preview
                    </span>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Or Paste Desktop Image URL (https://...)"
                  value={formDesktopImage.startsWith('data:') ? '[File Uploaded]' : formDesktopImage}
                  onChange={(e) => setFormDesktopImage(e.target.value)}
                  className="w-full px-3 py-1.5 border border-primary/10 rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-primary">
                  Mobile Banner Image (Optional)
                </label>
                <span className="text-[10px] text-charcoal-light font-medium">Auto-fallbacks to Desktop image if empty</span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-center border border-dashed border-secondary/40 hover:border-secondary bg-primary/5 p-2.5 rounded-lg cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        readHighQualityImageFile(file, (dataUrl) => {
                          setFormMobileImage(dataUrl);
                          showToast("Mobile banner image loaded!", "success");
                        }, showToast);
                      }
                    }}
                    className="hidden"
                  />
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    📱 Choose Mobile File
                  </span>
                </label>

                {/* Mobile Image Preview */}
                {formMobileImage && (
                  <div className="relative rounded-lg overflow-hidden border border-primary/10 h-24 bg-black/5">
                    <img
                      src={getAdminImageUrl(formMobileImage)}
                      alt="Mobile Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormMobileImage("")}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center shadow-md hover:bg-rose-700"
                      title="Remove Mobile Image"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                      Mobile Preview
                    </span>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Or Paste Mobile Image URL (https://...)"
                  value={formMobileImage.startsWith('data:') ? '[Original HD File Uploaded]' : formMobileImage}
                  onChange={(e) => setFormMobileImage(e.target.value)}
                  className="w-full px-3 py-1.5 border border-primary/10 rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary font-mono"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-primary/5 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 text-xs font-bold text-charcoal-light hover:bg-primary/5 hover:text-primary rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-display font-bold text-secondary bg-primary hover:bg-primary-light rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {currentBanner ? "Save Changes" : "Create Campaign"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Banner Campaign"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl">
            <AlertTriangle size={24} className="flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Remove campaign advertisement?</h4>
              <p className="text-xs font-medium text-rose-600/90 mt-0.5">
                This action is permanent and will withdraw the banner from the store rotating promotions instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-xs font-bold text-charcoal-light hover:bg-primary/5 hover:text-primary rounded-lg transition-colors cursor-pointer"
            >
              No, Keep It
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Yes, Delete Banner
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default Banners;
