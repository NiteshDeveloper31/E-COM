import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Ticket, Percent, DollarSign, Tag, Check, X, Calendar, Layers, ShoppingBag, FolderTree } from "lucide-react";
import { useData } from "../context/DataContext";
import { Modal } from "../components/Modal";

import { API_BASE_URL } from "../config";

export const Coupons = () => {
  const { categories, products, token, showToast } = useData();

  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteCouponId, setDeleteCouponId] = useState(null);

  // Form fields
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // "percentage" | "flat"
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [applicableScope, setApplicableScope] = useState("ALL"); // "ALL" | "CATEGORY" | "PRODUCT"
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Coupons from API
  const fetchCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      const activeToken = token || localStorage.getItem("rs_token");
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons(data.data || []);
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setCode("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMaxDiscount("");
    setApplicableScope("ALL");
    setSelectedCategories([]);
    setSelectedProducts([]);
    setMinOrderAmount("0");
    setValidFrom(new Date().toISOString().split("T")[0]);
    setValidUntil("");
    setUsageLimit("");
    setPerUserLimit("1");
    setIsActive(true);
    setFormError("");
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDescription(coupon.description || "");
    setDiscountType(coupon.discountType || "percentage");
    setDiscountValue(String(coupon.discountValue || ""));
    setMaxDiscount(coupon.maxDiscount ? String(coupon.maxDiscount) : "");
    setApplicableScope(coupon.applicableScope || "ALL");
    setSelectedCategories((coupon.applicableCategories || []).map(c => c._id || c));
    setSelectedProducts((coupon.applicableProducts || []).map(p => p._id || p));
    setMinOrderAmount(String(coupon.minOrderAmount || 0));
    setValidFrom(coupon.validFrom ? new Date(coupon.validFrom).toISOString().split("T")[0] : "");
    setValidUntil(coupon.validUntil ? new Date(coupon.validUntil).toISOString().split("T")[0] : "");
    setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : "");
    setPerUserLimit(String(coupon.perUserLimit || 1));
    setIsActive(coupon.isActive !== undefined ? coupon.isActive : true);
    setFormError("");
    setIsAddEditOpen(true);
  };

  const handleOpenDelete = (id) => {
    setDeleteCouponId(id);
    setIsDeleteOpen(true);
  };

  const handleCategoryToggle = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleProductToggle = (prodId) => {
    setSelectedProducts(prev =>
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSubmitCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setFormError("Coupon code is required.");
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setFormError("Valid discount value is required.");
      return;
    }

    if (applicableScope === "CATEGORY" && selectedCategories.length === 0) {
      setFormError("Please select at least one category for Category Scope.");
      return;
    }

    if (applicableScope === "PRODUCT" && selectedProducts.length === 0) {
      setFormError("Please select at least one product for Item Scope.");
      return;
    }

    try {
      setIsSubmitting(true);
      const activeToken = token || localStorage.getItem("rs_token");

      const payload = {
        code: code.trim().toUpperCase(),
        description,
        discountType,
        discountValue: Number(discountValue),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        applicableScope,
        applicableCategories: applicableScope === "CATEGORY" ? selectedCategories : [],
        applicableProducts: applicableScope === "PRODUCT" ? selectedProducts : [],
        minOrderAmount: Number(minOrderAmount || 0),
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        perUserLimit: Number(perUserLimit || 1),
        isActive
      };

      const url = editingCoupon
        ? `${API_BASE_URL}/coupons/${editingCoupon._id || editingCoupon.id}`
        : `${API_BASE_URL}/coupons`;
      
      const method = editingCoupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(editingCoupon ? "Coupon updated successfully!" : "Coupon created successfully!", "success");
        setIsAddEditOpen(false);
        fetchCoupons();
      } else {
        setFormError(data.message || "Failed to save coupon.");
      }
    } catch (err) {
      console.error("Error saving coupon:", err);
      setFormError("Server error while saving coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const activeToken = token || localStorage.getItem("rs_token");
      const res = await fetch(`${API_BASE_URL}/coupons/${deleteCouponId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Coupon deleted successfully.", "success");
        setIsDeleteOpen(false);
        fetchCoupons();
      } else {
        showToast(data.message || "Failed to delete coupon.", "error");
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
      showToast("Error deleting coupon.", "error");
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const activeToken = token || localStorage.getItem("rs_token");
      const res = await fetch(`${API_BASE_URL}/coupons/${coupon._id || coupon.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Coupon status changed to ${!coupon.isActive ? "Active" : "Inactive"}.`, "success");
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error toggling coupon status:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-primary/10 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-display text-primary flex items-center gap-2">
            <Ticket className="text-secondary" /> Coupon & Promo Code Management
          </h1>
          <p className="text-xs text-charcoal-light mt-1">
            Create promotional coupons with flexible scopes (Whole Store, Specific Category, or Individual Item) & minimum purchase limits.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-primary/10 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-charcoal-light">Loading coupons database...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl">
              🎟️
            </div>
            <h3 className="text-base font-bold text-primary">No Coupons Created Yet</h3>
            <p className="text-xs text-charcoal-light max-w-sm mx-auto">
              Create your first promotional discount coupon for storewide sales, special categories, or individual items.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              <Plus size={14} /> Create Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal">
              <thead className="bg-primary-dark/5 text-primary text-[11px] font-bold uppercase tracking-wider border-b border-primary/10">
                <tr>
                  <th className="px-5 py-3.5">Code & Description</th>
                  <th className="px-5 py-3.5">Applicable Scope</th>
                  <th className="px-5 py-3.5">Discount Offer</th>
                  <th className="px-5 py-3.5">Min Purchase</th>
                  <th className="px-5 py-3.5">Usage / Expiry</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 font-medium">
                {coupons.map((coupon) => (
                  <tr key={coupon._id || coupon.id} className="hover:bg-primary-dark/2 transition-colors">
                    
                    {/* Code & Description */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300/60 px-2.5 py-1 rounded text-xs tracking-wider">
                          {coupon.code}
                        </span>
                      </div>
                      {coupon.description && (
                        <p className="text-[11px] text-charcoal-light mt-1 max-w-xs truncate">
                          {coupon.description}
                        </p>
                      )}
                    </td>

                    {/* Scope */}
                    <td className="px-5 py-4">
                      {coupon.applicableScope === "ALL" && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded text-[11px] border border-emerald-200">
                          <Layers size={12} /> Whole Store
                        </span>
                      )}
                      {coupon.applicableScope === "CATEGORY" && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded text-[11px] border border-blue-200">
                            <Layers size={12} /> Specific Category ({coupon.applicableCategories?.length || 0})
                          </span>
                          <p className="text-[10px] text-charcoal-light truncate max-w-[160px]">
                            {coupon.applicableCategories?.map(c => c.name || c).join(", ") || "Categories"}
                          </p>
                        </div>
                      )}
                      {coupon.applicableScope === "PRODUCT" && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 font-semibold px-2.5 py-0.5 rounded text-[11px] border border-purple-200">
                            <ShoppingBag size={12} /> Specific Item ({coupon.applicableProducts?.length || 0})
                          </span>
                          <p className="text-[10px] text-charcoal-light truncate max-w-[160px]">
                            {coupon.applicableProducts?.map(p => p.name || p).join(", ") || "Products"}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Discount Offer */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-primary">
                        {coupon.discountType === "percentage" ? (
                          <span>{coupon.discountValue}% OFF</span>
                        ) : (
                          <span>₹{coupon.discountValue} FLAT OFF</span>
                        )}
                      </div>
                      {coupon.discountType === "percentage" && coupon.maxDiscount && (
                        <span className="text-[10px] text-charcoal-light">Up to ₹{coupon.maxDiscount}</span>
                      )}
                    </td>

                    {/* Min Purchase */}
                    <td className="px-5 py-4 font-semibold">
                      {coupon.minOrderAmount > 0 ? (
                        <span className="text-primary">Min ₹{coupon.minOrderAmount}</span>
                      ) : (
                        <span className="text-emerald-600">No Minimum</span>
                      )}
                    </td>

                    {/* Usage / Expiry */}
                    <td className="px-5 py-4">
                      <div>
                        Uses: <span className="font-bold">{coupon.usedCount || 0}</span>
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (Unlimited)"}
                      </div>
                      <div className="text-[10px] text-charcoal-light mt-0.5">
                        {coupon.validUntil ? (
                          <span>Exp: {new Date(coupon.validUntil).toLocaleDateString()}</span>
                        ) : (
                          <span>No Expiration</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          coupon.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {coupon.isActive ? <Check size={12} /> : <X size={12} />}
                        {coupon.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(coupon)}
                        className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit Coupon"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(coupon._id || coupon.id)}
                        className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Coupon Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingCoupon ? "Edit Promotional Coupon" : "Create New Promotional Coupon"}
      >
        <form onSubmit={handleSubmitCoupon} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Coupon Code & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Coupon Code *</label>
              <input
                type="text"
                placeholder="e.g. BIHAR15, FESTIVE10"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full text-xs font-mono font-bold uppercase p-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Short Description</label>
              <input
                type="text"
                placeholder="e.g. 15% OFF on traditional delicacies"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
              />
            </div>
          </div>

          {/* Applicable Scope Selector */}
          <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-primary">
              1. Select Coupon Applicability Scope *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setApplicableScope("ALL")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  applicableScope === "ALL"
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-white text-charcoal border-gray-200 hover:border-primary/40"
                }`}
              >
                <Layers size={16} className="mb-1" /> Whole Store
              </button>
              <button
                type="button"
                onClick={() => setApplicableScope("CATEGORY")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  applicableScope === "CATEGORY"
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-white text-charcoal border-gray-200 hover:border-primary/40"
                }`}
              >
                <FolderTree size={16} className="mb-1" /> Per Category
              </button>
              <button
                type="button"
                onClick={() => setApplicableScope("PRODUCT")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  applicableScope === "PRODUCT"
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-white text-charcoal border-gray-200 hover:border-primary/40"
                }`}
              >
                <ShoppingBag size={16} className="mb-1" /> Per Item
              </button>
            </div>

            {/* Scope Specific Selection List */}
            {applicableScope === "CATEGORY" && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                <span className="text-[11px] font-bold text-primary block">
                  Select Target Category/Categories:
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const catId = cat.id || cat._id;
                    const isChecked = selectedCategories.includes(catId);
                    return (
                      <label
                        key={catId}
                        className={`flex items-center gap-2 p-2 rounded text-xs font-medium border cursor-pointer ${
                          isChecked ? "bg-amber-50 border-amber-300 text-amber-900 font-bold" : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCategoryToggle(catId)}
                          className="rounded text-secondary focus:ring-secondary"
                        />
                        <span>{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {applicableScope === "PRODUCT" && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                <span className="text-[11px] font-bold text-primary block">
                  Select Target Product Item(s):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {products.map((prod) => {
                    const prodId = prod.id || prod._id;
                    const isChecked = selectedProducts.includes(prodId);
                    return (
                      <label
                        key={prodId}
                        className={`flex items-center gap-2 p-2 rounded text-xs font-medium border cursor-pointer ${
                          isChecked ? "bg-amber-50 border-amber-300 text-amber-900 font-bold" : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleProductToggle(prodId)}
                          className="rounded text-secondary focus:ring-secondary"
                        />
                        <span className="truncate">{prod.name} (₹{prod.price})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none font-semibold"
              >
                <option value="percentage">Percentage (% OFF)</option>
                <option value="flat">Flat Amount (₹ OFF)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Discount Value {discountType === "percentage" ? "(%)" : "(₹)"} *
              </label>
              <input
                type="number"
                min="1"
                placeholder={discountType === "percentage" ? "e.g. 15" : "e.g. 100"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full text-xs font-bold p-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Max Discount Cap (₹) {discountType === "flat" && "(Optional)"}
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 200 (Max ₹ cap)"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
              />
            </div>
          </div>

          {/* Minimum Purchase Threshold */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
            <label className="block text-xs font-bold text-emerald-900">
              2. Minimum Purchase Threshold (Flexible) *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800">Min Cart Subtotal (₹):</span>
              <input
                type="number"
                min="0"
                placeholder="0 for no minimum"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-40 text-xs font-bold p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              />
              <span className="text-[11px] text-emerald-700 italic">
                {Number(minOrderAmount) > 0
                  ? `Coupon applies only if order is at least ₹${minOrderAmount}`
                  : "No minimum purchase requirement"}
              </span>
            </div>
          </div>

          {/* Dates & Usage Limits */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Valid From</label>
              <input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full text-xs p-2 border rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Valid Until (Expiry)</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full text-xs p-2 border rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Total Max Uses</label>
              <input
                type="number"
                min="1"
                placeholder="Empty for unlimited"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full text-xs p-2 border rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Per User Limit</label>
              <input
                type="number"
                min="1"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                className="w-full text-xs p-2 border rounded-lg outline-none font-bold"
              />
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between pt-2 border-t">
            <label className="text-xs font-bold text-primary">Coupon Status</label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {isActive ? "ACTIVE" : "INACTIVE"}
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 text-xs font-bold text-charcoal bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-light rounded-lg cursor-pointer"
            >
              {isSubmitting ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Delete Coupon"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal leading-relaxed">
            Are you sure you want to delete this promotional coupon? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-xs font-bold bg-gray-100 text-charcoal rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg"
            >
              Delete Coupon
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
