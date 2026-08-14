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
  Star,
  Mail,
  Phone,
  ShieldCheck,
  Building,
  Check,
  ArrowRight,
  Lock,
  X,
  Sparkles,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, addresses, orders, updateProfile, deleteAddress, addAddress, updateAddress, setDefaultAddress, updateOrderStatus, sendOTP, changePhoneWithOTP, changeEmailWithOTP, showToast } = useReetSutra();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // Determine current active subview based on URL path
  const path = location.pathname;
  let activeTab = 'details'; // 'details' | 'orders' | 'addresses' | 'tracking'
  if (path.includes('/profile/orders')) activeTab = 'orders';
  else if (path.includes('/profile/addresses')) activeTab = 'addresses';
  else if (path.includes('/profile/track-order')) activeTab = 'tracking';

  // State for editing profile credentials (Full Name)
  const [profileName, setProfileName] = useState(user.name || '');
  const [isSavedText, setIsSavedText] = useState(false);

  // Modal State for Changing Mobile Number via OTP
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneStep, setPhoneStep] = useState(1);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [phoneOtp, setPhoneOtp] = useState(['1', '2', '3', '4']);
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);

  // Modal State for Changing Email Address via OTP
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState(1);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtp, setEmailOtp] = useState(['1', '2', '3', '4']);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  // State for adding new address
  // Helper to format 10-digit phone as +91 73786 47099
  const formatPhone = (phoneNum) => {
    if (!phoneNum) return 'Not Registered';
    const clean = String(phoneNum).replace(/[^0-9]/g, '');
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    if (clean.length === 12 && clean.startsWith('91')) {
      return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
    }
    return String(phoneNum);
  };

  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: user.name || '',
    type: 'Home',
    street: '',
    city: 'Patna',
    state: 'Bihar',
    zip: '',
    phone: user.phone || ''
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

  // Sync state with user context on load
  useEffect(() => {
    if (!user.isLoggedIn) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    setProfileName(user.name || '');
  }, [user]);

  const handleProfileNameSubmit = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Please enter your full name.');
      return;
    }
    const success = await updateProfile({
      name: profileName.trim()
    });
    if (success) {
      setIsSavedText(true);
      setTimeout(() => setIsSavedText(false), 3000);
    }
  };

  // PHONE CHANGE MODAL HANDLERS
  const handleSendPhoneOTP = async (e) => {
    e.preventDefault();
    const cleanPhone = newPhoneInput.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (cleanPhone === user.phone) {
      showToast('New phone number is the same as your current phone number.');
      return;
    }
    setIsSubmittingPhone(true);
    try {
      const res = await sendOTP(cleanPhone);
      if (res) {
        setPhoneStep(2);
      }
    } finally {
      setIsSubmittingPhone(false);
    }
  };

  const handleVerifyPhoneOTP = async (e) => {
    e.preventDefault();
    const fullOtp = phoneOtp.join('');
    if (fullOtp.length !== 4) {
      showToast('Please enter the 4-digit OTP.');
      return;
    }
    setIsSubmittingPhone(true);
    try {
      const success = await changePhoneWithOTP(newPhoneInput.trim(), fullOtp);
      if (success) {
        setShowPhoneModal(false);
        setPhoneStep(1);
        setNewPhoneInput('');
      }
    } finally {
      setIsSubmittingPhone(false);
    }
  };

  // EMAIL CHANGE MODAL HANDLERS
  const handleSendEmailOTP = async (e) => {
    e.preventDefault();
    const cleanEmail = newEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }
    if (cleanEmail === user.email) {
      showToast('New email address is the same as your current email.');
      return;
    }
    setIsSubmittingEmail(true);
    try {
      showToast(`Verification code sent to ${cleanEmail} (Demo OTP: 1234)`, 'success');
      setEmailStep(2);
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleVerifyEmailOTP = async (e) => {
    e.preventDefault();
    const fullOtp = emailOtp.join('');
    if (fullOtp.length !== 4) {
      showToast('Please enter the 4-digit OTP.');
      return;
    }
    setIsSubmittingEmail(true);
    try {
      const success = await changeEmailWithOTP(newEmailInput.trim(), fullOtp);
      if (success) {
        setShowEmailModal(false);
        setEmailStep(1);
        setNewEmailInput('');
      }
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (newAddr.name.trim() && newAddr.street.trim() && newAddr.city.trim() && newAddr.zip.trim() && newAddr.phone.trim()) {
      await addAddress(newAddr);
      setShowAddAddr(false);
      setNewAddr({
        name: user.name || '',
        type: 'Home',
        street: '',
        city: 'Patna',
        state: 'Bihar',
        zip: '',
        phone: user.phone || ''
      });
    } else {
      showToast('Please fill in all address fields.');
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
    if (editAddr.name.trim() && editAddr.street.trim() && editAddr.city.trim() && editAddr.zip.trim() && editAddr.phone.trim()) {
      await updateAddress(editingAddrId, editAddr);
      setEditingAddrId(null);
    } else {
      showToast('Please fill in all address fields.');
    }
  };

  // Find default address
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const sidebarItems = [
    { id: 'details', label: 'My Profile & Summary', icon: User, path: '/profile' },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, path: '/profile/orders', count: orders.length },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, path: '/profile/addresses', count: addresses.length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh] space-y-8 relative">
      
      {/* Header Banner & Customer Summary Card */}
      <div className="bg-gradient-to-r from-[#1E3926] via-[#16291b] to-[#1E3926] rounded-2xl p-6 sm:p-8 text-brand-cream border border-[#B8934E]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full border-8 border-[#C8A25D]/10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Avatar & User Name */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#C8A25D]/20 border-2 border-[#C8A25D] text-[#C8A25D] font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
                  Namaste, {user.name || 'Valued Customer'}!
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#C8A25D] text-[#1E3926] shadow-xs">
                  VIP Member
                </span>
              </div>
              <p className="text-xs text-brand-cream/80 font-sans leading-relaxed">
                Manage your credentials, delivery addresses, and track heritage Bihari food orders.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-[#C8A25D]/20">
            <div className="bg-white/10 backdrop-blur-md border border-[#C8A25D]/20 p-3 rounded-xl text-left">
              <span className="text-[9px] font-bold text-[#C8A25D] uppercase tracking-wider block">Total Orders</span>
              <span className="text-sm font-bold text-white font-sans">{orders.length} Placed</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-[#C8A25D]/20 p-3 rounded-xl text-left">
              <span className="text-[9px] font-bold text-[#C8A25D] uppercase tracking-wider block">Addresses</span>
              <span className="text-sm font-bold text-white font-sans">{addresses.length} Saved</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-[#C8A25D]/20 p-3 rounded-xl text-left col-span-2 sm:col-span-2">
              <span className="text-[9px] font-bold text-[#C8A25D] uppercase tracking-wider block">Contact Phone</span>
              <span className="text-xs font-bold text-white font-mono">{formatPhone(user.phone)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation Tabs */}
        <aside className="space-y-2.5">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isItemActive = activeTab === item.id || (item.id === 'orders' && activeTab === 'tracking');
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  isItemActive
                    ? 'bg-[#1E3926] text-[#C8A25D] border-[#1E3926] shadow-md scale-[1.01]'
                    : 'bg-white text-[#1E3926] border-[#B8934E]/20 hover:bg-[#FAF7F2] hover:border-[#C8A25D]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-4 h-4 shrink-0 text-[#C8A25D]" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {typeof item.count === 'number' && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isItemActive ? 'bg-[#C8A25D] text-[#1E3926]' : 'bg-[#1E3926]/10 text-[#1E3926]'
                    }`}>
                      {item.count}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 shrink-0 opacity-70" />
                </div>
              </Link>
            );
          })}
        </aside>

        {/* Sub-view Content Area */}
        <main className="lg:col-span-3">
          
          {/* TAB 1: Profile & Credentials Overview */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Box: Account Credentials Form */}
                <div className="bg-white border border-[#B8934E]/25 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="border-b border-[#B8934E]/15 pb-3 flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#1E3926] font-serif flex items-center gap-2">
                      <User className="w-4 h-4 text-[#C8A25D]" /> Account Credentials
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified Profile
                    </span>
                  </div>
                  
                  {/* Full Name Edit Form */}
                  <form onSubmit={handleProfileNameSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-[#1E3926] uppercase tracking-wider block">Full Name</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="flex-1 bg-[#FAF7F2]/60 border border-[#B8934E]/30 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#1E3926] focus:outline-none focus:border-[#1E3926] focus:bg-white transition-all"
                        />
                        <button
                          type="submit"
                          className="bg-[#1E3926] hover:bg-[#14281a] text-[#C8A25D] py-2 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                      {isSavedText && (
                        <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                          <Check size={13} /> Name updated successfully!
                        </p>
                      )}
                    </div>
                  </form>

                  {/* Phone Number Field (Locked / OTP Change Only) */}
                  <div className="space-y-1.5 pt-3 border-t border-[#B8934E]/15">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-extrabold text-[#1E3926] uppercase tracking-wider block">
                        Registered Mobile Number
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPhoneModal(true);
                          setPhoneStep(1);
                          setNewPhoneInput('');
                        }}
                        className="text-[10px] font-bold text-[#C8A25D] hover:text-[#1E3926] uppercase tracking-wider underline cursor-pointer"
                      >
                        Change Phone
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type="text"
                        disabled
                        value={formatPhone(user.phone)}
                        className="w-full bg-[#FAF7F2] border border-[#B8934E]/20 rounded-xl pl-3.5 pr-28 py-2.5 text-xs font-bold text-[#1E3926] font-mono cursor-not-allowed"
                      />
                      <span className="absolute right-2 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock size={10} /> Verified
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8C6D34]">Phone number requires SMS OTP verification to change.</p>
                  </div>

                  {/* Email Address Field (Locked / OTP Change Only) */}
                  <div className="space-y-1.5 pt-3 border-t border-[#B8934E]/15">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-extrabold text-[#1E3926] uppercase tracking-wider block">
                        Registered Email Address
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmailModal(true);
                          setEmailStep(1);
                          setNewEmailInput('');
                        }}
                        className="text-[10px] font-bold text-[#C8A25D] hover:text-[#1E3926] uppercase tracking-wider underline cursor-pointer"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type="email"
                        disabled
                        value={user.email || ''}
                        className="w-full bg-[#FAF7F2] border border-[#B8934E]/20 rounded-xl pl-3.5 pr-24 py-2.5 text-xs font-bold text-[#1E3926] cursor-not-allowed"
                      />
                      <span className="absolute right-2 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock size={10} /> Verified
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8C6D34]">Email address requires OTP security verification to change.</p>
                  </div>
                </div>

                {/* Right Box: Primary Default Delivery Address Summary */}
                <div className="bg-white border border-[#B8934E]/25 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-[#B8934E]/15 pb-3 flex items-center justify-between">
                      <h2 className="text-base font-bold text-[#1E3926] font-serif flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#C8A25D]" /> Primary Delivery Address
                      </h2>
                      <Link
                        to="/profile/addresses"
                        className="text-[10px] font-extrabold text-[#C8A25D] hover:text-[#1E3926] uppercase tracking-wider flex items-center gap-0.5"
                      >
                        Manage ({addresses.length}) <ArrowRight size={11} />
                      </Link>
                    </div>

                    {defaultAddress ? (
                      <div className="p-4 bg-[#FAF7F2]/60 border border-[#B8934E]/20 rounded-xl space-y-2 mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1E3926] text-[#C8A25D]">
                            {defaultAddress.type || 'Home'}
                          </span>
                          {defaultAddress.isDefault && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C8A25D]/20 text-[#8C6D34] border border-[#C8A25D]/40 flex items-center gap-1">
                              <Star size={10} className="fill-current" /> Default Address
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-xs text-[#1E3926] font-serif">{defaultAddress.name}</p>
                        <p className="text-xs text-[#1E3926]/80 font-sans leading-relaxed">{defaultAddress.street}</p>
                        <p className="text-xs text-[#1E3926]/80 font-sans">{defaultAddress.city}, {defaultAddress.state} - <span className="font-bold">{defaultAddress.zip}</span></p>
                        <p className="text-[11px] text-[#8C6D34] font-semibold pt-1">📞 {formatPhone(defaultAddress.phone)}</p>
                      </div>
                    ) : (
                      <div className="p-6 border border-dashed border-[#B8934E]/30 rounded-xl text-center space-y-2 bg-[#FAF7F2]/40 mt-4">
                        <MapPin className="w-6 h-6 text-[#C8A25D] mx-auto" />
                        <p className="text-xs font-bold text-[#1E3926]">No saved address yet.</p>
                        <p className="text-[11px] text-[#8C6D34]">Add your delivery address to enjoy faster 1-click checkout.</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      navigate('/profile/addresses');
                    }}
                    className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 text-[#1E3926] border border-[#B8934E]/30 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer mt-4"
                  >
                    <Plus className="w-4 h-4 text-[#C8A25D]" />
                    <span>+ Add Another Delivery Address</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Orders List & Tracking */}
          {(activeTab === 'orders' || activeTab === 'tracking') && (
            <div className="bg-white border border-[#B8934E]/25 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-[#B8934E]/15 pb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1E3926] font-serif">
                  My Orders History ({orders.length})
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center space-y-3 bg-[#FAF7F2]/40 rounded-xl border border-dashed border-[#B8934E]/25">
                  <ShoppingBag className="w-10 h-10 text-[#C8A25D] mx-auto" />
                  <h3 className="font-bold text-sm text-[#1E3926]">No orders placed yet</h3>
                  <p className="text-xs text-[#8C6D34]">Explore authentic Bihari delicacies and place your first order today!</p>
                  <Link
                    to="/shop"
                    className="inline-block bg-[#1E3926] text-[#C8A25D] font-bold text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-md hover:bg-[#14281a] transition-all mt-2"
                  >
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="border border-[#B8934E]/20 bg-[#FAF7F2]/40 rounded-xl p-4 sm:p-5 space-y-3 hover:border-[#C8A25D] transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#B8934E]/15 pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-[#8C6D34] uppercase block">Order ID</span>
                          <span className="font-bold text-xs text-[#1E3926] font-mono">#{ord.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#8C6D34] uppercase block">Order Date</span>
                          <span className="text-xs text-[#1E3926] font-medium">{new Date(ord.date).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#8C6D34] uppercase block">Total Amount</span>
                          <span className="text-xs font-bold text-[#1E3926]">₹{ord.total}</span>
                        </div>
                        <div>
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : ord.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="space-y-2 pt-1">
                        {(ord.items || []).map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#1E3926]">{it.name} x {it.quantity}</span>
                            <span className="font-bold text-[#8C6D34]">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Saved Multiple Addresses Management */}
          {activeTab === 'addresses' && (
            <div className="bg-white border border-[#B8934E]/25 rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center border-b border-[#B8934E]/15 pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#1E3926] font-serif">
                    Saved Delivery Addresses ({addresses.length})
                  </h2>
                  <p className="text-xs text-[#8C6D34]">Add multiple delivery addresses for seamless 1-click checkout.</p>
                </div>
                {!showAddAddr && (
                  <button
                    onClick={() => setShowAddAddr(true)}
                    className="bg-[#1E3926] text-[#C8A25D] hover:bg-[#14281a] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Form: Add New Address */}
              {showAddAddr && (
                <form onSubmit={handleAddAddressSubmit} className="bg-[#FAF7F2] border border-[#B8934E]/30 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#B8934E]/20 pb-2">
                    <h3 className="text-xs font-extrabold text-[#1E3926] uppercase tracking-wider">Add New Delivery Address</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddAddr(false)}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">Address Tag</label>
                      <select
                        value={newAddr.type}
                        onChange={(e) => setNewAddr({ ...newAddr, type: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">Recipient Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Recipient Name"
                        value={newAddr.name}
                        onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">Street Address <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Flat 402, Ganga Apartment, Boring Road"
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">City <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Patna"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">State <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Bihar"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">ZIP Code <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="800001"
                        value={newAddr.zip}
                        onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">Phone <span className="text-rose-500">*</span></label>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1E3926] text-[#C8A25D] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#14281a] transition-all cursor-pointer"
                  >
                    SAVE DELIVERY ADDRESS
                  </button>
                </form>
              )}

              {/* Saved Address Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  editingAddrId === addr.id ? (
                    <form
                      key={addr.id}
                      onSubmit={handleEditAddressSubmit}
                      className="col-span-1 space-y-3 bg-[#FAF7F2] border border-[#B8934E]/40 p-4 rounded-2xl shadow-sm"
                    >
                      <div className="flex justify-between items-center border-b border-[#B8934E]/20 pb-2">
                        <h4 className="text-xs font-bold text-[#1E3926] uppercase">Edit Address</h4>
                        <button type="button" onClick={() => setEditingAddrId(null)} className="text-[10px] text-rose-600 font-bold">
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" required placeholder="Full Name" value={editAddr.name}
                          onChange={(e) => setEditAddr({ ...editAddr, name: e.target.value })}
                          className="col-span-2 w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium" />
                        <select value={editAddr.type} onChange={(e) => setEditAddr({ ...editAddr, type: e.target.value })}
                          className="col-span-2 w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium">
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                          <option value="Other">Other</option>
                        </select>
                        <input type="text" required placeholder="Street Address" value={editAddr.street}
                          onChange={(e) => setEditAddr({ ...editAddr, street: e.target.value })}
                          className="col-span-2 w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium" />
                        <input type="text" required placeholder="City" value={editAddr.city}
                          onChange={(e) => setEditAddr({ ...editAddr, city: e.target.value })}
                          className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium" />
                        <input type="text" required placeholder="State" value={editAddr.state}
                          onChange={(e) => setEditAddr({ ...editAddr, state: e.target.value })}
                          className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium" />
                        <input type="text" required placeholder="ZIP" value={editAddr.zip}
                          onChange={(e) => setEditAddr({ ...editAddr, zip: e.target.value })}
                          className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium" />
                        <input type="tel" required placeholder="Phone" value={editAddr.phone}
                          onChange={(e) => setEditAddr({ ...editAddr, phone: e.target.value })}
                          className="w-full bg-white border border-[#B8934E]/30 rounded-xl px-3 py-2 text-xs font-medium" />
                      </div>
                      <button type="submit" className="w-full px-4 py-2 bg-[#1E3926] text-[#C8A25D] rounded-xl text-xs uppercase tracking-wider font-bold shadow-md cursor-pointer">
                        SAVE CHANGES
                      </button>
                    </form>
                  ) : (
                    <div key={addr.id} className="border border-[#B8934E]/25 bg-white rounded-2xl p-5 flex flex-col justify-between hover:border-[#C8A25D] transition-all shadow-xs space-y-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-extrabold text-[#1E3926] uppercase bg-[#FAF7F2] border border-[#B8934E]/30 px-2.5 py-0.5 rounded-full">
                              {addr.type || 'Home'}
                            </span>
                            {addr.isDefault && (
                              <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-[#8C6D34] uppercase bg-[#C8A25D]/20 border border-[#C8A25D]/40 px-2.5 py-0.5 rounded-full">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditAddress(addr)}
                              className="text-[#8C6D34] hover:text-[#1E3926] transition-colors p-1 cursor-pointer"
                              title="Edit Address"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              className="text-[#8C6D34] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                              title="Delete Address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="font-bold text-sm text-[#1E3926] font-serif mt-2">{addr.name}</p>
                        <p className="text-xs text-[#1E3926]/80 mt-1 leading-relaxed">{addr.street}</p>
                        <p className="text-xs text-[#1E3926]/80">{addr.city}, {addr.state} - <span className="font-bold">{addr.zip}</span></p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#B8934E]/15">
                        <p className="text-xs text-[#8C6D34] font-semibold">📞 {formatPhone(addr.phone)}</p>
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[10px] font-extrabold text-[#C8A25D] hover:text-[#1E3926] uppercase tracking-wider cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>

            </div>
          )}

        </main>
      </div>

      {/* CHANGE PHONE NUMBER OTP MODAL */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#B8934E]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative"
          >
            <button
              onClick={() => setShowPhoneModal(false)}
              className="absolute right-4 top-4 text-[#8C6D34] hover:text-[#1E3926] font-bold p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-1">
              <span className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto text-lg font-bold">
                📱
              </span>
              <h3 className="font-serif font-bold text-base text-[#1E3926]">Change Mobile Number</h3>
              <p className="text-xs text-[#8C6D34]">Verify ownership of your new phone via SMS OTP</p>
            </div>

            {phoneStep === 1 ? (
              <form onSubmit={handleSendPhoneOTP} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#1E3926] uppercase tracking-wider block">
                    Enter New 10-Digit Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-[#1E3926] border-r border-[#B8934E]/30 pr-2">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="98765 43210"
                      value={newPhoneInput}
                      onChange={(e) => setNewPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-[#FAF7F2] border border-[#B8934E]/30 rounded-xl pl-20 pr-4 py-2.5 text-xs font-bold text-[#1E3926] focus:outline-none focus:border-[#1E3926]"
                    />
                  </div>
                  <p className="text-[10px] text-[#8C6D34] font-semibold pt-0.5">⚡ Demo OTP for testing: <span className="font-bold text-[#1E3926]">1234</span></p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPhone}
                  className="w-full bg-[#1E3926] text-[#C8A25D] py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-md hover:bg-[#14281a] cursor-pointer"
                >
                  {isSubmittingPhone ? 'Sending OTP...' : 'SEND OTP CODE'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOTP} className="space-y-4 pt-2">
                <div className="text-center space-y-1">
                  <p className="text-xs text-[#1E3926]">Enter 4-digit code sent to <strong>+91 {newPhoneInput}</strong></p>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                    Demo OTP Pre-filled: 1234
                  </span>
                </div>

                <div className="flex justify-center items-center space-x-2 my-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={phoneOtp[idx]}
                      onChange={(e) => {
                        const val = e.target.value.slice(-1);
                        const newOtp = [...phoneOtp];
                        newOtp[idx] = val;
                        setPhoneOtp(newOtp);
                      }}
                      className="w-11 h-12 bg-[#FAF7F2] border-2 border-[#B8934E]/40 text-center font-bold text-lg text-[#1E3926] rounded-xl focus:outline-none focus:border-[#1E3926]"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPhone}
                  className="w-full bg-[#1E3926] text-[#C8A25D] py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-md hover:bg-[#14281a] cursor-pointer"
                >
                  {isSubmittingPhone ? 'Verifying...' : 'VERIFY & SAVE NEW PHONE'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* CHANGE EMAIL ADDRESS OTP MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#B8934E]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative"
          >
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute right-4 top-4 text-[#8C6D34] hover:text-[#1E3926] font-bold p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-1">
              <span className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto text-lg font-bold">
                ✉️
              </span>
              <h3 className="font-serif font-bold text-base text-[#1E3926]">Change Email Address</h3>
              <p className="text-xs text-[#8C6D34]">Verify ownership of your new email via OTP code</p>
            </div>

            {emailStep === 1 ? (
              <form onSubmit={handleSendEmailOTP} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#1E3926] uppercase tracking-wider block">
                    Enter New Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="new.email@example.com"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#B8934E]/30 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1E3926] focus:outline-none focus:border-[#1E3926]"
                  />
                  <p className="text-[10px] text-[#8C6D34] font-semibold pt-0.5">⚡ Demo OTP for testing: <span className="font-bold text-[#1E3926]">1234</span></p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEmail}
                  className="w-full bg-[#1E3926] text-[#C8A25D] py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-md hover:bg-[#14281a] cursor-pointer"
                >
                  {isSubmittingEmail ? 'Sending Code...' : 'SEND VERIFICATION CODE'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailOTP} className="space-y-4 pt-2">
                <div className="text-center space-y-1">
                  <p className="text-xs text-[#1E3926]">Enter 4-digit code sent to <strong>{newEmailInput}</strong></p>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                    Demo OTP Pre-filled: 1234
                  </span>
                </div>

                <div className="flex justify-center items-center space-x-2 my-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={emailOtp[idx]}
                      onChange={(e) => {
                        const val = e.target.value.slice(-1);
                        const newOtp = [...emailOtp];
                        newOtp[idx] = val;
                        setEmailOtp(newOtp);
                      }}
                      className="w-11 h-12 bg-[#FAF7F2] border-2 border-[#B8934E]/40 text-center font-bold text-lg text-[#1E3926] rounded-xl focus:outline-none focus:border-[#1E3926]"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEmail}
                  className="w-full bg-[#1E3926] text-[#C8A25D] py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-md hover:bg-[#14281a] cursor-pointer"
                >
                  {isSubmittingEmail ? 'Verifying...' : 'VERIFY & SAVE NEW EMAIL'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}
