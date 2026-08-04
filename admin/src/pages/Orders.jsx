import React, { useState } from "react";
import { Eye, Edit, Clock, MapPin, CreditCard, ShoppingBag, AlertTriangle } from "lucide-react";
import { useData } from "../context/DataContext";
import { DataTable } from "../components/DataTable";
import { Drawer } from "../components/Drawer";

export const Orders = () => {
  const { orders, updateOrderStatus } = useData();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const handleOpenDrawer = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, newStatus);
      
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
          timeline: [...prev.timeline, { status: newStatus, date: cleanedTimestamp }]
        };
      });
    }
  };

  // Setup options for status filtering in table
  const filterOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Processing", label: "Processing" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  // Table Columns
  const columns = [
    {
      key: "id",
      header: "Order ID",
      render: (row) => (
        <span className="font-display font-bold text-primary" title={row.id}>
          &hellip;{String(row.id).slice(-10)}
        </span>
      )
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
              src={first.image}
              alt={first.productName}
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
      <div>
        <h1 className="font-display font-bold text-2xl text-primary leading-tight">
          Order Management
        </h1>
        <p className="text-sm text-charcoal-light font-medium">
          Track customer transactions, update shipping fulfillment progress, and audit payments.
        </p>
      </div>

      {/* Orders Data Table */}
      <DataTable
        columns={columns}
        data={orders}
        searchKey="id"
        searchPlaceholder="Search order ID (e.g. ORD-9281)..."
        filterKey="orderStatus"
        filterPlaceholder="All Order Statuses"
        filterOptions={filterOptions}
        renderActions={(row) => (
          <button
            onClick={() => handleOpenDrawer(row)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/10 text-xs font-bold text-primary hover:bg-primary/5 hover:border-primary transition-all cursor-pointer"
          >
            <Eye size={12} /> Inspect
          </button>
        )}
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
                <p className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">Update Order Progress</p>
                <p className="text-xs text-charcoal-light font-medium mt-0.5">Transition order through standard SaaS lifecycle.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedOrder.orderStatus}
                  onChange={handleStatusChange}
                  className="px-3 py-1.5 border border-primary/10 rounded-lg text-xs font-bold bg-white text-primary focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
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

            {/* Products grid */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Order Items List</h4>
              <div className="bg-white border border-primary/5 rounded-xl overflow-hidden">
                <div className="divide-y divide-primary/5">
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="p-4 flex items-center justify-between gap-3 hover:bg-background/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-11 h-11 rounded-lg border border-primary/5 object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-primary">{item.productName}</p>
                          <p className="text-[10px] text-charcoal-light font-semibold mt-0.5">
                            Price: {formatINR(item.price)} &times; {item.quantity} units
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal calculations */}
                <div className="bg-background/30 p-5 border-t border-primary/5 text-xs space-y-1.5">
                  <div className="flex justify-between text-charcoal-light font-medium">
                    <span>Subtotal</span>
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
                    <span>Grand Total</span>
                    <span>{formatINR(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Tracking Timeline logs</h4>
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
    </>
  );
};
export default Orders;
