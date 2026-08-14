import React, { useState, useEffect } from "react";
import { Search, PackageCheck, AlertTriangle, CheckCircle2, FileText, ArrowRight, RefreshCw, ShieldAlert, Boxes } from "lucide-react";
import { useData } from "../context/DataContext";
import { DataTable } from "../components/DataTable";

export const GRN = () => {
  const { products, grnLogs, fetchGRNLogs, submitGRN, showToast } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Form Inputs
  const [receivedQty, setReceivedQty] = useState("");
  const [goodQty, setGoodQty] = useState("");
  const [badQty, setBadQty] = useState("0");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGRNLogs();
  }, [fetchGRNLogs]);

  // Filter products by Name, SKU, EAN code
  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (p.name || "").toLowerCase().includes(q);
        const skuMatch = (p.sku || "").toLowerCase().includes(q);
        const eanMatch = (p.eanCode || "").toLowerCase().includes(q);
        const categoryStr = typeof p.category === "object" ? (p.category?.name || "") : String(p.category || "");
        const categoryMatch = categoryStr.toLowerCase().includes(q);
        return nameMatch || skuMatch || eanMatch || categoryMatch;
      })
    : [];

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchQuery(`${product.name} (${product.sku || 'No SKU'})`);
    setShowDropdown(false);
  };

  // Auto calculate badQty when received and good qty change
  const handleReceivedChange = (val) => {
    setReceivedQty(val);
    const recNum = parseInt(val) || 0;
    const goodNum = parseInt(goodQty) || 0;
    if (recNum >= goodNum) {
      setBadQty(String(recNum - goodNum));
    }
  };

  const handleGoodChange = (val) => {
    setGoodQty(val);
    const recNum = parseInt(receivedQty) || 0;
    const goodNum = parseInt(val) || 0;
    if (recNum >= goodNum) {
      setBadQty(String(recNum - goodNum));
    }
  };

  const handleSubmitGRN = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      showToast("Please search and select a product first.");
      return;
    }

    const recNum = parseInt(receivedQty) || 0;
    const goodNum = parseInt(goodQty) || 0;
    const badNum = parseInt(badQty) || 0;

    if (recNum <= 0) {
      showToast("Received Quantity must be greater than 0.");
      return;
    }

    if (goodNum + badNum !== recNum) {
      showToast(`Warning: Good Qty (${goodNum}) + Damaged Qty (${badNum}) must equal Received Qty (${recNum}).`);
    }

    setIsSubmitting(true);
    try {
      await submitGRN({
        productId: selectedProduct._id || selectedProduct.id,
        receivedQty: recNum,
        goodQty: goodNum,
        badQty: badNum,
        notes: notes.trim()
      });

      // Reset Form
      setSelectedProduct(null);
      setSearchQuery("");
      setReceivedQty("");
      setGoodQty("");
      setBadQty("0");
      setNotes("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Projected new stock calculation
  const currentStock = selectedProduct ? (selectedProduct.stock || 0) : 0;
  const goodQtyNum = parseInt(goodQty) || 0;
  const projectedStock = currentStock + goodQtyNum;

  // Audit Logs Table Columns
  const logColumns = [
    {
      header: "Date & Time",
      accessor: (row) => (
        <div>
          <p className="font-bold text-xs text-primary">{new Date(row.createdAt).toLocaleDateString("en-IN")}</p>
          <p className="text-[10px] text-charcoal-light">{new Date(row.createdAt).toLocaleTimeString("en-IN")}</p>
        </div>
      )
    },
    {
      header: "Product Details",
      accessor: (row) => (
        <div>
          <p className="font-bold text-xs text-primary">{row.productName}</p>
          <p className="text-[10px] text-charcoal-light font-mono">SKU: {row.sku || "N/A"} {row.weight ? `• ${row.weight}` : ""}</p>
        </div>
      )
    },
    {
      header: "Stock Change",
      accessor: (row) => (
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <span className="text-charcoal-light">{row.previousStock}</span>
          <ArrowRight size={12} className="text-secondary" />
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">{row.newStock} Pcs</span>
        </div>
      )
    },
    {
      header: "Received Audit",
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded" title="Total Received">
            Total: {row.receivedQty}
          </span>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded" title="Good Stock Added">
            ✓ {row.goodQty} Good
          </span>
          {row.badQty > 0 && (
            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded" title="Damaged Items">
              ⚠️ {row.badQty} Bad
            </span>
          )}
        </div>
      )
    },
    {
      header: "Notes & Admin",
      accessor: (row) => (
        <div>
          <p className="text-xs text-primary font-medium">{row.notes || "—"}</p>
          <p className="text-[10px] text-charcoal-light">{row.processedBy}</p>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight flex items-center gap-2">
            <PackageCheck className="text-secondary" size={28} /> Goods Receipt Note (GRN) Management
          </h1>
          <p className="text-xs text-charcoal-light font-medium mt-0.5">
            Search products by SKU / EAN / Name, record inward shipment batches, audit damaged items, and update live inventory stock.
          </p>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Product Search & Selected Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-primary flex items-center gap-2">
              <Search size={16} className="text-secondary" /> Step 1: Select Product
            </h3>

            {/* Search Input with Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-bold text-primary mb-1">
                Search SKU Code / Product Name / EAN
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type SKU (e.g. RS-THK-001) or Product Name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-9 pr-4 py-2.5 border border-primary/10 rounded-xl text-xs bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
                <Search className="absolute left-3 top-3 text-charcoal-light" size={14} />
              </div>

              {/* Autocomplete Dropdown List */}
              {showDropdown && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-primary/15 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-primary/5">
                  {filteredProducts.length === 0 ? (
                    <div className="p-3 text-center text-xs text-charcoal-light font-medium">
                      No matching product found.
                    </div>
                  ) : (
                    filteredProducts.map((p) => (
                      <div
                        key={p._id || p.id}
                        onClick={() => handleSelectProduct(p)}
                        className="p-3 hover:bg-primary/5 transition-colors cursor-pointer flex items-center gap-3"
                      >
                        <img
                          src={p.image || "/images/placeholder.jpg"}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover border border-primary/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-primary truncate">{p.name}</p>
                          <p className="text-[10px] text-charcoal-light font-mono truncate">
                            SKU: {p.sku || "N/A"} {p.weight ? `• ${p.weight}` : ""}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          Stock: {p.stock || 0}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Product Summary Card */}
            {selectedProduct ? (
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProduct.image || "/images/placeholder.jpg"}
                    alt={selectedProduct.name}
                    className="w-12 h-12 rounded-xl object-cover border border-primary/15 shadow-2xs shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-primary">{selectedProduct.name}</h4>
                    <p className="text-xs text-charcoal-light font-mono">
                      SKU: <span className="font-bold text-primary">{selectedProduct.sku || "N/A"}</span>
                    </p>
                    {selectedProduct.weight && (
                      <p className="text-[11px] text-charcoal-light">Weight/Size: {selectedProduct.weight}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-primary/10 text-xs">
                  <span className="text-charcoal-light font-semibold">Current Inventory Stock:</span>
                  <span className="font-bold px-2.5 py-1 bg-primary text-secondary rounded-lg">
                    {selectedProduct.stock || 0} Units
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 border border-dashed border-primary/15 rounded-xl text-center space-y-2 bg-background/50">
                <Boxes size={24} className="text-charcoal-light mx-auto" />
                <p className="text-xs font-semibold text-charcoal-light">No product selected yet.</p>
                <p className="text-[11px] text-charcoal-light/70">Use the search box above to pick a product by SKU or Name.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: GRN Stock Entry Form */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmitGRN} className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm space-y-5">
            <div className="border-b border-primary/10 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
                  <FileText size={18} className="text-secondary" /> Step 2: GRN Stock Inward Entry
                </h3>
                <p className="text-xs text-charcoal-light">Record inward stock quantity, verify good vs bad items, and submit.</p>
              </div>

              {selectedProduct && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-charcoal-light block">Projected Stock</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                    {currentStock} → {projectedStock} (+{goodQtyNum})
                  </span>
                </div>
              )}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Total Received Qty <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 100"
                  value={receivedQty}
                  onChange={(e) => handleReceivedChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-primary/10 rounded-xl text-sm bg-background font-bold text-primary focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                  ✓ Good / Usable Qty <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 95"
                  value={goodQty}
                  onChange={(e) => handleGoodChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-emerald-300 rounded-xl text-sm bg-emerald-50/50 font-bold text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-800 mb-1 flex items-center gap-1">
                  ⚠️ Bad / Damaged Qty
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={badQty}
                  onChange={(e) => setBadQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-rose-300 rounded-xl text-sm bg-rose-50/50 font-bold text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Notes / Inspection Comments (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 5 Jars broken in transit during transport shipment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 border border-primary/10 rounded-xl text-xs bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedProduct}
                className="px-6 py-3 bg-primary text-secondary rounded-xl font-display font-bold text-xs shadow-md hover:bg-primary-light transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <PackageCheck size={16} />
                {isSubmitting ? "Processing GRN..." : "Submit GRN & Update Live Inventory"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Section: Recent GRN Audit Logs */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-base text-primary">
          Recent GRN Audit History Logs ({grnLogs.length})
        </h3>
        <DataTable
          columns={logColumns}
          data={grnLogs}
          emptyMessage="No GRN entries logged yet. Record your first inward batch above."
        />
      </div>
    </div>
  );
};
export default GRN;
