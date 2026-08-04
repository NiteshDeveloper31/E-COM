import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  IndianRupee,
  ShoppingBasket,
  ArrowRight,
  Eye,
  AlertTriangle,
  Loader
} from "lucide-react";
import { useData } from "../context/DataContext";
import { StatCard } from "../components/StatCard";
import { SalesAreaChart } from "../components/ChartComponents";
import { Drawer } from "../components/Drawer";

export const Dashboard = () => {
  const { products, orders, customers, loading, dashboardStats } = useData();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const formatINR = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  // --- DYNAMIC CALCULATIONS ---

  // 1. Core KPIs
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const totalOrdersCount = orders.length;
  const totalCustomersCount = customers.length;
  const totalProductsCount = products.length;

  // 2. Business Health Averages
  const averageOrderValue = useMemo(() => {
    const validOrders = orders.filter((o) => o.orderStatus !== "Cancelled");
    if (validOrders.length === 0) return 0;
    const sum = validOrders.reduce((s, o) => s + o.total, 0);
    return Math.round(sum / validOrders.length);
  }, [orders]);

  // 3. Process dynamic monthly statistics for Area Chart
  const processedChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = months.map((name) => ({ name, revenue: 0, orders: 0 }));

    orders.forEach((order) => {
      if (order.orderStatus === "Cancelled") return;
      const date = new Date(order.createdAt || order.date);
      const monthIndex = date.getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex].revenue += order.total;
        monthlyData[monthIndex].orders += 1;
      }
    });

    // Return the months from Jan up to the current month (at least 6 months)
    const currentMonthIndex = new Date().getMonth();
    return monthlyData.slice(0, Math.max(6, currentMonthIndex + 1));
  }, [orders]);

  // 4. Calculate Top Products dynamically from purchases
  const topProductsList = useMemo(() => {
    const stats = {};
    orders.forEach((order) => {
      if (order.orderStatus === "Cancelled") return;
      order.items.forEach((item) => {
        const id = item.productId;
        if (!stats[id]) {
          stats[id] = {
            id,
            name: item.productName,
            price: item.price,
            image: item.image,
            sales: 0,
            revenue: 0
          };
        }
        stats[id].sales += item.quantity;
        stats[id].revenue += item.price * item.quantity;
      });
    });
    return Object.values(stats)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);
  }, [orders]);

  // 5. Recent 4 orders
  const recentOrders = useMemo(() => {
    return orders.slice(0, 4);
  }, [orders]);

  // Get status color styling
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
        className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
          styles[status] || "bg-charcoal/5 text-charcoal"
        }`}
      >
        {status}
      </span>
    );
  };

  const handleInspectOrder = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  // Find low stock items (stock <= 50)
  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.stock <= 50);
  }, [products]);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader size={32} className="animate-spin text-primary" />
        <p className="text-xs font-bold text-primary">Syncing live dashboard statistics...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display font-bold text-2xl text-primary leading-tight">
          Welcome back, Admin
        </h1>
        <p className="text-sm text-charcoal-light font-medium">
          Here is an overview of ReetSutra's live business performance today.
        </p>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={formatINR(totalRevenue)}
          icon={IndianRupee}
          description="Paid / Delivered totals"
        />
        <StatCard
          title="Total Orders"
          value={totalOrdersCount}
          icon={ShoppingBasket}
          description="Inbound transactions count"
        />
        <StatCard
          title="Registered Customers"
          value={totalCustomersCount}
          icon={Users}
          description="Active customer accounts"
        />
        <StatCard
          title="Total Products"
          value={totalProductsCount}
          icon={ShoppingBag}
          description="Items published in catalog"
        />
      </div>

      {/* Analytics Chart & Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-primary/10 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base text-primary">Sales Overview</h3>
              <p className="text-xs text-charcoal-light font-medium mt-0.5">Real-time revenue & order distributions</p>
            </div>
            {totalRevenue > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                <TrendingUp size={14} /> Active Sales recorded
              </span>
            )}
          </div>
          <SalesAreaChart data={processedChartData} />
        </div>

        {/* Quick Insights Card */}
        <div className="bg-white p-6 rounded-xl border border-primary/10 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-base text-primary">Business Health</h3>
            
            <div className="divide-y divide-primary/5 font-sans">
              <div className="py-3 flex justify-between items-center">
                <span className="text-xs text-charcoal-light font-semibold">Average Order Value</span>
                <span className="text-sm font-bold text-primary">{formatINR(averageOrderValue)}</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-xs text-charcoal-light font-semibold">Tax Collected (5%)</span>
                <span className="text-sm font-bold text-primary">
                  {formatINR(orders.reduce((sum, o) => sum + (o.tax || 0), 0))}
                </span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-xs text-charcoal-light font-semibold">Shipping Revenue</span>
                <span className="text-sm font-bold text-primary">
                  {formatINR(orders.reduce((sum, o) => sum + (o.shipping || 0), 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background/50 border border-primary/5 rounded-lg p-3.5 mt-4 space-y-2">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-secondary" />
              Inventory Alert
            </h4>
            {lowStockItems.length > 0 ? (
              <p className="text-[11px] text-charcoal-light font-medium">
                {lowStockItems.length} item(s) are running low on inventory:{" "}
                <strong>{lowStockItems.map((p) => p.name).join(", ")}</strong>.
              </p>
            ) : (
              <p className="text-[11px] text-charcoal-light font-medium">
                All products are well stocked. No low-inventory warnings.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-primary/10 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base text-primary">Recent Activity</h3>
              <p className="text-xs text-charcoal-light font-medium">Latest customer purchases across the portal</p>
            </div>
            <Link to="/orders" className="text-xs font-bold text-secondary hover:text-secondary-dark flex items-center gap-1">
              View All Orders <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 border-b border-primary/10">
                  <th className="px-6 py-2.5 text-xs font-semibold uppercase text-primary">Order ID</th>
                  <th className="px-6 py-2.5 text-xs font-semibold uppercase text-primary">Customer</th>
                  <th className="px-6 py-2.5 text-xs font-semibold uppercase text-primary">Total</th>
                  <th className="px-6 py-2.5 text-xs font-semibold uppercase text-primary">Status</th>
                  <th className="px-6 py-2.5 text-xs font-semibold uppercase text-primary text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-background/20 transition-colors">
                      <td className="px-6 py-3 text-xs font-bold text-primary">{order.id}</td>
                      <td className="px-6 py-3 text-xs text-charcoal-light font-semibold">{order.customerName || order.userId?.name}</td>
                      <td className="px-6 py-3 text-xs font-bold text-primary">{formatINR(order.total)}</td>
                      <td className="px-6 py-3">{getStatusBadge(order.orderStatus)}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handleInspectOrder(order)}
                          className="p-1 rounded-md text-charcoal hover:text-secondary hover:bg-primary/5 transition-all cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-charcoal-light text-xs font-semibold">
                      No customer transactions placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top-Selling Products */}
        <div className="bg-white p-6 rounded-xl border border-primary/10 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base text-primary">Top Products</h3>
              <p className="text-xs text-charcoal-light font-medium">Bestselling traditional foods</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-secondary hover:text-secondary-dark flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-80 pr-1">
            {topProductsList.length > 0 ? (
              topProductsList.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-background/30 transition-all">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-md border border-primary/5 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-primary">{prod.name}</h4>
                      <span className="text-[10px] text-charcoal-light font-semibold">Sales: {prod.sales} units</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">{formatINR(prod.revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-12 text-xs font-semibold text-charcoal-light">
                No purchases compiled yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over order inspector drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Order Details: ${selectedOrder?.id}`}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status overview */}
            <div className="flex items-center justify-between bg-background/50 border border-primary/5 rounded-xl p-4">
              <div>
                <p className="text-[10px] font-bold text-charcoal-light uppercase">Status</p>
                <div className="mt-1">{getStatusBadge(selectedOrder.orderStatus)}</div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-charcoal-light uppercase">Total Bill</p>
                <p className="text-lg font-bold text-primary mt-0.5">{formatINR(selectedOrder.total)}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Customer Information</h4>
              <div className="bg-white border border-primary/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-charcoal-light font-semibold">Name:</span>
                  <span className="text-primary font-bold">{selectedOrder.customerName || selectedOrder.userId?.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-charcoal-light font-semibold">Email:</span>
                  <span className="text-primary font-semibold">{selectedOrder.customerEmail || selectedOrder.userId?.email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-charcoal-light font-semibold">Phone:</span>
                  <span className="text-primary font-semibold">{selectedOrder.customerPhone || "+91 99999 88888"}</span>
                </div>
                <div className="border-t border-primary/5 my-2 pt-2">
                  <p className="text-[10px] font-bold text-charcoal-light uppercase">Shipping Address</p>
                  <p className="text-xs font-semibold text-charcoal mt-1 leading-relaxed">
                    {selectedOrder.shippingAddress.line}, {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zip}
                  </p>
                </div>
              </div>
            </div>

            {/* Products Purchased */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Items Ordered</h4>
              <div className="bg-white border border-primary/5 rounded-xl overflow-hidden">
                <div className="divide-y divide-primary/5">
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 rounded-md border border-primary/5 object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-primary">{item.productName}</p>
                          <p className="text-[10px] text-charcoal-light font-semibold">
                            {formatINR(item.price)} &times; {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Cost Summary */}
                <div className="bg-background/30 p-4 border-t border-primary/5 text-xs space-y-1.5">
                  <div className="flex justify-between text-charcoal-light font-medium">
                    <span>Subtotal</span>
                    <span>{formatINR(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-light font-medium">
                    <span>GST (5%)</span>
                    <span>{formatINR(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-light font-medium">
                    <span>Shipping Charges</span>
                    <span>{formatINR(selectedOrder.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-primary font-bold border-t border-primary/5 pt-2 mt-2">
                    <span>Total Amount</span>
                    <span>{formatINR(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Logistics details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-primary/5 rounded-xl p-3.5 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-charcoal-light uppercase">Payment Method</span>
                <p className="font-bold text-primary">{selectedOrder.paymentMethod}</p>
                <span className={`text-[10px] font-bold ${selectedOrder.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <div className="bg-white border border-primary/5 rounded-xl p-3.5 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-charcoal-light uppercase">Order Date</span>
                <p className="font-bold text-primary">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                <span className="text-[10px] text-charcoal-light font-semibold">Standard Delivery</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};
export default Dashboard;
