import React, { useState } from "react";
import { Plus, Edit2, Trash2, FolderTree, AlertTriangle, Layers, Upload, Image as ImageIcon, CheckCircle, Eye } from "lucide-react";
import { useData } from "../context/DataContext";
import { Modal } from "../components/Modal";
import { BACKEND_URL, getAdminImageUrl, handleAdminImageError } from "../config";

export const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setCurrentCategory(null);
    setFormName("");
    setFormDisplayName("");
    setFormImage("");
    setFormDescription("");
    setFormStatus("Active");
    setFormError("");
    setIsSubmitting(false);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCurrentCategory(cat);
    setFormName(cat.name);
    setFormDisplayName(cat.displayName || cat.name);
    setFormImage(cat.image || "");
    setFormDescription(cat.description || "");
    setFormStatus(cat.status || "Active");
    setFormError("");
    setIsSubmitting(false);
    setIsAddEditOpen(true);
  };

  const handleOpenDelete = (id) => {
    setDeleteCategoryId(id);
    setIsDeleteOpen(true);
  };

  // Image Upload File Handler
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Image size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result);
        setFormError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Category Name is required.");
      return;
    }

    // COMPULSORY IMAGE VALIDATION
    if (!formImage.trim()) {
      setFormError("Category Image is COMPULSORY. Please upload an image or provide an Image URL.");
      return;
    }

    const payload = {
      name: formName.trim(),
      displayName: formDisplayName.trim() || formName.trim(),
      image: formImage.trim(),
      description: formDescription.trim(),
      status: formStatus
    };

    setIsSubmitting(true);
    setFormError("");

    try {
      if (currentCategory) {
        await updateCategory(currentCategory.id || currentCategory._id, payload);
      } else {
        await addCategory(payload);
      }
      setIsAddEditOpen(false);
    } catch (err) {
      console.error("Failed to save category:", err);
      setFormError(err.message || "Failed to save category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteCategoryId) {
      deleteCategory(deleteCategoryId);
      setIsDeleteOpen(false);
      setDeleteCategoryId(null);
    }
  };

  const activeDeleteCategory = categories.find((c) => (c.id || c._id) === deleteCategoryId);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Category Management
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Manage store categories, compulsory category images, and frontend collection displays.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-primary text-secondary rounded-lg font-display font-bold text-sm shadow-md hover:bg-primary-light transition-all duration-200 cursor-pointer self-start sm:self-center"
        >
          <Plus size={16} /> Add New Category
        </button>
      </div>

      {/* Grid List of Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const categoryId = cat.id || cat._id;
          return (
            <div
              key={categoryId}
              className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Category Image Header */}
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-primary/10 group">
                {cat.image ? (
                  <img
                    src={getAdminImageUrl(cat.image)}
                    alt={cat.name}
                    onError={(e) => handleAdminImageError(e, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80")}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-charcoal-light space-y-1">
                    <ImageIcon size={28} />
                    <span className="text-xs font-semibold">No Image Set</span>
                  </div>
                )}
                
                {/* Status Badge Overlay */}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border shadow-sm ${
                      cat.status === "Active"
                        ? "bg-emerald-500 text-white border-emerald-600"
                        : "bg-charcoal-light/80 text-white border-charcoal-light"
                    }`}
                  >
                    {cat.status}
                  </span>
                </div>

                {/* Name Overlay on Image */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3.5 pt-8 text-white">
                  <h3 className="font-display font-extrabold text-base leading-tight drop-shadow-sm">
                    {cat.displayName || cat.name}
                  </h3>
                  {cat.displayName && cat.displayName !== cat.name && (
                    <span className="text-[10px] text-white/70 block">Category Key: {cat.name}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-4 space-y-2 flex-1">
                <p className="text-xs text-charcoal-light leading-relaxed font-medium line-clamp-2">
                  {cat.description || "No description provided."}
                </p>
              </div>

              {/* Footer metrics & actions */}
              <div className="px-4 py-3 bg-background border-t border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Layers size={14} className="text-secondary" />
                  <span>{cat.productCount || 0} Products</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-charcoal hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
                    title="Edit Category & Image"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(categoryId)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={currentCategory ? `Edit Category: ${currentCategory.name}` : "Create New Category"}
      >
        <form onSubmit={handleSubmitCategory} className="space-y-4">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Category Name (Database Key) *
              </label>
              <input
                type="text"
                placeholder="e.g. Pickles, Ghee, Thekua..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                required
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Display Label (Website Title)
              </label>
              <input
                type="text"
                placeholder="e.g. Pickle, Ghee, Theney..."
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>

            {/* COMPULSORY CATEGORY IMAGE UPLOAD */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-primary flex items-center justify-between">
                <span>Category Image (COMPULSORY) *</span>
                <span className="text-[10px] text-rose-600 font-bold uppercase">Required for Homepage Banner & Circles</span>
              </label>

              {/* Image Preview Box */}
              {formImage ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-secondary/40 bg-slate-50 group">
                  <img src={getAdminImageUrl(formImage)} alt="Category Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormImage("")}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-bold shadow-md hover:bg-rose-700 transition-colors"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-primary/20 hover:border-secondary rounded-xl p-6 text-center space-y-3 bg-slate-50/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-secondary/15 text-primary mx-auto flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <div className="space-y-1">
                    <label className="inline-block px-4 py-2 bg-primary text-secondary text-xs font-bold rounded-lg cursor-pointer hover:bg-primary-light shadow-sm transition-all">
                      Upload Image File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-charcoal-light font-medium">or paste image URL below</p>
                  </div>
                </div>
              )}

              {/* Direct Image URL input */}
              <input
                type="text"
                placeholder="https://example.com/image.jpg or /images/category.jpg"
                value={formImage}
                onChange={(e) => {
                  setFormImage(e.target.value);
                  if (e.target.value) setFormError("");
                }}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-xs bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Brief description of this category..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Status *
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all font-semibold"
              >
                <option value="Active">Active (Visible on Store)</option>
                <option value="Inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-primary/5 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 text-xs font-bold text-charcoal-light hover:bg-primary/5 hover:text-primary rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-display font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-slate-400 text-white cursor-not-allowed"
                  : "text-secondary bg-primary hover:bg-primary-light cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{currentCategory ? "Saving Changes..." : "Creating Category..."}</span>
                </>
              ) : (
                currentCategory ? "Save Changes" : "Create Category"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Category"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl">
            <AlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Confirm Deletion</h4>
              <p className="text-xs font-medium text-rose-600/90 mt-1 leading-relaxed">
                Are you sure you want to delete category <strong>"{activeDeleteCategory?.name}"</strong>?
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-xs font-bold text-charcoal-light hover:bg-primary/5 hover:text-primary rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Yes, Delete Category
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default Categories;
