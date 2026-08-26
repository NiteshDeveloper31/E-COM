import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import { Smartphone, Mail, User, ArrowRight, ShieldAlert, MapPin, CheckCircle2, Lock, Sparkles, RefreshCw, KeyRound, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth({ initialMode = 'login' }) {
  const { sendOTP, verifyOTPLogin, registerWithOTP, showToast } = useReetSutra();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState(initialMode);

  // Step: 1 = Details / Credentials input, 2 = Enter 4-Digit OTP
  const [step, setStep] = useState(1);

  // Form Inputs
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['1', '2', '3', '4']);
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compulsory Delivery Address State for Registration
  const [address, setAddress] = useState({
    name: '',
    type: 'Home',
    street: '',
    city: 'Patna',
    state: 'Bihar',
    zip: '',
    phone: ''
  });

  // Handle 4-digit OTP input auto-focus
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // STEP 1: Verify Password (if login) and Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Full Name is required.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Valid Email Address is required.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }

      // Validate Compulsory Delivery Address
      if (!address.street.trim()) {
        setErrorMsg('Delivery Street Address is compulsory.');
        return;
      }
      if (!address.city.trim() || !address.state.trim() || !address.zip.trim()) {
        setErrorMsg('City, State, and ZIP Code are compulsory for delivery.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const isLogin = mode === 'login';
      const res = await sendOTP(cleanPhone, password.trim(), isLogin);
      if (res) {
        setStep(2);
        // Pre-fill demo OTP 1234 for seamless testing
        setOtp(['1', '2', '3', '4']);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP & Complete Auth
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) {
      setErrorMsg('Please enter the complete 4-digit OTP.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    setIsSubmitting(true);

    try {
      const locationState = location.state || {};
      const redirectTarget = locationState.from || '/profile';

      if (mode === 'login') {
        const success = await verifyOTPLogin(cleanPhone, fullOtp);
        if (success) {
          showToast('Login successful. Welcome back!', 'success');
          navigate(redirectTarget, { state: locationState });
        }
      } else if (mode === 'register') {
        const addressPayload = {
          name: address.name.trim() || name.trim(),
          type: address.type,
          street: address.street.trim(),
          city: address.city.trim(),
          state: address.state.trim() || 'Bihar',
          zip: address.zip.trim(),
          phone: address.phone.trim() || cleanPhone
        };

        const success = await registerWithOTP(
          name.trim(),
          email.trim(),
          cleanPhone,
          password.trim(),
          fullOtp,
          addressPayload
        );
        if (success) {
          showToast('Registration complete. Welcome!', 'success');
          navigate(redirectTarget, { state: locationState });
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-[#FAF7F2] to-white">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white border border-[#B8934E]/25 rounded-2xl p-6 sm:p-9 shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Decorative Gold Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E3926] via-[#C8A25D] to-[#1E3926]" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1E3926] tracking-wider font-display">
              REET<span className="text-[#C8A25D]">SUTRA</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-[#8C6D34] font-semibold -mt-1">
              Pure & Authentic Bihar Delicacies
            </span>
          </Link>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#FAF6EF] p-1 rounded-xl border border-[#B8934E]/20 mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStep(1);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#1E3926] text-[#C8A25D] shadow-sm'
                  : 'text-[#1E3926]/70 hover:text-[#1E3926]'
              }`}
            >
              📱 Mobile + Password Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setStep(1);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#1E3926] text-[#C8A25D] shadow-sm'
                  : 'text-[#1E3926]/70 hover:text-[#1E3926]'
              }`}
            >
              📝 Create New Account
            </button>
          </div>
        </div>

        {/* Progress Step Indicator */}
        <div className="flex items-center justify-between px-4 text-xs font-bold text-[#8C6D34]">
          <span className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-[#1E3926] text-[#C8A25D]' : 'bg-emerald-100 text-emerald-800'}`}>
              {step > 1 ? '✓' : '1'}
            </span>
            {mode === 'login' ? 'Credentials & Password' : 'Details & Delivery Address'}
          </span>
          <div className="h-[1px] flex-1 bg-[#B8934E]/20 mx-3" />
          <span className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-[#1E3926] text-[#C8A25D]' : 'bg-[#FAF6EF] text-[#1E3926]/40'}`}>
              2
            </span>
            2FA OTP Verification
          </span>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3.5 text-xs font-semibold flex items-center space-x-2.5 shadow-2xs"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* STEP 1: Phone + Password + Signup Details Form */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            
            {/* Registration specific fields */}
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#1E3926] uppercase tracking-wider block">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A25D]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nikhil Kumar"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!address.name) setAddress((prev) => ({ ...prev, name: e.target.value }));
                      }}
                      className="w-full bg-[#FAF6EF]/50 border border-[#B8934E]/30 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#1E3926] focus:bg-white text-[#1E3926] font-semibold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-[#1E3926] uppercase tracking-wider block">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A25D]" />
                    <input
                      type="email"
                      required
                      placeholder="nikhil@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF6EF]/50 border border-[#B8934E]/30 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#1E3926] focus:bg-white text-[#1E3926] font-semibold transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Mobile Number Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-[#1E3926] uppercase tracking-wider block">
                Mobile Number <span className="text-rose-500">*</span>
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
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^0-9]/g, ''));
                    if (!address.phone) setAddress((prev) => ({ ...prev, phone: e.target.value }));
                  }}
                  className="w-full bg-[#FAF6EF]/50 border border-[#B8934E]/30 rounded-xl pl-20 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#1E3926] focus:bg-white text-[#1E3926] font-bold tracking-wider transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-[#1E3926] uppercase tracking-wider block">
                {mode === 'login' ? 'Password' : 'Create Password'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A25D]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF6EF]/50 border border-[#B8934E]/30 rounded-xl pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#1E3926] focus:bg-white text-[#1E3926] font-semibold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6D34] hover:text-[#1E3926] p-1 cursor-pointer"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Register Mode Only) */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-[#1E3926] uppercase tracking-wider block">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8A25D]" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#FAF6EF]/50 border border-[#B8934E]/30 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#1E3926] focus:bg-white text-[#1E3926] font-semibold transition-all"
                  />
                </div>
              </div>
            )}

            {/* COMPULSORY DELIVERY ADDRESS FOR REGISTER */}
            {mode === 'register' && (
              <div className="space-y-3 pt-3 border-t border-[#B8934E]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#1E3926] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C8A25D]" /> Delivery Address Details
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    Compulsory
                  </span>
                </div>

                <div className="space-y-2.5 bg-[#FAF6EF]/40 border border-[#B8934E]/20 p-3.5 rounded-xl">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">Address Tag</label>
                      <select
                        value={address.type}
                        onChange={(e) => setAddress({ ...address, type: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-lg px-2.5 py-2 text-xs font-medium"
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
                        value={address.name || name}
                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-lg px-2.5 py-2 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#1E3926] uppercase block">Street Address / House No. <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Flat 402, Ganga Apartment, Boring Road"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full bg-white border border-[#B8934E]/30 rounded-lg px-2.5 py-2 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">City <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Patna"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-lg px-2 py-2 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">State <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Bihar"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-lg px-2 py-2 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#1E3926] uppercase block">Pincode <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="800001"
                        value={address.zip}
                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        className="w-full bg-white border border-[#B8934E]/30 rounded-lg px-2 py-2 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[10px] text-[#8C6D34] font-semibold flex items-center gap-1 pt-0.5">
              <Sparkles size={11} className="text-[#C8A25D]" /> Demo OTP for testing: <span className="font-bold text-[#1E3926] bg-[#C8A25D]/20 px-1.5 py-0.5 rounded">1234</span>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1E3926] hover:bg-[#14281a] text-[#C8A25D] py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-2 shadow-md cursor-pointer border border-[#1E3926] mt-4"
            >
              <span>{isSubmitting ? 'Verifying Password...' : mode === 'login' ? 'VERIFY PASSWORD & GET OTP' : 'SEND OTP & REGISTER'}</span>
              <ArrowRight className="w-4 h-4 text-[#C8A25D]" />
            </button>
          </form>
        )}

        {/* STEP 2: Enter 4-Digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5 py-2">
            <div className="text-center space-y-1.5">
              <span className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto text-xl font-bold">
                📱
              </span>
              <h3 className="font-bold text-sm text-[#1E3926]">Verify 2FA Mobile OTP</h3>
              <p className="text-xs text-[#8C6D34]">
                Enter 4-digit code sent to <span className="font-bold text-[#1E3926]">+91 {phone}</span>
              </p>
              <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mt-1">
                ⚡ Demo OTP Pre-filled: 1234
              </p>
            </div>

            {/* 4 Individual Digit Input Boxes */}
            <div className="flex justify-center items-center space-x-3 my-4">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={otp[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 bg-[#FAF6EF] border-2 border-[#B8934E]/40 focus:border-[#1E3926] text-center font-bold text-xl text-[#1E3926] rounded-xl focus:outline-none focus:bg-white transition-all shadow-2xs"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1E3926] hover:bg-[#14281a] text-[#C8A25D] py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-2 shadow-md cursor-pointer border border-[#1E3926]"
            >
              <span>{isSubmitting ? 'Verifying OTP...' : 'VERIFY & LOGIN AUTOMATICALLY'}</span>
              <CheckCircle2 className="w-4 h-4 text-[#C8A25D]" />
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[#8C6D34] hover:text-[#1E3926] font-bold underline cursor-pointer"
              >
                ← Back to Edit Details
              </button>
              <button
                type="button"
                onClick={handleSendOTP}
                className="text-[#1E3926] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} /> Resend OTP
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
