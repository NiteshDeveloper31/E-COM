import React, { useState } from "react";
import { Plus, Edit2, Trash2, FolderTree, AlertTriangle, Layers } from "lucide-react";
import { useData } from "../context/DataContext";
import { Modal } from "../components/Modal";

export const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [formError, setFormError] = useState("");

  const handleOpenAdd = () => {
    setCurrentCategory(null);
    setFormName("");
    setFormDescription("");
    setFormStatus("Active");
    setFormError("");
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCurrentCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description);
    setFormStatus(cat.status);
    setFormError("");
    setIsAddEditOpen(true);
  };

  const handleOpenDelete = (id) => {
    setDeleteCategoryId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmitCategory = (e) => {
    e.preventDefault();
    if (!formName) {
      setFormError("Category name is required.");
      return;
    }

    const payload = {
      name: formName,
      description: formDescription,
      status: formStatus
    };

    if (currentCategory) {
      updateCategory(currentCategory.id, payload);
    } else {
      addCategory(payload);
    }

    setIsAddEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteCategoryId) {
      deleteCategory(deleteCategoryId);
      setIsDeleteOpen(false);
      setDeleteCategoryId(null);
    }
  };

  const activeDeleteCategory = categories.find((c) => c.id === deleteCategoryId);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Category Management
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Organize products into sections, view category counters, and manage catalogs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-primary text-secondary rounded-lg font-display font-bold text-sm shadow-md hover:bg-primary-light transition-all duration-200 cursor-pointer self-start sm:self-center"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Grid List of Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            {/* Header info */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 rounded-lg bg-primary/5 text-primary">
                  <FolderTree size={20} />
                </div>
                
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      cat.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-charcoal-light/10 text-charcoal-light border-charcoal-light/25"
                    }`}
                  >
                    {cat.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-lg text-primary">
                  {cat.name}
                </h3>
                <p className="text-xs text-charcoal-light leading-relaxed font-medium min-h-12">
                  {cat.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Footer metrics & actions */}
            <div className="px-6 py-4 bg-background border-t border-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Layers size={14} className="text-secondary" />
                <span>{cat.productCount} Products</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg text-charcoal hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
                  title="Edit category settings"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleOpenDelete(cat.id)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
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
              <AlertTriangle size={16} /> {formError}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Category Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Traditional Sweets"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what sweets or flour ingredients fit here..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Status *
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
              {currentCategory ? "Save Changes" : "Create Category"}
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
                Are you sure you want to delete this category? 
                {activeDeleteCategory?.productCount > 0 && (
                  <strong className="block mt-1 bg-rose-100/50 p-2 rounded-sm border border-rose-200 text-rose-800">
                    WARNING: There are currently {activeDeleteCategory.productCount} products assigned to this category. We highly recommend reassigning these products before deleting.
                  </strong>
                )}
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
