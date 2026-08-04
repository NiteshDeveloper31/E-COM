import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import {
  User,
  ShoppingBag,
  MapPin,
  Truck,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Package,
  Calendar,
  XCircle,
  Pencil,
  Star
} from 'lucide-react';

export default function Profile() {
  const { user, addresses, orders, updateProfile, deleteAddress, addAddress, updateAddress, setDefaultAddress, updateOrderStatus } = useReetSutra();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // Determine current active subview based on URL path
  const path = location.pathname;
  let activeTab = 'details'; // 'details' | 'orders' | 'addresses' | 'tracking'
  if (path.includes('/profile/orders')) activeTab = 'orders';
  else if (path.includes('/profile/addresses')) activeTab = 'addresses';
  else if (path.includes('/profile/track-order')) activeTab = 'tracking';

  // State for editing profile
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [isSavedText, setIsSavedText] = useState(false);

  // State for adding address
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: '',
    type: 'Home',
    street: '',
    city: '',
    state: 'Bihar',
    zip: '',
    phone: ''
  });

  // State for editing an existing address
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [editAddr, setEditAddr] = useState({
    name: '',
    type: 'Home',
    street: '',
    city: '',
    state: 'Bihar',
    zip: '',
    phone: ''
  });

  // Track order state
  const trackingOrderId = params.orderId || '';
  const currentTrackingOrder = orders.find(o => o.id === trackingOrderId) || orders[0];

  // Get detailed progress stages for the tracking UI
  const timeline = currentTrackingOrder?.trackingTimeline || [];
  const orderStatus = currentTrackingOrder?.status || "Pending";
  const isCancelled = orderStatus === "Cancelled";

  const getStatusLog = (statusName) => {
    return [...timeline].reverse().find(log => log.status === statusName);
  };

  const pendingLog = getStatusLog("Pending");
  const processingLog = getStatusLog("Processing");
  const shippedLog = getStatusLog("Shipped");
  const deliveredLog = getStatusLog("Delivered");
  const cancelledLog = getStatusLog("Cancelled");

  const trackingStages = isCancelled
    ? [
        {
          label: "Order Placed",
          time: pendingLog ? pendingLog.time : (currentTrackingOrder ? new Date(currentTrackingOrder.date).toLocaleString() : ""),
          completed: true,
          active: false
        },
        {
          label: "Cancelled",
          time: cancelledLog ? cancelledLog.time : "Just now",
          completed: true,
          active: true,
          isError: true
        }
      ]
    : [
        {
          label: "Pending",
          time: pendingLog ? pendingLog.time : (currentTrackingOrder ? new Date(currentTrackingOrder.date).toLocaleString() : ""),
          completed: true,
          active: orderStatus === "Pending"
        },
        {
          label: "Processing",
          time: processingLog ? processingLog.time : "",
          completed: ["Processing", "Shipped", "Delivered"].includes(orderStatus),
          active: orderStatus === "Processing"
        },
        {
          label: "Shipped",
          time: shippedLog ? shippedLog.time : "",
          completed: ["Shipped", "Delivered"].includes(orderStatus),
          active: orderStatus === "Shipped"
        },
        {
          label: "Delivered",
          time: deliveredLog ? deliveredLog.time : "",
          completed: orderStatus === "Delivered",
          active: orderStatus === "Delivered"
        }
      ];

  const getProgressWidth = () => {
    if (isCancelled) return "100%";
    if (orderStatus === "Pending") return "0%";
    if (orderStatus === "Processing") return "33.33%";
    if (orderStatus === "Shipped") return "66.66%";
    if (orderStatus === "Delivered") return "100%";
    return "0%";
  };

  // Safe address mapping
  const shippingAddr = currentTrackingOrder?.shippingAddress || currentTrackingOrder?.address || {};
  const streetStr = shippingAddr.line || shippingAddr.street || "";
  const cityStr = shippingAddr.city || "";
  const stateStr = shippingAddr.state || "";
  const zipStr = shippingAddr.zip || "";
  const recipientName = shippingAddr.name || user.name || "";
  const recipientPhone = shippingAddr.phone || user.phone || "";

  // Sync state with user context on load
  useEffect(() => {
    if (!user.isLoggedIn) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    setProfileName(user.name);
    setProfilePhone(user.phone);
    setProfileEmail(user.email);
  }, [user]);

  // Simulating shipment tracking updates in background for demonstration
  useEffect(() => {
    if (activeTab === 'tracking' && currentTrackingOrder && currentTrackingOrder.status !== 'Delivered') {
      const orderId = currentTrackingOrder.id;
      // Setup a background timer to update tracking stages every few seconds for simulation
      const timer = setTimeout(() => {
        if (currentTrackingOrder.status === 'Ordered') {
          updateOrderStatus(orderId, 'Confirmed');
        } else if (currentTrackingOrder.status === 'Confirmed') {
          updateOrderStatus(orderId, 'Shipped');
        } else if (currentTrackingOrder.status === 'Shipped') {
          updateOrderStatus(orderId, 'Out for Delivery');
        } else if (currentTrackingOrder.status === 'Out for Delivery') {
          updateOrderStatus(orderId, 'Delivered');
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, currentTrackingOrder, updateOrderStatus]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      phone: profilePhone,
      email: profileEmail
    });
    setIsSavedText(true);
    setTimeout(() => setIsSavedText(false), 3000);
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (newAddr.name && newAddr.street && newAddr.city && newAddr.zip && newAddr.phone) {
      addAddress(newAddr);
      setShowAddAddr(false);
      setNewAddr({
        name: '',
        type: 'Home',
        street: '',
        city: '',
        state: 'Bihar',
        zip: '',
        phone: ''
      });
    }
  };

  const startEditAddress = (addr) => {
    setEditingAddrId(addr.id);
    setEditAddr({
      name: addr.name || '',
      type: addr.type || 'Home',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || 'Bihar',
      zip: addr.zip || '',
      phone: addr.phone || ''
    });
  };

  const handleEditAddressSubmit = async (e) => {
    e.preventDefault();
    if (editAddr.name && editAddr.street && editAddr.city && editAddr.zip && editAddr.phone) {
      await updateAddress(editingAddrId, editAddr);
      setEditingAddrId(null);
    }
  };

  const sidebarItems = [
    { id: 'details', label: 'My Profile', icon: User, path: '/profile' },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, path: '/profile/orders' },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, path: '/profile/addresses' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      
      {/* Title Header */}
      <div className="border-b border-brand-creamDark pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-brand-green font-serif">
            Namaste, {user.name || 'GUEST'}!
          </h1>
          <p className="text-xs text-brand-charcoalLight uppercase tracking-wider font-semibold">
            Manage your personal settings, addresses, and track heritage food orders.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="space-y-2">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isItemActive = activeTab === item.id || (item.id === 'orders' && activeTab === 'tracking');
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all border ${
                  isItemActive
                    ? 'bg-brand-green text-brand-cream border-brand-green shadow-premium'
                    : 'bg-brand-ivory text-brand-green border-brand-gold/15 hover:bg-brand-cream hover:border-brand-gold'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            );
          })}
        </aside>

        {/* Sub-view Area */}
        <main className="lg:col-span-3">
          
          {/* Tab 1: Profile Details */}
          {activeTab === 'details' && (
            <div className="bg-brand-ivory border border-brand-gold/10 rounded-lg p-6 shadow-premium space-y-6">
              <h2 className="text-lg font-bold text-brand-green font-serif border-b border-brand-creamDark pb-3">
                Account Credentials & Profile Details
              </h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-white border border-brand-gold/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-brand-green font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-white border border-brand-gold/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-brand-green font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-white border border-brand-gold/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-brand-green font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-brand-green hover:bg-brand-greenDark text-brand-cream py-2.5 px-6 rounded font-sans text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Save Changes
                </button>
                {isSavedText && (
                  <span className="text-xs text-green-600 font-bold ml-3">✓ Profile changes stored successfully!</span>
                )}
              </form>
            </div>
          )}

          {/* Tab 2: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="bg-brand-ivory border border-brand-gold/10 rounded-lg p-6 shadow-premium space-y-6">
              
              <div className="flex justify-between items-center border-b border-brand-creamDark pb-3">
                <h2 className="text-lg font-bold text-brand-green font-serif">
                  Saved Shipping Addresses
                </h2>
                {!showAddAddr && (
                  <button
                    onClick={() => setShowAddAddr(true)}
                    className="text-xs font-bold text-brand-gold hover:text-brand-green uppercase tracking-wider flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Address List */}
              {!showAddAddr && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    editingAddrId === addr.id ? (
                      <form
                        key={addr.id}
                        onSubmit={handleEditAddressSubmit}
                        className="col-span-1 space-y-3 bg-white border border-brand-gold/30 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-brand-green font-serif">Edit Address</h4>
                          <button type="button" onClick={() => setEditingAddrId(null)} className="text-[10px] text-brand-charcoalLight hover:text-red-500 font-bold">
                            Cancel
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" required placeholder="Full Name" value={editAddr.name}
                            onChange={(e) => setEditAddr({ ...editAddr, name: e.target.value })}
                            className="col-span-2 w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs" />
                          <select value={editAddr.type} onChange={(e) => setEditAddr({ ...editAddr, type: e.target.value })}
                            className="col-span-2 w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs">
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                          <input type="text" required placeholder="Street Address" value={editAddr.street}
                            onChange={(e) => setEditAddr({ ...editAddr, street: e.target.value })}
                            className="col-span-2 w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs" />
                          <input type="text" required placeholder="City" value={editAddr.city}
                            onChange={(e) => setEditAddr({ ...editAddr, city: e.target.value })}
                            className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs" />
                          <input type="text" required placeholder="State" value={editAddr.state}
                            onChange={(e) => setEditAddr({ ...editAddr, state: e.target.value })}
                            className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs" />
                          <input type="text" required placeholder="ZIP" value={editAddr.zip}
                            onChange={(e) => setEditAddr({ ...editAddr, zip: e.target.value })}
                            className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs" />
                          <input type="tel" required placeholder="Phone" value={editAddr.phone}
                            onChange={(e) => setEditAddr({ ...editAddr, phone: e.target.value })}
                            className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs" />
                        </div>
                        <button type="submit" className="w-full px-4 py-2 bg-brand-green text-brand-cream rounded text-xs uppercase tracking-wider font-bold">
                          Save Changes
                        </button>
                      </form>
                    ) : (
                    <div key={addr.id} className="border border-brand-gold/20 bg-white rounded-lg p-4 flex flex-col justify-between hover:border-brand-gold transition-all duration-300">
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-brand-gold uppercase bg-brand-cream border border-brand-gold/20 px-2 py-0.5 rounded-sm">
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="flex items-center gap-0.5 text-[9px] font-bold text-brand-green uppercase bg-brand-gold/20 border border-brand-gold/30 px-2 py-0.5 rounded-sm">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditAddress(addr)}
                              className="text-brand-charcoalLight hover:text-brand-green transition-colors p-1"
                              title="Edit Address"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              className="text-brand-charcoalLight hover:text-red-500 transition-colors p-1"
                              title="Delete Address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="font-bold text-brand-green font-serif mt-2">{addr.name}</p>
                        <p className="text-xs text-brand-charcoalLight mt-1 leading-relaxed">{addr.street}</p>
                        <p className="text-xs text-brand-charcoalLight">{addr.city}, {addr.state} - {addr.zip}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-brand-charcoalLight/70 font-semibold">📞 {addr.phone}</p>
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[10px] font-bold text-brand-gold hover:text-brand-green uppercase tracking-wider"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                    )
                  ))}
                </div>
              )}

              {/* Add Address Form */}
              {showAddAddr && (
                <form onSubmit={handleAddAddressSubmit} className="space-y-4 bg-white border border-brand-gold/15 p-5 rounded-lg">
                  <div className="flex justify-between items-center border-b border-brand-creamDark pb-2">
                    <h3 className="text-sm font-bold text-brand-green font-serif">Add New Address</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddAddr(false)}
                      className="text-xs text-brand-charcoalLight hover:text-red-500 font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Nikhil Kumar"
                        value={newAddr.name}
                        onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Type</label>
                      <select
                        value={newAddr.type}
                        onChange={(e) => setNewAddr({ ...newAddr, type: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="Flat 402, Ganga Apartment, Boring Road"
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                      <div>
                        <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">City</label>
                        <input
                          type="text"
                          required
                          value={newAddr.city}
                          onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                          className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">State</label>
                        <input
                          type="text"
                          required
                          value={newAddr.state}
                          onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                          className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">ZIP Code</label>
                        <input
                          type="text"
                          required
                          value={newAddr.zip}
                          onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                          className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Phone</label>
                      <input
                        type="tel"
                        required
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs animate-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddr(false)}
                      className="px-4 py-2 border border-brand-green/30 text-brand-green rounded text-xs uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-brand-green text-brand-cream rounded text-xs uppercase tracking-wider font-bold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* Tab 3: My Orders */}
          {activeTab === 'orders' && (
            <div className="bg-brand-ivory border border-brand-gold/10 rounded-lg p-6 shadow-premium space-y-6">
              <h2 className="text-lg font-bold text-brand-green font-serif border-b border-brand-creamDark pb-3">
                Order History & Statuses
              </h2>

              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-brand-gold/20 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-premium transition-all duration-300">
                      
                      {/* Order summary bar */}
                      <div className="bg-brand-cream/50 px-4 py-3 border-b border-brand-creamDark flex flex-wrap justify-between items-center text-xs text-brand-charcoalLight font-sans gap-2">
                        <div className="flex space-x-4">
                          <div>
                            <span className="font-semibold block">ORDER PLACED</span>
                            <span className="font-bold text-brand-green">
                              {new Date(order.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold block">TOTAL AMOUNT</span>
                            <span className="font-bold text-brand-green">₹{order.total}</span>
                          </div>
                          <div>
                            <span className="font-semibold block">PAYMENT MODE</span>
                            <span className="font-bold text-brand-green">{order.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold block">ORDER ID:</span>
                          <span className="font-extrabold text-brand-green tracking-wider">{order.id}</span>
                        </div>
                      </div>

                      {/* Order items lists */}
                      <div className="p-4 space-y-4 font-sans text-xs">
                        
                        <div className="flex justify-between items-center mb-2.5">
                          <div className="flex items-center space-x-1.5 text-brand-gold font-bold uppercase tracking-wider text-[11px]">
                            <Package className="w-4 h-4" />
                            <span>Package Status: <span className="text-brand-green underline">{order.status}</span></span>
                          </div>
                          <Link 
                            to={`/profile/track-order/${order.id}`}
                            className="bg-brand-gold hover:bg-brand-goldLight text-brand-green py-1.5 px-3 rounded font-bold uppercase tracking-widest text-[10px]"
                          >
                            Track Shipments
                          </Link>
                        </div>

                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded overflow-hidden bg-brand-cream border shrink-0">
                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-bold text-brand-green line-clamp-1">{item.product.name}</p>
                                <p className="text-[10px] text-brand-charcoalLight/70">{item.product.category} • Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-bold text-brand-green">
                              ₹{Math.round(item.product.price * (1 - item.product.discount / 100)) * item.quantity}
                            </span>
                          </div>
                        ))}

                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 space-y-4">
                  <p className="font-serif font-bold text-brand-green">No Orders Placed Yet</p>
                  <p className="text-xs text-brand-charcoalLight">Browse the Shop to order traditional Bihar treats.</p>
                  <Link to="/shop" className="bg-brand-green text-brand-cream px-6 py-2 rounded text-xs font-bold uppercase tracking-widest inline-block">
                    Explore Shop
                  </Link>
                </div>
              )}

            </div>
          )}

          {/* Tab 4: Order Tracking */}
          {activeTab === 'tracking' && currentTrackingOrder && (
            <div className="bg-brand-ivory border border-brand-gold/10 rounded-lg p-6 shadow-premium space-y-6">
              
              <div className="flex justify-between items-center border-b border-brand-creamDark pb-3">
                <h2 className="text-lg font-bold text-brand-green font-serif">
                  Order Tracking Timeline
                </h2>
                <Link
                  to="/profile/orders"
                  className="text-xs font-bold text-brand-gold hover:text-brand-green uppercase tracking-wider"
                >
                  ← All Orders
                </Link>
              </div>

              {/* Order quick metadata header */}
              <div className="bg-white rounded border border-brand-gold/15 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-sans text-xs md:text-sm text-brand-charcoalLight">
                <div className="space-y-0.5">
                  <span className="font-semibold block text-[10px] text-brand-gold uppercase tracking-wider">Order Reference</span>
                  <span className="font-extrabold text-brand-green tracking-wider break-all text-xs md:text-sm block">{currentTrackingOrder.id}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-semibold block text-[10px] text-brand-gold uppercase tracking-wider">Date Placed</span>
                  <span className="font-bold text-brand-green">
                    {new Date(currentTrackingOrder.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-semibold block text-[10px] text-brand-gold uppercase tracking-wider">Total Value</span>
                  <span className="font-bold text-brand-green">₹{currentTrackingOrder.total}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-semibold block text-[10px] text-brand-gold uppercase tracking-wider">Carrier Status</span>
                  <span className="font-bold text-brand-gold uppercase">{currentTrackingOrder.status}</span>
                </div>
              </div>

              {/* Visual timeline vertical/horizontal stepper */}
              <div className="py-8 px-4 flex flex-col md:flex-row justify-between items-start md:items-center relative gap-8 md:gap-0 font-sans">
                
                {/* Horizontal progress background lines */}
                <div className="absolute top-[28px] left-[12%] right-[12%] h-0.5 bg-brand-creamDark -translate-y-1/2 hidden md:block z-0" />
                <div 
                  className="absolute top-[28px] left-[12%] h-0.5 bg-brand-green -translate-y-1/2 hidden md:block z-0 transition-all duration-700" 
                  style={{ width: `calc(${getProgressWidth()} * 0.76)` }}
                />
                
                {trackingStages.map((step, idx) => {
                  const isCompleted = step.completed;
                  return (
                    <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10 w-full md:w-1/4 text-left md:text-center font-sans">
                      
                      {/* Check circle indicator */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-md relative ${
                        step.isError
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : isCompleted
                          ? 'bg-brand-green border-brand-green text-brand-cream'
                          : 'bg-white border-brand-creamDark text-brand-charcoalLight/40'
                      } ${step.active ? 'ring-4 ring-brand-gold/30 animate-pulse' : ''}`}>
                        {step.isError ? (
                          <XCircle className="w-5 h-5" />
                        ) : isCompleted ? (
                          <CheckCircle className="w-5 h-5 fill-current text-brand-cream" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>

                      {/* Stage details */}
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold ${isCompleted ? 'text-brand-green' : 'text-brand-charcoalLight/60'}`}>
                          {step.label}
                        </p>
                        {step.time && (
                          <p className="text-[10px] text-brand-charcoalLight/60 font-semibold uppercase font-sans">
                            {step.time.slice(0, 16)}
                          </p>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Delivery Destination Address summary */}
              <div className="border-t border-brand-creamDark pt-6 font-sans text-xs md:text-sm">
                <h3 className="font-bold text-brand-green font-serif mb-2">Delivery Shipping Destination</h3>
                <div className="bg-white rounded border border-brand-gold/15 p-4 max-w-md space-y-1">
                  <p className="font-bold text-brand-green">{recipientName}</p>
                  <p>{streetStr}</p>
                  <p>{cityStr}{cityStr && stateStr ? ", " : ""}{stateStr} {zipStr ? `- ${zipStr}` : ""}</p>
                  {recipientPhone && <p className="text-xs text-brand-charcoalLight/60 pt-1">📞 {recipientPhone}</p>}
                </div>
              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}
