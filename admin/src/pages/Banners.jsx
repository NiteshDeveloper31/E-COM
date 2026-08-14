import React, { useState } from "react";
import { Plus, Edit2, Trash2, Calendar, Link2, Eye, AlertTriangle, EyeOff } from "lucide-react";
import { useData } from "../context/DataContext";
import { Modal } from "../components/Modal";

export const Banners = () => {
  const { banners, addBanner, updateBanner, deleteBanner, showToast } = useData();

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [deleteBannerId, setDeleteBannerId] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formButtonText, setFormButtonText] = useState("");
  const [formButtonLink, setFormButtonLink] = useState("");
  const [formPlacement, setFormPlacement] = useState("Main Hero");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [formError, setFormError] = useState("");

  const handleOpenAdd = () => {
    setCurrentBanner(null);
    setFormTitle("");
    setFormSubtitle("");
    setFormImage("");
    setFormButtonText("");
    setFormButtonLink("");
    setFormPlacement("Main Hero");
    setFormStartDate("");
    setFormEndDate("");
    setFormStatus("Active");
    setFormError("");
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (ban) => {
    setCurrentBanner(ban);
    setFormTitle(ban.title);
    setFormSubtitle(ban.subtitle);
    setFormImage(ban.image);
    setFormButtonText(ban.buttonText);
    setFormButtonLink(ban.buttonLink);
    setFormPlacement(ban.placement);
    setFormStartDate(ban.startDate);
    setFormEndDate(ban.endDate);
    setFormStatus(ban.status);
    setFormError("");
    setIsAddEditOpen(true);
  };

  const handleOpenDelete = (id) => {
    setDeleteBannerId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmitBanner = (e) => {
    e.preventDefault();
    if (!formTitle || !formImage || !formButtonText || !formButtonLink) {
      setFormError("Please fill out all required fields (*).");
      return;
    }

    const payload = {
      title: formTitle,
      subtitle: formSubtitle,
      image: formImage,
      buttonText: formButtonText,
      buttonLink: formButtonLink,
      placement: formPlacement,
      startDate: formStartDate || new Date().toISOString().slice(0, 10),
      endDate: formEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
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

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Banner Management
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Manage frontpage advertising campaigns, promotional sliders, and shop discounts.
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
        {banners.map((ban) => (
          <div
            key={ban.id}
            className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 grid grid-cols-1 lg:grid-cols-3"
          >
            {/* Visual Preview Panel */}
            <div className="relative h-48 lg:h-auto min-h-40 bg-primary-dark overflow-hidden lg:col-span-1 border-r border-primary/5">
              <img
                src={ban.image}
                alt={ban.title}
                className="w-full h-full object-cover opacity-80"
              />
              {/* Overlay simulation */}
              <div className="absolute inset-0 bg-linear-to-t from-primary-dark/85 to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-primary-dark/65 px-2 py-0.5 rounded-sm self-start mb-2 border border-secondary/25">
                  {ban.placement}
                </span>
                <h4 className="font-display font-semibold text-xs leading-snug line-clamp-2">
                  {ban.title}
                </h4>
                <p className="text-[9px] text-white/70 line-clamp-1 mt-0.5 font-medium">
                  {ban.subtitle}
                </p>
                <span className="text-[9px] font-bold text-primary bg-secondary px-2.5 py-0.5 rounded-md mt-2 self-start pointer-events-none">
                  {ban.buttonText}
                </span>
              </div>
            </div>

            {/* Meta description and details */}
            <div className="p-6 lg:col-span-2 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display font-semibold text-base text-primary">
                    {ban.title}
                  </h3>
                  
                  <button
                    onClick={() => handleStatusToggle(ban)}
                    className={`flex items-center gap-1.5 px-3 py-1 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      ban.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-charcoal-light/10 text-charcoal-light border-charcoal-light/25 hover:bg-charcoal-light/15"
                    }`}
                  >
                    {ban.status === "Active" ? (
                      <>
                        <Eye size={12} /> Active
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} /> Inactive
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-charcoal-light font-semibold">
                    <Link2 size={14} className="text-secondary" />
                    <span>Target URL: <span className="font-bold text-primary">{ban.buttonLink}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal-light font-semibold">
                    <Calendar size={14} className="text-secondary" />
                    <span>Schedule: <span className="font-bold text-primary">{ban.startDate}</span> to <span className="font-bold text-primary">{ban.endDate}</span></span>
                  </div>
                </div>
              </div>

              {/* Actions panel */}
              <div className="flex items-center justify-between border-t border-primary/5 pt-4">
                <span className="text-[10px] text-charcoal-light font-medium">
                  Banner Campaign ID: {ban.id}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(ban)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/10 text-xs font-bold text-primary hover:bg-primary/5 hover:border-primary transition-all cursor-pointer"
                  >
                    <Edit2 size={12} /> Edit Settings
                  </button>
                  <button
                    onClick={() => handleOpenDelete(ban.id)}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Banner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Banner Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={currentBanner ? "Edit Banner Campaign" : "Create Promotional Banner"}
        size="lg"
      >
        <form onSubmit={handleSubmitBanner} className="space-y-4">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} /> {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Sweets 15% Off"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Subtitle Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Crafted with pure desi ghee and ancient recipe styles."
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Button Label *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Sweets"
                    value={formButtonText}
                    onChange={(e) => setFormButtonText(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Button URL Link *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /category/sweets"
                    value={formButtonLink}
                    onChange={(e) => setFormButtonLink(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Placement tag *
                  </label>
                  <select
                    value={formPlacement}
                    onChange={(e) => setFormPlacement(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  >
                    <option value="Main Hero">Main Hero</option>
                    <option value="Promo Sidebar">Promo Sidebar</option>
                    <option value="Homepage Banner 2">Homepage Banner 2</option>
                    <option value="Promo Footer">Promo Footer</option>
                  </select>
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
            </div>

            <div className="space-y-3">
              {/* Image Input Selection Mode */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-primary">
                    Banner Image Source *
                  </label>
                  <span className="text-[10px] text-charcoal-light font-medium">
                    Supports JPG, PNG, WEBP, SVG
                  </span>
                </div>

                <div className="space-y-2">
                  {/* File Upload Box */}
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-secondary/40 hover:border-secondary bg-primary-dark/5 hover:bg-primary-dark/10 p-3 rounded-xl cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            showToast("Image file size should be less than 10MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormImage(reader.result);
                            showToast("Desktop image loaded successfully!", "success");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <span className="bg-secondary text-primary px-2.5 py-1 rounded-md text-[11px] shadow-xs">
                        📁 Choose Image from Desktop
                      </span>
                      <span className="text-[10px] text-charcoal-light">or Drag & Drop</span>
                    </div>
                  </label>

                  {/* Or Paste URL Option */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Or Paste Image URL (https://...)"
                      value={formImage.startsWith('data:') ? '[Desktop File Selected]' : formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-xs bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all font-mono"
                    />
                    {formImage && (
                      <button
                        type="button"
                        onClick={() => setFormImage("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-600 hover:underline px-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Preview Window */}
              <div className="h-32 border border-dashed border-primary/20 bg-background rounded-xl flex items-center justify-center overflow-hidden relative shadow-inner">
                {formImage ? (
                  <img
                    src={formImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      showToast("Invalid image preview.");
                    }}
                  />
                ) : (
                  <div className="text-center p-2 text-charcoal-light space-y-1">
                    <span className="text-[10px] block font-bold uppercase text-primary">No Image Selected</span>
                    <span className="text-[9px] block text-charcoal-light">Upload desktop image file or paste URL above</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
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
