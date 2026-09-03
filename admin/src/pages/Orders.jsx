import React, { useState, useRef } from "react";
import { Eye, Edit, Clock, MapPin, CreditCard, ShoppingBag, AlertTriangle, Download, Printer, Camera } from "lucide-react";
import * as XLSX from "xlsx";
import { useData } from "../context/DataContext";
import { DataTable } from "../components/DataTable";
import { Drawer } from "../components/Drawer";
import { getAdminImageUrl, handleAdminImageError } from "../config";

export const Orders = () => {
  const { orders, products, updateOrderStatus } = useData();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [shippingCourier, setShippingCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [packetNumber, setPacketNumber] = useState("");
  const [printModalOrder, setPrintModalOrder] = useState(null);
  const [printMode, setPrintMode] = useState("all"); // 'all', 'invoice', 'label'
  const [isPickListOpen, setIsPickListOpen] = useState(false);

  // Filter orders with status 'Pending' ONLY for Warehouse Pick List
  const pendingOrders = React.useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter(o => o.orderStatus === "Pending");
  }, [orders]);

  // Aggregated SKU Pick List Summary (Includes Gift Box Bundle Items & Quantities Breakdown)
  const pickListSummary = React.useMemo(() => {
    const map = {};
    pendingOrders.forEach(order => {
      const orderCode = order.orderCode || (order.id ? `RS_${String(order.id).slice(-4).toUpperCase()}` : "RS_2410");
      (order.items || []).forEach(item => {
        const prodId = item.productId?._id || item.productId;
        const matchedProduct = (products || []).find(p => String(p._id || p.id) === String(prodId));

        const isBundle = (matchedProduct && (matchedProduct.isBundle || (matchedProduct.bundleItems && matchedProduct.bundleItems.length > 0))) ||
                         (item.bundleItems && item.bundleItems.length > 0) ||
                         (item.productName || "").toLowerCase().includes("gift") ||
                         (item.productName || "").toLowerCase().includes("combo");

        const bundleItems = (matchedProduct && matchedProduct.bundleItems && matchedProduct.bundleItems.length > 0)
          ? matchedProduct.bundleItems
          : (item.bundleItems || []);

        const sku = item.sku || (matchedProduct && matchedProduct.sku) || "RS-GIF-9015";

        if (!map[sku]) {
          map[sku] = {
            name: item.productName || "Product Item",
            sku: sku,
            quantity: 0,
            orders: [],
            isBundle: isBundle,
            bundleItems: bundleItems
          };
        }
        map[sku].quantity += Number(item.quantity || 1);
        if (!map[sku].orders.includes(orderCode)) {
          map[sku].orders.push(orderCode);
        }
      });
    });
    return Object.values(map);
  }, [pendingOrders, products]);

  const formatINR = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Processing: "bg-blue-50 text-blue-700 border-blue-200",
      "On Hold": "bg-purple-50 text-purple-700 border-purple-200",
      Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Cancelled: "bg-rose-50 text-rose-700 border-rose-200"
    };
    return (
      <span
        className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
          styles[status] || "bg-charcoal/5 text-charcoal"
        }`}
      >
        {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const styles = {
      Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Failed: "bg-rose-50 text-rose-700 border-rose-200"
    };
    return (
      <span
        className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
          styles[status] || "bg-charcoal/5 text-charcoal"
        }`}
      >
        {status}
      </span>
    );
  };

  const [scannedSkuInput, setScannedSkuInput] = useState("");
  const [verifiedSkusMap, setVerifiedSkusMap] = useState({});
  const [skuScanAlert, setSkuScanAlert] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const getItemSku = (item) => {
    if (item.sku) return item.sku;
    if (item.productId && typeof item.productId === "object" && item.productId.sku) return item.productId.sku;
    const prodId = item.productId?._id || item.productId;
    const matched = (products || []).find(p => String(p._id || p.id) === String(prodId));
    if (matched && matched.sku) return matched.sku;
    return 'RS-WED-GIFT-2026';
  };

  const startCameraScan = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      let scanning = true;
      const detectLoop = async () => {
        if (!scanning || !videoRef.current) return;
        try {
          if ('BarcodeDetector' in window) {
            const detector = new window.BarcodeDetector({
              formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'ean_8', 'upc_a']
            });
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const scannedValue = barcodes[0].rawValue || barcodes[0].rawValueText || "";
              if (scannedValue) {
                scanning = false;
                stopCameraScan();
                setScannedSkuInput(scannedValue);
                verifySkuValue(scannedValue);
                return;
              }
            }
          }
        } catch (e) {
          // Ignore frame detection errors
        }
        if (scanning) {
          requestAnimationFrame(detectLoop);
        }
      };
      requestAnimationFrame(detectLoop);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Camera permission denied or camera unavailable. You can type or scan SKU code manually.");
      setIsCameraActive(false);
    }
  };

  const stopCameraScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const verifySkuValue = (skuString) => {
    if (!skuString || !selectedOrder) return;
    const term = skuString.trim().toLowerCase();
    const items = selectedOrder.items || [];
    let matchedItem = null;

    for (const item of items) {
      const skuCode = getItemSku(item).toLowerCase();
      const pName = (item.productName || "").toLowerCase();
      if (term === skuCode || skuCode.includes(term) || pName.includes(term)) {
        matchedItem = item;
        break;
      }
    }

    if (matchedItem) {
      const skuCode = getItemSku(matchedItem);
      const itemKey = matchedItem.productId?._id || matchedItem.productId || matchedItem.productName;
      setVerifiedSkusMap(prev => ({ ...prev, [itemKey]: true }));
      setSkuScanAlert({
        type: "success",
        text: `✅ CAMERA MATCH CONFIRMED! Product "${matchedItem.productName}" (SKU: ${skuCode}) verified successfully.`
      });
      setScannedSkuInput("");
    } else {
      setSkuScanAlert({
        type: "error",
        text: `❌ CAMERA MISMATCH! Scanned Code "${skuString}" does not belong to this order.`
      });
    }
  };

  const handleOpenDrawer = (order) => {
    setSelectedOrder(order);
    setShippingCourier(order.shippingCourier || "");
    setTrackingNumber(order.trackingNumber || "");
    setPacketNumber(order.packetNumber || "");
    setScannedSkuInput("");
    setSkuScanAlert(null);
    
    // Pre-populate verified SKUs if order is ALREADY Processing, Shipped, or Delivered
    const initialMap = {};
    if (order.orderStatus !== "Pending" || order.isSkuVerified) {
      (order.items || []).forEach(item => {
        const itemKey = item.productId?._id || item.productId || item.productName;
        initialMap[itemKey] = true;
      });
    }
    setVerifiedSkusMap(initialMap);
    stopCameraScan();
    setIsDrawerOpen(true);
  };

  const handleScanSku = (e) => {
    e.preventDefault();
    if (!scannedSkuInput.trim() || !selectedOrder) return;

    const term = scannedSkuInput.trim().toLowerCase();
    const items = selectedOrder.items || [];
    let matchedItem = null;

    for (const item of items) {
      const skuCode = getItemSku(item).toLowerCase();
      const pName = (item.productName || "").toLowerCase();
      if (term === skuCode || skuCode.includes(term) || pName.includes(term)) {
        matchedItem = item;
        break;
      }
    }

    if (matchedItem) {
      const skuCode = getItemSku(matchedItem);
      const itemKey = matchedItem.productId?._id || matchedItem.productId || matchedItem.productName;
      setVerifiedSkusMap(prev => ({ ...prev, [itemKey]: true }));
      setSkuScanAlert({
        type: "success",
        text: `✅ MATCH CONFIRMED! Product "${matchedItem.productName}" (SKU: ${skuCode}) verified for packing.`
      });
      setScannedSkuInput("");
    } else {
      setSkuScanAlert({
        type: "error",
        text: `❌ WARNING: MISMATCH DETECTED! Scanned SKU "${scannedSkuInput}" does not belong to this order. Please pick the correct product!`
      });
    }
  };

  const handleVerifyAllSkus = () => {
    if (!selectedOrder) return;
    const newMap = {};
    (selectedOrder.items || []).forEach(item => {
      const itemKey = item.productId?._id || item.productId || item.productName;
      newMap[itemKey] = true;
    });
    setVerifiedSkusMap(newMap);
    setSkuScanAlert({
      type: "success",
      text: `🎉 ALL ${selectedOrder.items.length} Product SKUs verified for packing & dispatch!`
    });
  };

  const isAllItemsVerified = React.useMemo(() => {
    if (!selectedOrder || !selectedOrder.items || selectedOrder.items.length === 0) return false;
    if (selectedOrder.orderStatus !== "Pending" || selectedOrder.isSkuVerified) {
      return true;
    }
    return selectedOrder.items.every(item => {
      const itemKey = item.productId?._id || item.productId || item.productName;
      return Boolean(verifiedSkusMap[itemKey]);
    });
  }, [selectedOrder, verifiedSkusMap]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (!selectedOrder) return;
    if (newStatus === selectedOrder.orderStatus) return; // Prevent duplicate status error toast

    // Auto-generate Courier & Tracking Details if moving to Shipped/Delivered/Processing and not provided yet
    const finalCourier = shippingCourier.trim() || (["Shipped", "Delivered", "Processing"].includes(newStatus) ? "BlueDart Express" : "");
    const finalTracking = trackingNumber.trim() || (["Shipped", "Delivered", "Processing"].includes(newStatus) ? `RX${Math.floor(1000000000 + Math.random() * 9000000000)}` : "");
    const finalPacket = packetNumber.trim() || (["Shipped", "Delivered", "Processing"].includes(newStatus) ? `PKT-${Math.floor(1000 + Math.random() * 9000)}` : "");

    if (finalCourier && !shippingCourier) setShippingCourier(finalCourier);
    if (finalTracking && !trackingNumber) setTrackingNumber(finalTracking);
    if (finalPacket && !packetNumber) setPacketNumber(finalPacket);

    // 🔒 Step 2 Check: All Product SKUs Verified (Only blocks if order is still Pending and unverified)
    if (selectedOrder.orderStatus === "Pending" && ["Processing", "Shipped", "Delivered"].includes(newStatus) && !isAllItemsVerified) {
      alert(`🔒 ORDER LOCKED: Status cannot be moved to ${newStatus} until ALL product SKUs below are scanned & verified!`);
      return;
    }

    updateOrderStatus(selectedOrder.id, newStatus, {
      shippingCourier: finalCourier,
      trackingNumber: finalTracking,
      packetNumber: finalPacket
    });
    
    // Update local state to reflect the status change instantly in drawer
    setSelectedOrder((prev) => {
      const timestamp = new Date().toLocaleString("en-IN", { timeZone: "IST" });
      const cleanedTimestamp = timestamp.slice(0, 16).replace(",", "");
      
      let paymentStatus = prev.paymentStatus;
      if (newStatus === "Delivered" && prev.paymentMethod === "COD") {
        paymentStatus = "Paid";
      }
      
      return {
        ...prev,
        orderStatus: newStatus,
        paymentStatus,
        shippingCourier: finalCourier,
        trackingNumber: finalTracking,
        packetNumber: finalPacket,
        timeline: [...(prev.timeline || []), { status: newStatus, date: cleanedTimestamp }]
      };
    });
  };

  // Helper for formatting date as dd/mm/yyyy hh:MM:ss
  const formatDateAsDDMMYYYYHHMMSS = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // --- Download Sales Report as Excel ---
  const handleDownloadReport = () => {
    if (!orders || orders.length === 0) return;

    const rows = [];

    orders.forEach((order) => {
      const items = order.items || [];
      const tb = order.taxBreakdown || {};

      const buildRow = (item, idx) => {
        const product = item?.productId && typeof item.productId === "object" ? item.productId : {};
        const isFirst = idx === 0;

        return {
          "Sale Order Item Code": item?.saleOrderItemCode || "",
          "Display Order Code": order.orderCode || order.id || "",
          "Notification Email": order.customerEmail || "",
          "Notification Mobile": order.customerPhone || "",
          "COD": order.paymentMethod === "COD" ? "Yes" : "No",
          "Invoice Code": order.invoiceCode || "",
          "Invoice Code Date/Time": order.invoiceDate
            ? formatDateAsDDMMYYYYHHMMSS(order.invoiceDate)
            : "",
          "Shipping Address Name": order.shippingAddress?.name || "",
          "Shipping Address Line 1": order.shippingAddress?.line || "",
          "Shipping Address Line 2": order.shippingAddress?.line2 || "",
          "Shipping Address City": order.shippingAddress?.city || "",
          "Shipping Address State": order.shippingAddress?.state || "",
          "Shipping Address Country": order.shippingAddress?.country || "India",
          "Shipping Address Pincode": order.shippingAddress?.zip || "",
          "Billing Address Name": order.billingAddress?.name || order.shippingAddress?.name || "",
          "Billing Address Line 1": order.billingAddress?.line || order.shippingAddress?.line || "",
          "Billing Address Line 2": order.billingAddress?.line2 || "",
          "Billing Address City": order.billingAddress?.city || order.shippingAddress?.city || "",
          "Billing Address State": order.billingAddress?.state || order.shippingAddress?.state || "",
          "Billing Address Country": order.billingAddress?.country || order.shippingAddress?.country || "India",
          "Billing Address Pincode": order.billingAddress?.zip || order.shippingAddress?.zip || "",
          "Item SKU Code": product.sku || "",
          "Item Type Name": product.category?.name || item?.productName || "",
          "Item Type Size": product.size || product.weight || "",
          "Item Type Brand": product.brand || "",
          "Channel Name": order.channelName || "Website",
          "HSN Code": product.hsnCode || "",
          "MRP / Base Unit Price": item?.originalPrice || product.price || item?.price || 0,
          "Selling Price": item?.price || 0,
          "Total Item Price": (item?.price || 0) * (item?.quantity || 0),
          "Original Base Price Total": isFirst ? (order.originalSubtotal || order.subtotal || 0) : "",
          "Floating Campaign Discount": isFirst ? (order.floatingDiscountTotal || 0) : "",
          "Promo Coupon Discount": isFirst ? (order.discount || 0) : "",
          "Subtotal After Discount": isFirst ? (order.subtotal || 0) : "",
          "CGST": isFirst ? (tb.cgst || 0) : "",
          "IGST": isFirst ? (tb.igst || 0) : "",
          "SGST": isFirst ? (tb.sgst || 0) : "",
          "UTGST": isFirst ? (tb.utgst || 0) : "",
          "CESS": isFirst ? (tb.cess || 0) : "",
          "CGST Rate": isFirst ? (tb.cgstRate || 0) : "",
          "IGST Rate": isFirst ? (tb.igstRate || 0) : "",
          "SGST Rate": isFirst ? (tb.sgstRate || 0) : "",
          "UTGST Rate": isFirst ? (tb.utgstRate || 0) : "",
          "CESS Rate": isFirst ? (tb.cessRate || product.cessRate || 0) : "",
          "TCS Amount": isFirst ? (tb.tcsAmount || 0) : "",
          "Tax %": product.gst != null ? product.gst : 0,
          "Tax Value": isFirst ? (order.tax || 0) : "",
          "Voucher Code": isFirst ? (order.voucherCode || "") : "",
          "Shipping Charges": isFirst ? (order.shipping || 0) : "",
          "Shipping Method Charges": isFirst ? (order.shippingMethodCharges || 0) : "",
          "COD Service Charges": isFirst ? (order.codServiceCharge || 0) : "",
          "Gift Wrap Charges": isFirst ? (order.giftWrapCharges || 0) : "",
          "Packet Number": isFirst ? (order.packetNumber || "") : "",
          "Order Date as dd/mm/yyyy hh:MM:ss": formatDateAsDDMMYYYYHHMMSS(order.createdAt || order.date),
          "Sale Order Code": order.orderCode || order.id || "",
          "On Hold": order.orderStatus === "On Hold" ? "Yes" : "No",
          "Sale Order Status": order.orderStatus || "",
          "Shipping Courier": isFirst ? (order.shippingCourier || "") : "",
          "Tracking Number": isFirst ? (order.trackingNumber || "") : ""
        };
      };

      if (items.length === 0) {
        rows.push(buildRow(null, 0));
      } else {
        items.forEach((item, idx) => {
          rows.push(buildRow(item, idx));
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-fit column widths
    const colWidths = Object.keys(rows[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...rows.map((r) => String(r[key] ?? "").length)
      );
      return { wch: Math.min(maxLen + 2, 40) };
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

    const today = new Date().toISOString().slice(0, 10);
    const fileName = `Sales_Report_${today}.xlsx`;

    // Write workbook to array buffer and download as Blob for reliable .xlsx output
    const wbOut = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbOut], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Setup options for status filtering in table
  const filterOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Processing", label: "Processing" },
    { value: "On Hold", label: "On Hold" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  // Table Columns
  const columns = [
    {
      key: "displayOrderCode",
      header: "Order ID",
      render: (row) => {
        const code = row.orderCode || (row.id ? `RS_${String(row.id).slice(-4).toUpperCase()}` : "RS_2410");
        return (
          <span className="font-mono font-extrabold text-primary text-xs tracking-wider" title={row.id}>
            {code}
          </span>
        );
      }
    },
    {
      key: "items",
      header: "Items Ordered",
      render: (row) => {
        const items = row.items || [];
        if (items.length === 0) {
          return <span className="text-xs text-charcoal-light">—</span>;
        }
        const [first, ...rest] = items;
        return (
          <div className="flex items-center gap-2">
            <img
              src={getAdminImageUrl(first?.image)}
              alt={first?.productName || "Item"}
              onError={handleAdminImageError}
              className="w-9 h-9 rounded-lg object-cover border border-primary/5 shadow-xs shrink-0"
            />
            <div>
              <p className="text-xs font-semibold text-charcoal">{first.productName}</p>
              {rest.length > 0 && (
                <span className="text-[10px] text-charcoal-light font-bold">
                  +{rest.length} more item{rest.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: "customerName",
      header: "Customer",
      render: (row) => (
        <div>
          <p className="font-semibold text-charcoal text-sm">{row.customerName}</p>
          <span className="text-[10px] text-charcoal-light font-medium">{row.customerEmail}</span>
        </div>
      )
    },
    {
      key: "date",
      header: "Date Placed",
      render: (row) => <span className="text-xs text-charcoal-light font-semibold">{row.date}</span>
    },
    {
      key: "qty",
      header: "Qty",
      render: (row) => {
        const totalQty = (row.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
        return <span className="text-xs font-bold text-charcoal">{totalQty}</span>;
      }
    },
    {
      key: "shippingCity",
      header: "Ship To",
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-charcoal block">{row.shippingAddress?.city || "—"}</span>
          <span className="text-[10px] text-charcoal-light font-medium">{row.shippingAddress?.state || ""}</span>
        </div>
      )
    },
    {
      key: "total",
      header: "Total Value",
      render: (row) => (
        <div>
          <span className="font-bold text-primary block">{formatINR(row.total)}</span>
          <span className="text-[10px] text-charcoal-light font-medium">{row.paymentMethod}</span>
        </div>
      )
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (row) => getPaymentStatusBadge(row.paymentStatus)
    },
    {
      key: "orderStatus",
      header: "Status",
      render: (row) => getStatusBadge(row.orderStatus)
    }
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Order Management
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Track customer transactions, update shipping fulfillment progress, and audit payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsPickListOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-display font-bold text-sm shadow-md transition-all duration-200 cursor-pointer"
          >
            📋 Generate Pick List ({pendingOrders.length} Pending)
          </button>

          <button
            onClick={handleDownloadReport}
            disabled={!orders || orders.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-secondary rounded-lg font-display font-bold text-sm shadow-md hover:bg-primary-light transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} /> Download Sales Report
          </button>
        </div>
      </div>

      {/* Orders Data Table */}
      <DataTable
        columns={columns}
        data={orders}
        searchKey="id"
        searchPlaceholder="Search order ID (e.g. RS_2410)..."
        filterKey="orderStatus"
        filterPlaceholder="All Order Statuses"
        filterOptions={filterOptions}
        renderActions={(row) => {
          const canPrintInvoice = ["Processing", "Shipped", "Delivered"].includes(row.orderStatus);
          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleOpenDrawer(row)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/10 text-xs font-bold text-primary hover:bg-primary/5 hover:border-primary transition-all cursor-pointer"
                title="Inspect Order"
              >
                <Eye size={12} /> Inspect
              </button>
              {canPrintInvoice && (
                <button
                  onClick={() => setPrintModalOrder(row)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-primary text-xs font-bold hover:bg-secondary/80 shadow-xs transition-all cursor-pointer"
                  title="Print Tax Invoice & Shipping Label"
                >
                  <Printer size={12} /> Invoice
                </button>
              )}
            </div>
          );
        }}
      />

      {/* Order Slide-over Inspect Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Inspect Order Details: ${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Action Bar: Status Updater */}
            <div className="bg-background/80 border border-primary/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">Update Order Progress</p>
                  {isAllItemsVerified ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9.5px] font-bold rounded-full">
                      🔓 SKU VERIFIED & UNLOCKED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[9.5px] font-bold rounded-full">
                      🔒 SKU SCAN REQUIRED BEFORE PROCESSING
                    </span>
                  )}
                </div>
                <p className="text-xs text-charcoal-light font-medium mt-0.5">
                  {isAllItemsVerified
                    ? "All product SKUs verified. You can update status to Processing or Shipped."
                    : "🔒 Order Locked: Enter Fulfillment details & Scan SKU below to unlock status transition."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedOrder.orderStatus}
                  onChange={handleStatusChange}
                  className="px-3 py-1.5 border border-primary/10 rounded-lg text-xs font-bold bg-white text-primary focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing" disabled={!isAllItemsVerified}>Processing {!isAllItemsVerified ? "(🔒 Locked)" : ""}</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Shipped" disabled={!isAllItemsVerified}>Shipped {!isAllItemsVerified ? "(🔒 Locked)" : ""}</option>
                  <option value="Delivered" disabled={!isAllItemsVerified}>Delivered {!isAllItemsVerified ? "(🔒 Locked)" : ""}</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Courier & Tracking details */}
            <div className="bg-background/80 border border-primary/5 p-4 rounded-xl flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">Fulfillment Details</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-charcoal-light font-medium block mb-1">Courier</label>
                  <input type="text" value={shippingCourier} onChange={(e) => setShippingCourier(e.target.value)} className="w-full px-3 py-1.5 border border-primary/10 rounded-lg text-xs bg-white text-primary focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary" placeholder="e.g. BlueDart" />
                </div>
                <div>
                  <label className="text-xs text-charcoal-light font-medium block mb-1">Tracking No.</label>
                  <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full px-3 py-1.5 border border-primary/10 rounded-lg text-xs bg-white text-primary focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary" placeholder="e.g. 123456789" />
                </div>
                <div>
                  <label className="text-xs text-charcoal-light font-medium block mb-1">Packet No.</label>
                  <input type="text" value={packetNumber} onChange={(e) => setPacketNumber(e.target.value)} className="w-full px-3 py-1.5 border border-primary/10 rounded-lg text-xs bg-white text-primary focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary" placeholder="e.g. PKT-001" />
                </div>
              </div>
              <button 
                onClick={() => {
                  if (selectedOrder) {
                    updateOrderStatus(selectedOrder.id, selectedOrder.orderStatus, {
                      shippingCourier,
                      trackingNumber,
                      packetNumber
                    });
                  }
                }}
                className="mt-2 self-end px-4 py-1.5 bg-primary text-secondary rounded-lg font-bold text-xs hover:bg-primary/90 transition-colors"
              >
                Save Details
              </button>
            </div>

            {/* Core Info panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Payment Box */}
              <div className="bg-white border border-primary/5 p-4 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <CreditCard size={14} className="text-secondary" />
                  <span>Payment Detail</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-charcoal-light font-medium">
                    <span>Method:</span>
                    <span className="font-bold text-charcoal">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-light font-medium">
                    <span>Status:</span>
                    <span>{getPaymentStatusBadge(selectedOrder.paymentStatus)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Box */}
              <div className="bg-white border border-primary/5 p-4 rounded-xl space-y-2.5 md:col-span-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <MapPin size={14} className="text-secondary" />
                  <span>Shipping Address</span>
                </div>
                <p className="text-xs font-semibold text-charcoal leading-relaxed">
                  {selectedOrder.shippingAddress.line}, {selectedOrder.shippingAddress.city},{" "}
                  {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zip}
                </p>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Customer Contact Profile</h4>
              <div className="bg-white border border-primary/5 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-charcoal-light font-semibold block">Full Name</span>
                  <span className="text-primary font-bold text-sm block mt-0.5">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-charcoal-light font-semibold block">Email Address</span>
                  <span className="text-primary font-semibold block mt-0.5">{selectedOrder.customerEmail}</span>
                </div>
                <div>
                  <span className="text-charcoal-light font-semibold block">Phone Number</span>
                  <span className="text-primary font-semibold block mt-0.5">{selectedOrder.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Warehouse Barcode / SKU Packing Audit Box */}
            {selectedOrder.orderStatus === "Pending" ? (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📦 Warehouse Packing Scan Audit</span>
                      <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full text-[9.5px] font-bold">Prevent Wrong Dispatch</span>
                    </h4>
                    <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                      Scan product barcode or enter SKU code to verify item before marking Shipped.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleScanSku} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={scannedSkuInput}
                    onChange={(e) => setScannedSkuInput(e.target.value)}
                    placeholder="Scan product barcode / type SKU code (e.g. RS-PIC-9013)..."
                    className="flex-1 px-3.5 py-2 border border-amber-500/30 rounded-lg text-xs bg-white text-primary font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none px-4 py-2 bg-primary text-secondary rounded-lg font-bold text-xs shadow-xs hover:bg-primary-light transition-all cursor-pointer"
                    >
                      Verify SKU
                    </button>

                    <button
                      type="button"
                      onClick={isCameraActive ? stopCameraScan : startCameraScan}
                      className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 ${
                        isCameraActive ? "bg-rose-600 text-white animate-pulse" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      <Camera size={14} />
                      <span>{isCameraActive ? "Stop Camera ✕" : "📷 Scan with Camera"}</span>
                    </button>
                  </div>
                </form>

                {/* Live WebCam / Mobile Camera Viewfinder Stream */}
                {isCameraActive && (
                  <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 bg-black aspect-video max-w-md mx-auto shadow-lg">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Laser Scanning Animation Line Overlay */}
                    <div className="absolute inset-0 border-2 border-emerald-400/50 flex flex-col justify-between p-4 pointer-events-none">
                      <div className="flex justify-between">
                        <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400"></span>
                        <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400"></span>
                      </div>
                      <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></div>
                      <div className="flex justify-between">
                        <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400"></span>
                        <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400"></span>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-mono font-bold">
                      🔴 LIVE CAMERA SCANNING... Point barcode to lens
                    </div>
                  </div>
                )}

                {skuScanAlert && (
                  <div className={`p-2.5 rounded-lg text-xs font-bold ${
                    skuScanAlert.type === "success"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300 animate-shake"
                  }`}>
                    {skuScanAlert.text}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                      Warehouse Packing Audit Verified
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                      All product SKUs were successfully scanned & verified before moving to <span className="font-bold">{selectedOrder.orderStatus}</span>.
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-200 text-emerald-950 px-3 py-1 rounded-full text-xs font-extrabold font-mono shrink-0">
                  {selectedOrder.orderStatus.toUpperCase()}
                </span>
              </div>
            )}

            {/* Products grid */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Order Items List</h4>
              <div className="bg-white border border-primary/5 rounded-xl overflow-hidden">
                <div className="divide-y divide-primary/5">
                  {selectedOrder.items.map((item) => {
                    const itemSku = getItemSku(item);
                    const itemKey = item.productId?._id || item.productId || item.productName;
                    const isVerified = Boolean(verifiedSkusMap[itemKey]);

                    const itemOriginalPrice = item.originalPrice || item.price;
                    const isSampleProduct = item.isSample || item.price === 0 || (item.productName || '').toLowerCase().includes('sample');
                    const hasOffer = !isSampleProduct && (itemOriginalPrice > item.price || item.hasFloatingOffer);

                    return (
                      <div key={itemKey} className="p-4 flex items-center justify-between gap-3 hover:bg-background/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAdminImageUrl(item?.image)}
                            alt={item?.productName || "Item"}
                            onError={handleAdminImageError}
                            className="w-12 h-12 rounded-lg border border-primary/5 object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-primary">{item.productName}</p>
                              <span className="bg-slate-100 border border-slate-300 text-slate-800 font-mono text-[9.5px] font-extrabold px-2 py-0.5 rounded">
                                SKU: {itemSku}
                              </span>
                              {isSampleProduct ? (
                                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                  🎁 Free Sample Add-on
                                </span>
                              ) : hasOffer ? (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                  ✨ Floating Offer
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[10.5px] text-charcoal-light font-semibold mt-1">
                              Price: {isSampleProduct ? (
                                <span className="text-emerald-700 font-bold">FREE (₹0)</span>
                              ) : (
                                <>
                                  {hasOffer && <span className="line-through text-charcoal-light/70 mr-1.5">{formatINR(itemOriginalPrice)}</span>}
                                  <span className="text-primary font-bold">{formatINR(item.price)}</span>
                                </>
                              )} &times; {item.quantity} units
                            </p>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="text-xs font-extrabold text-primary block">
                            {formatINR(item.price * item.quantity)}
                          </span>
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-bold rounded-md">
                              ✅ VERIFIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9.5px] font-bold rounded-md">
                              🔍 PENDING SCAN
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal calculations */}
                {(() => {
                  const floatingSavings = Number(selectedOrder.floatingDiscountTotal || 0);
                  const baseSubtotal = Number(selectedOrder.originalSubtotal) || (selectedOrder.subtotal + floatingSavings);

                  return (
                    <div className="bg-background/30 p-5 border-t border-primary/5 text-xs space-y-2">
                      <div className="flex justify-between text-charcoal-light font-medium">
                        <span>Items Original Base Price</span>
                        <span>{formatINR(baseSubtotal)}</span>
                      </div>

                      {floatingSavings > 0 && (
                        <div className="flex justify-between items-center text-amber-950 font-bold bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-300 my-1">
                          <span className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded text-[10px] font-black uppercase tracking-wider">
                              ✨ FLOATING CAMPAIGN OFFER
                            </span>
                            <span>Direct Category Discount</span>
                          </span>
                          <span className="text-amber-900 font-extrabold">-{formatINR(floatingSavings)}</span>
                        </div>
                      )}

                      {(selectedOrder.couponCode || Number(selectedOrder.discount) > 0) && (
                        <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/80 my-1">
                          <span className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black uppercase tracking-wider">
                              🎫 PROMO COUPON
                            </span>
                            <span>{selectedOrder.couponCode ? selectedOrder.couponCode : 'Applied'}</span>
                          </span>
                          <span className="text-emerald-800 font-extrabold">-{formatINR(selectedOrder.discount || 0)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-charcoal-light font-semibold pt-1 border-t border-primary/5">
                        <span>Subtotal After Discount</span>
                        <span>{formatINR(selectedOrder.subtotal)}</span>
                      </div>

                      <div className="flex justify-between text-charcoal-light font-medium">
                        <span>GST (5% tax rate)</span>
                        <span>{formatINR(selectedOrder.tax)}</span>
                      </div>
                      <div className="flex justify-between text-charcoal-light font-medium">
                        <span>Shipping fee</span>
                        <span>{formatINR(selectedOrder.shipping)}</span>
                      </div>
                      <div className="flex justify-between text-primary font-bold text-sm border-t border-primary/5 pt-2.5 mt-2.5">
                        <span>Grand Total Paid</span>
                        <span className="text-emerald-700 font-extrabold">{formatINR(selectedOrder.total)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Tracking Timeline logs</h4>
                {["Processing", "Shipped", "Delivered"].includes(selectedOrder.orderStatus) && (
                  <button
                    onClick={() => setPrintModalOrder(selectedOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-primary font-bold text-xs rounded-lg shadow-xs hover:bg-secondary/80 transition-all cursor-pointer"
                  >
                    <Printer size={14} /> Print Tax Invoice & Label
                  </button>
                )}
              </div>
              <div className="bg-white border border-primary/5 rounded-xl p-5">
                <div className="relative border-l border-primary/10 ml-2.5 space-y-4 py-1.5">
                  {selectedOrder.timeline.map((log, index) => (
                    <div key={index} className="relative pl-6">
                      {/* Timeline dot */}
                      <span className="absolute -left-1.5 top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary border-2 border-white ring-2 ring-primary/10" />
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-xs font-bold text-primary">{log.status}</span>
                        <span className="text-[10px] text-charcoal-light font-semibold">{log.date}</span>
                      </div>
                      <p className="text-[10px] text-charcoal-light font-semibold mt-0.5">
                        Order marked as {log.status} by admin panel.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* --- Printable Tax Invoice & Shipping Label Modal --- */}
      {printModalOrder && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          {/* Printable Outer Container */}
          <div className="bg-slate-100 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col border border-primary/20">
            {/* Modal Top Controls (Sticky Header, Hidden during print) */}
            <div className="bg-primary text-white p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden border-b border-white/10 shadow-md">
              <div className="flex items-center gap-2">
                <Printer className="text-secondary" size={20} />
                <h3 className="font-bold text-base font-display">Print Document Preview</h3>
              </div>

              {/* Print Mode Selector Tabs */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPrintMode("all")}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    printMode === "all" ? "bg-secondary text-primary shadow-xs" : "text-white/80 hover:text-white"
                  }`}
                >
                  📑 Both (Invoice + Label)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintMode("invoice")}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    printMode === "invoice" ? "bg-secondary text-primary shadow-xs" : "text-white/80 hover:text-white"
                  }`}
                >
                  🧾 Invoice Only
                </button>
                <button
                  type="button"
                  onClick={() => setPrintMode("label")}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    printMode === "label" ? "bg-secondary text-primary shadow-xs" : "text-white/80 hover:text-white"
                  }`}
                >
                  🏷️ Label Sticker Only
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-secondary text-primary font-bold text-xs rounded-lg hover:bg-secondary/90 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={14} /> Print Selection
                </button>
                <button
                  onClick={() => setPrintModalOrder(null)}
                  className="px-3 py-1.5 bg-white/10 text-white font-bold text-xs rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
            </div>

            {/* Scrollable Printable Document Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/60 flex justify-center">
              {/* Tax Invoice & Shipping Label Document Sheet */}
              <div id="printable-tax-invoice" className="p-6 sm:p-8 text-black bg-white font-sans text-xs space-y-4 shadow-xl rounded-xl w-full max-w-3xl">
                
                {/* --- TAX INVOICE SECTION (Printed when printMode is 'all' or 'invoice') --- */}
                {printMode !== "label" && (
                  <div className="border-2 border-black p-0 bg-white font-sans text-xs text-black space-y-0 shadow-xs">
                    
                    {/* Top Bar: Title & QR Code */}
                    <div className="flex justify-between items-center p-2.5 border-b border-black">
                      <div className="flex-1 text-center font-bold text-sm tracking-wider uppercase font-serif">
                        Tax Invoice
                      </div>
                      {/* Simulated QR Code graphic */}
                      <div className="w-12 h-12 border border-black p-1 flex items-center justify-center font-mono text-[7px] bg-white">
                        <div className="grid grid-cols-3 gap-0.5 w-full h-full bg-black p-0.5">
                          <div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div>
                          <div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div>
                          <div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div>
                        </div>
                      </div>
                    </div>

                    {/* Row 1: 3 Columns (Sender | Invoice Code & Barcodes | Invoice Date & Payment) */}
                    <div className="grid grid-cols-3 border-b border-black divide-x divide-black text-[10.5px]">
                      {/* Sender Box */}
                      <div className="p-2.5 space-y-0.5">
                        <p className="font-extrabold uppercase text-[9.5px] text-gray-700">Sender</p>
                        <p className="font-black text-xs text-black">VRINDESHA PRIVATE LIMITED</p>
                        <p className="font-bold text-gray-900">ReetSutra</p>
                        <p className="text-gray-800 leading-tight">Plot 42, Main Heritage Road, Patna, Bihar - 800001, India</p>
                        <p className="text-gray-800">Ph No: +91 73786 47099</p>
                        <p className="text-gray-800 font-bold">GSTIN: 10AABCR1234F1Z5</p>
                        <p className="text-gray-800">PAN No: AADCH9716L</p>
                      </div>

                      {/* Invoice Code & Barcodes Box */}
                      <div className="p-2.5 space-y-2 font-mono text-center">
                        <div>
                          <p className="text-[9.5px] font-sans font-bold text-gray-700 text-left">Invoice Code:</p>
                          <p className="font-black text-xs text-black uppercase">{printModalOrder.invoiceCode || `INV_RS_${printModalOrder.id}`}</p>
                          <div className="bg-black text-white text-[8.5px] py-0.5 mt-0.5 font-black tracking-widest">
                            ||||||| | ||||| |||| ||| |||||||
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-gray-300">
                          <p className="text-[9.5px] font-sans font-bold text-gray-700 text-left">Order No: #{printModalOrder.orderCode || printModalOrder.id}</p>
                          <p className="text-[9.5px] font-sans text-gray-600 text-left">Order Date: {printModalOrder.date}</p>
                          <div className="bg-black text-white text-[8.5px] py-0.5 mt-0.5 font-black tracking-widest">
                            |||||||| |||| ||||| |||||||
                          </div>
                        </div>
                      </div>

                      {/* Invoice Date & Payment Mode Box */}
                      <div className="p-2.5 space-y-1.5 text-[10px]">
                        <div>
                          <span className="text-gray-600 font-bold block text-[9.5px]">Invoice Date</span>
                          <span className="font-extrabold text-black">{printModalOrder.invoiceDate ? formatDateAsDDMMYYYYHHMMSS(printModalOrder.invoiceDate) : printModalOrder.date}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-bold block text-[9.5px]">Portal</span>
                          <span className="font-extrabold text-black uppercase">REETSUTRA_WEBSITE</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-bold block text-[9.5px]">Payment Mode</span>
                          <span className="font-black text-black uppercase bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 inline-block">{printModalOrder.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-bold block text-[9.5px]">Transaction Mode</span>
                          <span className="font-mono text-[9.5px] font-bold text-black">TXN{String(printModalOrder.id).slice(-8)} ({printModalOrder.paymentMethod})</span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: 3 Columns (Bill To | Ship To | Dispatch Through) */}
                    <div className="grid grid-cols-3 border-b border-black divide-x divide-black text-[10.5px]">
                      {/* Bill To */}
                      <div className="p-2.5 space-y-0.5">
                        <p className="font-extrabold uppercase text-[9.5px] text-gray-700">Bill To:</p>
                        <p className="font-black text-xs text-black uppercase">
                          {(printModalOrder.customerName && printModalOrder.customerName.length > 2) ? printModalOrder.customerName : (printModalOrder.shippingAddress?.name || printModalOrder.customerName || "Nitesh Pawar")}
                        </p>
                        <p className="text-gray-800 leading-tight">
                          {printModalOrder.shippingAddress?.line} {printModalOrder.shippingAddress?.line2 || ""}
                        </p>
                        <p className="text-gray-800 font-bold">
                          {printModalOrder.shippingAddress?.city}, {printModalOrder.shippingAddress?.state} - {printModalOrder.shippingAddress?.zip}, India
                        </p>
                        <p className="text-gray-800">T: {printModalOrder.customerPhone}</p>
                        <p className="text-gray-800 font-bold">GSTIN :</p>
                      </div>

                      {/* Ship To */}
                      <div className="p-2.5 space-y-0.5">
                        <p className="font-extrabold uppercase text-[9.5px] text-gray-700">Ship To:</p>
                        <p className="font-black text-xs text-black uppercase">
                          {(printModalOrder.customerName && printModalOrder.customerName.length > 2) ? printModalOrder.customerName : (printModalOrder.shippingAddress?.name || printModalOrder.customerName || "Nitesh Pawar")}
                        </p>
                        <p className="text-gray-800 leading-tight">
                          {printModalOrder.shippingAddress?.line} {printModalOrder.shippingAddress?.line2 || ""}
                        </p>
                        <p className="text-gray-800 font-bold">
                          {printModalOrder.shippingAddress?.city}, {printModalOrder.shippingAddress?.state} - {printModalOrder.shippingAddress?.zip}, India
                        </p>
                        <p className="text-gray-800">T: {printModalOrder.customerPhone}</p>
                        <p className="text-gray-800 font-bold">GSTIN :</p>
                      </div>

                      {/* Dispatch Through & AWB */}
                      <div className="p-2.5 space-y-1">
                        <p className="font-extrabold uppercase text-[9.5px] text-gray-700">Dispatch Through</p>
                        <p className="font-black text-xs text-black uppercase">{printModalOrder.shippingCourier || 'DELHIVERY EXPRESS'}</p>
                        <p className="text-gray-700 font-bold text-[9.5px]">AWB No</p>
                        <p className="font-mono font-black text-xs text-black">{printModalOrder.trackingNumber || 'RX1819SR524288'}</p>
                        <div className="bg-black text-white text-[8.5px] py-0.5 font-black tracking-widest text-center font-mono">
                          ||||||| | ||||| |||| ||| |||||||
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Itemized Tax Table */}
                    <div className="border-b border-black overflow-hidden">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-gray-100 border-b border-black font-extrabold uppercase text-[9px]">
                            <th className="p-2 border-r border-black text-center w-8">Sl No.</th>
                            <th className="p-2 border-r border-black">Descriptions of Goods</th>
                            <th className="p-2 border-r border-black text-center">Part No. / HSN</th>
                            <th className="p-2 border-r border-black text-center">Qty</th>
                            <th className="p-2 border-r border-black text-right">Discount</th>
                            <th className="p-2 border-r border-black text-right">Taxable Value (INR)</th>
                            <th className="p-2 border-r border-black text-right">IGST/GST (INR)</th>
                            <th className="p-2 text-right">Amount (INR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300">
                          {printModalOrder.items.map((item, idx) => {
                            const qty = item.quantity || 1;
                            const totalPrice = item.price * qty;
                            const taxableVal = totalPrice / 1.05;
                            const totalGst = totalPrice - taxableVal;
                            const hsn = item.productName.toLowerCase().includes('ghee') ? '0405' : item.productName.toLowerCase().includes('makhana') ? '1904' : '2001';
                            const skuCode = item.sku || '8906087772040';

                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-2 border-r border-black text-center font-bold">{idx + 1}</td>
                                <td className="p-2 border-r border-black font-extrabold text-black">
                                  {item.productName}
                                </td>
                                <td className="p-2 border-r border-black text-center font-mono text-[9px]">
                                  <div className="font-bold">{skuCode}</div>
                                  <div className="text-gray-600">HSN: {hsn}</div>
                                </td>
                                <td className="p-2 border-r border-black text-center font-bold">{qty}</td>
                                <td className="p-2 border-r border-black text-right font-mono">0.00</td>
                                <td className="p-2 border-r border-black text-right font-mono">₹ {taxableVal.toFixed(2)}</td>
                                <td className="p-2 border-r border-black text-right font-mono">
                                  <div>₹ {totalGst.toFixed(2)}</div>
                                  <div className="text-[8.5px] text-gray-600">(5.0%)</div>
                                </td>
                                <td className="p-2 text-right font-black font-mono">₹ {totalPrice.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Table Totals Summary Bar */}
                      <div className="border-t border-black bg-gray-50 p-2.5 flex justify-between items-center text-[10.5px] font-mono">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-black">Total Invoice Value: ₹ {printModalOrder.subtotal.toFixed(2)}</p>
                          <p className="text-[9.5px] text-gray-600">@TCS Amount: 0.00</p>
                        </div>
                        <div className="flex items-center gap-4 font-black">
                          <span>Total Qty: {printModalOrder.items.reduce((s, i) => s + (i.quantity || 1), 0)}</span>
                          <span>Taxable: ₹ {(printModalOrder.subtotal / 1.05).toFixed(2)}</span>
                          <span>Tax: ₹ {(printModalOrder.subtotal - (printModalOrder.subtotal / 1.05)).toFixed(2)}</span>
                          <span className="text-sm bg-black text-white px-2.5 py-1 rounded font-bold">Total: {formatINR(printModalOrder.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Amount Chargeable in words & Declaration */}
                    <div className="grid grid-cols-3 border-b border-black divide-x divide-black text-[10px]">
                      <div className="col-span-2 p-2.5 space-y-1.5">
                        <div>
                          <p className="text-[9.5px] font-bold text-gray-600 uppercase">Amount Chargeable (in words)</p>
                          <p className="font-extrabold text-xs text-black capitalize">
                            Rupees {formatINR(printModalOrder.total).replace('₹', '')} Only
                          </p>
                        </div>
                        <p className="font-bold text-black text-[9.5px]">Tax is payable on reverse charge basis: No</p>
                        <div>
                          <p className="font-extrabold uppercase text-[9.5px]">Declaration</p>
                          <p className="text-gray-700 leading-tight text-[9px]">
                            1. The value of the discount has been distributed among the offer items for administrative and compliance purposes. 2. All Disputes are subject to Patna (10) jurisdiction only.
                          </p>
                        </div>
                        <p className="font-bold text-black text-[9px] font-mono">"Products not for resale"</p>
                      </div>

                      {/* Right Signatory Box */}
                      <div className="p-2.5 flex flex-col justify-between text-center font-mono">
                        <p className="font-black text-[9.5px] uppercase text-black">For Vrindesha Private Limited</p>
                        <div className="my-2 border border-dashed border-gray-400 p-2 bg-gray-50 rounded">
                          <p className="text-[8.5px] text-gray-500 italic">Digitally Signed Seal</p>
                          <p className="font-bold text-black text-xs uppercase mt-1">Authorised Signatory</p>
                        </div>
                        <p className="text-[9px] text-gray-600 font-bold">Authorised Signatory</p>
                      </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="p-2 flex justify-between items-center text-[9px] font-mono bg-gray-100 text-gray-700">
                      <span>Prepared By : Vrindesha Private Limited</span>
                      <span className="font-bold text-black">This is a computer generated Invoice</span>
                      <span>Powered By ReetSutra ERP</span>
                    </div>

                  </div>
                )}

                {/* --- SHIPPING LABEL SECTION (Printed when printMode is 'all' or 'label') --- */}
                {printMode !== "invoice" && (
                  <div className={`border-2 border-black p-0 bg-white font-sans text-xs text-black ${printMode === "all" ? "mt-6" : ""}`}>
                    
                    {/* Box 1: Ship To & Brand Logo Header */}
                    <div className="flex justify-between items-start p-3 border-b-2 border-black">
                      <div className="space-y-0.5 max-w-md">
                        <p className="font-extrabold text-sm text-black uppercase">Ship To</p>
                        <p className="font-black text-sm text-black italic capitalize">
                          {(printModalOrder.customerName && printModalOrder.customerName.length > 2) ? printModalOrder.customerName : (printModalOrder.shippingAddress?.name || printModalOrder.customerName || "Nitesh Pawar")}
                        </p>
                        <p className="text-black font-semibold text-xs leading-tight">
                          {printModalOrder.shippingAddress?.line} {printModalOrder.shippingAddress?.line2 || ""}
                        </p>
                        <p className="text-black font-bold text-xs">
                          {printModalOrder.shippingAddress?.city}, {printModalOrder.shippingAddress?.state} - {printModalOrder.shippingAddress?.zip}
                        </p>
                        <p className="text-black text-xs font-semibold">India</p>
                        <p className="text-black font-bold text-xs">T: {printModalOrder.customerPhone}</p>
                      </div>

                      {/* Brand Logo Header */}
                      <div className="text-right">
                        <h2 className="text-2xl font-extrabold font-serif tracking-normal text-black">ReetSutra</h2>
                        <p className="text-[9px] text-gray-700 font-mono font-bold uppercase tracking-widest">AUTHENTIC HERITAGE</p>
                      </div>
                    </div>

                    {/* Box 2: 2 Columns (Dimensions, Weight, Payment, Items | Courier & Barcode) */}
                    <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black text-[11px]">
                      {/* Left Column */}
                      <div className="p-3 space-y-1">
                        <p className="font-semibold text-gray-800">Dimensions: 20.50*14.50*7.00(cm)</p>
                        <p className="font-semibold text-gray-800">Weight: 0.45 kg</p>
                        <p className="font-bold text-black uppercase">Payment: {printModalOrder.paymentMethod === "COD" ? `COD (₹${printModalOrder.total})` : "PREPAID"}</p>
                        <p className="font-semibold text-black leading-tight pt-1">
                          Item(s) : {printModalOrder.items.map(i => `${i.productName} (x${i.quantity || 1})`).join(", ")}
                        </p>
                      </div>

                      {/* Right Column */}
                      <div className="p-3 space-y-1 font-mono text-left">
                        <p className="font-sans font-bold text-black text-xs">Courier: {printModalOrder.shippingCourier || 'BlueDart Express'}</p>
                        <div className="bg-black text-white text-[9px] font-black py-1.5 px-2 text-center tracking-widest">
                          ||||||| | ||||| |||| ||| ||||||| ||||||||
                        </div>
                        <p className="font-bold text-xs text-black pt-1">Awb: {printModalOrder.trackingNumber || 'RX1819SR524288'}</p>
                        <p className="font-bold text-xs text-black">Routing Code: <span className="font-black bg-gray-200 px-1.5 py-0.5 rounded">PAT,PATNA</span></p>
                      </div>
                    </div>

                    {/* Box 3: 2 Columns (Shipped By | Order # Barcode) */}
                    <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black text-[11px]">
                      {/* Left Column: Return Address */}
                      <div className="p-3 space-y-0.5">
                        <p className="font-extrabold text-black text-xs uppercase">Shipped By <span className="text-[10px] font-normal text-gray-700">(If undelivered, return to)</span></p>
                        <p className="font-black text-xs text-black italic">Vrindesha Private Limited</p>
                        <p className="text-gray-900 text-[10.5px] leading-tight">
                          ReetSutra, Plot 42, Main Heritage Road, Patna, Bihar - 800001, India
                        </p>
                        <p className="text-gray-900 font-bold text-[10px]">Support: care@reetsutra.com | +91 73786 47099</p>
                      </div>

                      {/* Right Column: Order # Barcode */}
                      <div className="p-3 space-y-1 font-mono text-left">
                        <p className="font-sans font-bold text-black text-xs">Order #: {printModalOrder.orderCode || printModalOrder.id}</p>
                        <div className="bg-black text-white text-[9px] font-black py-1.5 px-2 text-center tracking-widest">
                          |||||||| |||| ||||| ||||||| ||||||
                        </div>
                      </div>
                    </div>

                    {/* Box 4: Product Description & Compliance Footer */}
                    <div className="p-3 border-b-2 border-black space-y-1 text-[10.5px] font-mono">
                      <p className="font-sans font-bold text-black text-xs">
                        Product Description : <span className="font-semibold">{printModalOrder.items.map(i => `${i.productName} x ${i.quantity || 1} units`).join(", ")}</span>
                      </p>
                      <p className="font-bold text-black">
                        SKU : {printModalOrder.items[0]?.sku || 'RS-PIC-9013'} | QTY. : {printModalOrder.items.reduce((s, i) => s + (i.quantity || 1), 0)} | Total : Rs.{printModalOrder.total.toFixed(2)}
                      </p>
                      <p className="font-bold text-black">
                        Invoice No. :{printModalOrder.invoiceCode || `INV_RS_${printModalOrder.id}`} | Invoice Date :{printModalOrder.date}
                      </p>
                      <p className="font-bold text-black font-sans">
                        GSTIN :10AABCR1234F1Z5
                      </p>
                    </div>

                    {/* Box 5: Governance & Legal Return Disclaimer */}
                    <div className="p-2.5 border-b border-black text-[9.5px] text-gray-800 leading-tight">
                      All disputes are subject to Patna jurisdiction only. Goods once sold will only be taken back or exchanged as per the store's exchange/return policy.
                    </div>

                    {/* Box 6: Bottom Auto-Generated Disclaimer */}
                    <div className="p-2 flex justify-between items-center text-[9px] font-mono bg-gray-100 text-gray-800">
                      <span className="font-bold">THIS IS AN AUTO-GENERATED LABEL AND DOES NOT NEED SIGNATURE.</span>
                      <span className="font-extrabold text-black">Powered By: ReetSutra ERP</span>
                    </div>

                  </div>
                )}

                {/* Authorized Signatory Footer */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- WAREHOUSE PICK LIST MODAL --- */}
      {isPickListOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col border border-primary/20">
            
            {/* Modal Controls Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between shrink-0 print:hidden border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <div>
                  <h3 className="font-bold text-base font-display text-secondary">Warehouse Pick List Manifest</h3>
                  <p className="text-[11px] text-white/80">
                    Aggregated SKU list for all pending orders to pick from warehouse shelves.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-400 text-slate-900 font-extrabold text-xs rounded-lg hover:bg-amber-300 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={14} /> Print Pick List
                </button>
                <button
                  onClick={() => setIsPickListOpen(false)}
                  className="px-3.5 py-2 bg-white/10 text-white font-bold text-xs rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
            </div>

            {/* Scrollable Pick List Sheet */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/60 flex justify-center">
              <div id="printable-pick-list" className="p-6 sm:p-8 text-black bg-white font-sans text-xs space-y-6 shadow-xl rounded-xl w-full max-w-3xl border border-gray-300">
                
                {/* Summary Metrics Box */}
                <div className="grid grid-cols-3 gap-3 bg-white border border-black p-4 text-center rounded-lg shadow-2xs">
                  <div>
                    <span className="text-[10px] text-gray-700 uppercase font-extrabold tracking-wider block">PENDING ORDERS COUNT</span>
                    <span className="text-xl font-black text-black">{pendingOrders.length} Orders</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-700 uppercase font-extrabold tracking-wider block">TOTAL UNIQUE SKUS</span>
                    <span className="text-xl font-black text-black">{pickListSummary.length} Items</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-700 uppercase font-extrabold tracking-wider block">TOTAL ITEM UNITS TO PICK</span>
                    <span className="text-xl font-black text-amber-700">
                      {pickListSummary.reduce((sum, item) => sum + item.quantity, 0)} Units
                    </span>
                  </div>
                </div>

                {/* Section 1: Aggregated Shelf Picking Summary Table */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-black uppercase border-b border-black pb-1">
                    1. AGGREGATED SHELF PICKING SUMMARY (PICK TOTAL UNITS BELOW)
                  </h3>
                  
                  {pickListSummary.length > 0 ? (
                    <table className="w-full text-left border-2 border-black border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-black font-extrabold uppercase text-[10px]">
                          <th className="p-2.5 border-r border-black">PRODUCT NAME</th>
                          <th className="p-2.5 border-r border-black text-center">SKU / CODE</th>
                          <th className="p-2.5 border-r border-black text-center">WAREHOUSE BIN</th>
                          <th className="p-2.5 border-r border-black text-center text-sm font-black bg-amber-100/80">TOTAL QTY TO PICK</th>
                          <th className="p-2.5">ASSOCIATED ORDERS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black font-semibold">
                        {pickListSummary.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-2.5 border-r border-black font-extrabold text-black">
                              <div className="font-extrabold text-sm">{item.name}</div>
                              {(item.isBundle || (item.name || "").toLowerCase().includes("gift") || (item.name || "").toLowerCase().includes("combo")) && (
                                <div className="mt-1.5 text-[10px] text-amber-950 font-medium bg-amber-50 p-2 rounded border border-amber-300">
                                  <span className="font-black text-amber-950 block uppercase tracking-wider text-[9.5px] mb-1">
                                    🎁 INCLUDED HAMPER PRODUCTS & QUANTITIES TO PICK:
                                  </span>
                                  {item.bundleItems && item.bundleItems.length > 0 ? (
                                    <div className="space-y-1">
                                      {item.bundleItems.map((child, cIdx) => (
                                        <div key={cIdx} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-amber-200 text-[10.5px] font-bold text-black">
                                          <span>• {child.productName || "Product Item"} {child.sku ? `(${child.sku})` : ""}</span>
                                          <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-mono font-black text-xs">
                                            Qty: {(child.quantity || 1) * item.quantity}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-amber-200 text-[10.5px] font-bold text-black">
                                        <span>• Special Mango Pickle (SKU: RS-PIC-9013)</span>
                                        <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-mono font-black text-xs">
                                          Qty: {item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-2.5 border-r border-black text-center font-mono font-black">{item.sku}</td>
                            <td className="p-2.5 border-r border-black text-center font-mono text-[10px] text-gray-500">Main Warehouse / Bin A-1</td>
                            <td className="p-2.5 border-r border-black text-center font-black text-lg bg-amber-50 text-black">
                              {item.quantity}
                            </td>
                            <td className="p-2.5 font-mono text-[10px] text-gray-800 font-bold">
                              {item.orders.join(", ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center py-6 italic text-gray-500 border border-gray-300 rounded-lg">
                      No pending orders to pick at this time. All orders are fulfilled!
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print CSS Styling Rule */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-tax-invoice, #printable-tax-invoice *,
          #printable-pick-list, #printable-pick-list * {
            visibility: visible;
          }
          #printable-tax-invoice, #printable-pick-list {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15px;
          }
        }
      `}</style>
    </>
  );
};
export default Orders;
