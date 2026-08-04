import React, { useState } from "react";
import { Plus, Edit2, Trash2, Loader, Eye, AlertTriangle } from "lucide-react";
import { useData } from "../context/DataContext";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";

export const Products = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, loading, showToast } = useData();

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // Null for add, product object for edit
  const [deleteProductId, setDeleteProductId] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [formImage, setFormImage] = useState("");
  const [formImages, setFormImages] = useState(["", "", "", "", ""]);
  const [activeImageSlot, setActiveImageSlot] = useState(0);
  const [formVideo, setFormVideo] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formShortDescription, setFormShortDescription] = useState("");
  const [formIngredients, setFormIngredients] = useState("");
  const [formBenefits, setFormBenefits] = useState("");
  const [formSkuCode, setFormSkuCode] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formGst, setFormGst] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formError, setFormError] = useState("");

  const formatINR = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  // Open add modal
  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormCategory("");
    setFormStock("");
    setFormStatus("Active");
    setFormImage("");
    setFormImages(["", "", "", "", ""]);
    setActiveImageSlot(0);
    setFormVideo("");
    setFormWeight("");
    setFormShortDescription("");
    setFormIngredients("");
    setFormBenefits("");
    setFormSkuCode("");
    setFormBrand("");
    setFormGst("");
    setFormExpiryDate("");
    setFormError("");
    setIsAddEditOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setFormName(product.name);
    setFormDescription(product.description || "");
    setFormPrice(product.price);
    setFormCategory(product.category?._id || product.category?.id || product.category || "");
    setFormStock(product.stock);
    setFormStatus(product.status || "Active");
    setFormImage(product.image || "");

    // Map multiple images slots
    let imgs = ["", "", "", "", ""];
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img, idx) => {
        if (idx < 5) imgs[idx] = img;
      });
      if (product.images.length === 0 && product.image) {
        imgs[0] = product.image;
      }
    } else if (product.image) {
      imgs[0] = product.image;
    }
    setFormImages(imgs);
    setActiveImageSlot(0);
    setFormVideo(product.video || "");

    setFormWeight(product.weight || "");
    setFormShortDescription(product.shortDescription || "");
    setFormIngredients(
      product.ingredients && Array.isArray(product.ingredients)
        ? product.ingredients.join(", ")
        : ""
    );
    setFormBenefits(
      product.benefits && Array.isArray(product.benefits)
        ? product.benefits.join(", ")
        : ""
    );
    setFormSkuCode(product.sku || "");
    setFormBrand(product.brand || "");
    setFormGst(product.gst !== undefined && product.gst !== null ? String(product.gst) : "");
    setFormExpiryDate(
      product.expiryDate ? new Date(product.expiryDate).toISOString().split("T")[0] : ""
    );

    setFormError("");
    setIsAddEditOpen(true);
  };

  // Open delete confirmation
  const handleOpenDelete = (id) => {
    setDeleteProductId(id);
    setIsDeleteOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("File size is too large (max 2MB to prevent heavy database load).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...formImages];
        updated[activeImageSlot] = reader.result;
        setFormImages(updated);
        if (activeImageSlot === 0) {
          setFormImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const MAX_VIDEO_SECONDS = 30;
  const MAX_VIDEO_SIZE_MB = 20;

  const readVideoDuration = (src) => {
    return new Promise((resolve, reject) => {
      const videoEl = document.createElement("video");
      videoEl.preload = "metadata";
      videoEl.onloadedmetadata = () => resolve(videoEl.duration);
      videoEl.onerror = () => reject(new Error("Unable to read video metadata."));
      videoEl.src = src;
    });
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      showToast(`Video file is too large (max ${MAX_VIDEO_SIZE_MB}MB).`);
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    readVideoDuration(objectUrl)
      .then((duration) => {
        URL.revokeObjectURL(objectUrl);
        if (duration > MAX_VIDEO_SECONDS) {
          showToast(`Video must be ${MAX_VIDEO_SECONDS} seconds or shorter (this one is ${Math.round(duration)}s).`);
          e.target.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormVideo(reader.result);
        };
        reader.readAsDataURL(file);
      })
      .catch(() => {
        URL.revokeObjectURL(objectUrl);
        // Fallback: allow the video file to be loaded even if metadata duration cannot be read.
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormVideo(reader.result);
        };
        reader.readAsDataURL(file);
      });
  };

  const handleVideoUrlChange = (url) => {
    setFormVideo(url);
    if (!url) return;
    readVideoDuration(url).then((duration) => {
      if (duration > MAX_VIDEO_SECONDS) {
        showToast(`Video must be ${MAX_VIDEO_SECONDS} seconds or shorter (this one is ${Math.round(duration)}s).`);
        setFormVideo("");
      }
    }).catch(() => {
      // Remote URL metadata isn't always readable (e.g. CORS) - allow it through silently.
    });
  };

  // Handle Form Submit (Add/Edit)
  const handleSubmitProduct = (e) => {
    e.preventDefault();

    const activeImages = formImages.filter((img) => img.trim() !== "");
    const primaryImg = activeImages[0] || formImage || "";

    if (!formName || !formPrice || !formStock || !primaryImg || !formCategory) {
      setFormError("Please fill out all required fields (*). Make sure a category is selected and at least one product image is uploaded.");
      return;
    }

    const payload = {
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice),
      category: formCategory,
      stock: parseInt(formStock),
      status: formStatus,
      image: primaryImg,
      images: activeImages,
      video: formVideo,
      weight: formWeight,
      shortDescription: formShortDescription,
      ingredients: formIngredients
        ? formIngredients.split(",").map((i) => i.trim()).filter((i) => i !== "")
        : [],
      benefits: formBenefits
        ? formBenefits.split(",").map((b) => b.trim()).filter((b) => b !== "")
        : [],
      sku: formSkuCode || undefined,
      brand: formBrand,
      gst: formGst ? parseFloat(formGst) : 0,
      expiryDate: formExpiryDate || null
    };

    if (currentProduct) {
      updateProduct(currentProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setIsAddEditOpen(false);
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = () => {
    if (deleteProductId) {
      deleteProduct(deleteProductId);
      setIsDeleteOpen(false);
      setDeleteProductId(null);
    }
  };

  // Set up categories filtering options
  const filterOptions = categories.map((cat) => ({
    value: cat._id || cat.id,
    label: cat.name
  }));

  // Flatten the populated category ref into a filterable id so DataTable's
  // generic string-equality filter can match it against filterOptions values.
  const tableData = products.map((p) => ({
    ...p,
    categoryId: p.category?._id || p.category?.id || (typeof p.category === "string" ? p.category : "")
  }));

  // Define data table columns
  const columns = [
    {
      key: "image",
      header: "Preview",
      render: (row) => (
        <img
          src={row.image}
          alt={row.name}
          className="w-12 h-12 object-cover rounded-lg border border-primary/5 shadow-xs"
        />
      )
    },
    {
      key: "name",
      header: "Product Details",
      render: (row) => (
        <div>
          <span className="font-display font-semibold text-sm text-primary block">
            {row.name}
          </span>
          <span className="text-[10px] text-charcoal-light font-bold">
            SKU: {row.sku}
          </span>
        </div>
      )
    },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <span className="text-xs text-charcoal-light font-semibold">
          {row.category?.name || <span className="italic text-charcoal-light/60">Uncategorized</span>}
        </span>
      )
    },
    {
      key: "price",
      header: "Pricing",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-primary font-bold">{formatINR(row.price)}</span>
          {row.compareAtPrice && (
            <span className="line-through text-charcoal-light text-[10px] font-medium">
              {formatINR(row.compareAtPrice)}
            </span>
          )}
        </div>
      )
    },
    {
      key: "stock",
      header: "Inventory",
      render: (row) => {
        let textClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
        if (row.stock <= 50) {
          textClass = "text-rose-700 bg-rose-50 border-rose-200";
        } else if (row.stock <= 100) {
          textClass = "text-amber-700 bg-amber-50 border-amber-200";
        }
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className={`px-2 py-0.5 text-xs font-bold rounded-sm border ${textClass}`}>
              {row.stock} units
            </span>
            {row.stock <= 50 && (
              <span className="text-[9px] text-rose-500 font-bold flex items-center gap-0.5">
                <AlertTriangle size={10} /> Low stock
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${row.status === "Active"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-charcoal-light/10 text-charcoal-light border-charcoal-light/25"
            }`}
        >
          {row.status}
        </span>
      )
    }
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Product Management
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Manage your gourmet snacks catalog, adjust prices, and check inventory.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-primary text-secondary rounded-lg font-display font-bold text-sm shadow-md hover:bg-primary-light transition-all duration-200 cursor-pointer self-start sm:self-center"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Main product data table */}
      <DataTable
        columns={columns}
        data={tableData}
        searchKey="name"
        searchPlaceholder="Search products by name..."
        filterKey="categoryId"
        filterPlaceholder="Select Category"
        filterOptions={filterOptions}
        renderActions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 rounded-lg text-charcoal hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
              title="Edit product details"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => handleOpenDelete(row.id)}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete product"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={currentProduct ? `Edit Product: ${currentProduct.name}` : "Create New Product"}
        size="lg"
      >
        <form onSubmit={handleSubmitProduct} className="space-y-4">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} /> {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left side form fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Jaggery Sattu"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all disabled:opacity-50"
                    disabled={categories.length === 0}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {loading && categories.length === 0 ? (
                    <span className="text-[10px] text-charcoal-light flex items-center gap-1.5 mt-1">
                      <Loader size={12} className="animate-spin" /> Loading categories...
                    </span>
                  ) : categories.length === 0 ? (
                    <p className="text-[10px] text-rose-600 font-bold mt-1">
                      No categories available. Please create a category first.
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Weight/Qty
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500g"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 299"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Portal Status *
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="Sku code"
                    value={formSkuCode}
                    onChange={(e) => setFormSkuCode(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Brand name"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    GST (%)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 18"
                    min="0"
                    max="100"
                    value={formGst}
                    onChange={(e) => setFormGst(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Ingredients (comma separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="Pure Cow Milk, Organic Sugar, Cardamom"
                  value={formIngredients}
                  onChange={(e) => setFormIngredients(e.target.value)}
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Key Benefits (comma separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="Rich in nutrition, Traditional preparation, No preservatives"
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
                />
              </div>
            </div>

            {/* Right side form fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Product Images (Up to 5) *
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {formImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImageSlot(idx)}
                      className={`relative aspect-square border rounded-lg cursor-pointer flex items-center justify-center overflow-hidden transition-all duration-200 ${activeImageSlot === idx
                        ? "border-secondary ring-1 ring-secondary/50 shadow-sm"
                        : "border-primary/10 hover:border-primary/20"
                        }`}
                    >
                      {img ? (
                        <img src={img} alt={`Slot ${idx + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-charcoal-light/75">#{idx + 1}</span>
                      )}
                      {img && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = [...formImages];
                            updated[idx] = "";
                            setFormImages(updated);
                            if (idx === 0) {
                              setFormImage("");
                            }
                          }}
                          className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-700 transition-colors shadow-xs"
                          title="Remove image"
                        >
                          <Trash2 size={8} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-1 border border-primary/10 rounded-lg text-xs bg-background focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-[10px] text-charcoal-light font-semibold">
                    <span>Or paste URL for Slot #{activeImageSlot + 1}:</span>
                    <input
                      type="text"
                      placeholder="Paste image web link"
                      value={formImages[activeImageSlot] && !formImages[activeImageSlot].startsWith("data:") ? formImages[activeImageSlot] : ""}
                      onChange={(e) => {
                        const updated = [...formImages];
                        updated[activeImageSlot] = e.target.value;
                        setFormImages(updated);
                        if (activeImageSlot === 0) {
                          setFormImage(e.target.value);
                        }
                      }}
                      className="flex-1 px-2 py-0.5 border border-primary/10 rounded-md text-[10px] bg-background placeholder-charcoal-light focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Image Preview Window */}
              <div className="h-28 border border-dashed border-primary/15 bg-background rounded-lg flex items-center justify-center overflow-hidden">
                {formImages[activeImageSlot] ? (
                  <img
                    src={formImages[activeImageSlot]}
                    alt={`Slot ${activeImageSlot + 1} Preview`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "";
                      showToast("Invalid image URL, please verify link.");
                    }}
                  />
                ) : (
                  <div className="text-center p-2 text-charcoal-light">
                    <span className="text-[10px] block font-semibold uppercase">Slot #{activeImageSlot + 1} Empty</span>
                    <span className="text-[9px] block">Upload file or paste URL above</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Product Video (optional, max {MAX_VIDEO_SECONDS}s)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="w-full px-3 py-1 border border-primary/10 rounded-lg text-xs bg-background focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-[10px] text-charcoal-light font-semibold">
                    <span>Or paste video URL:</span>
                    <input
                      type="text"
                      placeholder="Paste video web link"
                      value={formVideo && !formVideo.startsWith("data:") ? formVideo : ""}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      className="flex-1 px-2 py-0.5 border border-primary/10 rounded-md text-[10px] bg-background placeholder-charcoal-light focus:outline-none"
                    />
                  </div>
                </div>

                {formVideo ? (
                  <div className="relative mt-2 h-28 border border-dashed border-primary/15 bg-background rounded-lg overflow-hidden">
                    <video src={formVideo} controls className="w-full h-full object-contain bg-black" />
                    <button
                      type="button"
                      onClick={() => setFormVideo("")}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 hover:bg-rose-700 transition-colors shadow-xs"
                      title="Remove video"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 h-16 border border-dashed border-primary/15 bg-background rounded-lg flex items-center justify-center text-center p-2 text-charcoal-light">
                    <span className="text-[10px] font-semibold uppercase">No video uploaded</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe snack weight, primary flavor note, or visual aspect briefly."
                  value={formShortDescription}
                  onChange={(e) => setFormShortDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide deep product details, culinary history, serving recommendations, etc."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
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
              {currentProduct ? "Save Changes" : "Publish Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Confirmation"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl">
            <AlertTriangle size={24} className="flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Are you absolutely sure?</h4>
              <p className="text-xs font-medium text-rose-600/90 mt-0.5">
                This action is permanent. Deleting this product will remove it from the store catalog immediately.
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
              Yes, Delete Product
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default Products;
