import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useReetSutra } from '../context/ReetSutraContext';
import { Lock, Mail, User, ArrowRight, ShieldAlert, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth({ initialMode = 'login' }) {
  const { login, register } = useReetSutra();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Optional delivery address at signup
  const [addAddressAtSignup, setAddAddressAtSignup] = useState(false);
  const [signupAddr, setSignupAddr] = useState({
    name: '',
    type: 'Home',
    street: '',
    city: '',
    state: 'Bihar',
    zip: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      if (email.trim() && password.trim()) {
        const success = await login(email, password);
        if (success) {
          navigate('/profile');
        }
      } else {
        setErrorMsg('Please enter valid credentials.');
      }
    } else if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (name.trim() && email.trim() && password.trim()) {
        const addressPayload = addAddressAtSignup
          && signupAddr.name.trim() && signupAddr.street.trim() && signupAddr.city.trim()
          && signupAddr.state.trim() && signupAddr.zip.trim() && signupAddr.phone.trim()
          ? { ...signupAddr }
          : null;
        const success = await register(name, email, password, addressPayload);
        if (success) {
          navigate('/profile');
        }
      } else {
        setErrorMsg('Please fill in all registration fields.');
      }
    } else if (mode === 'forgot') {
      if (email.trim()) {
        setResetSent(true);
      } else {
        setErrorMsg('Please fill in your registered email.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 min-h-[75vh] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-brand-ivory border border-brand-gold/10 rounded-lg p-6 md:p-8 shadow-2xl space-y-6"
      >
        
        {/* Logo and header */}
        <div className="text-center space-y-1.5">
          <span className="serif-header text-xl md:text-2xl font-black text-brand-green tracking-wide">
            REET<span className="text-brand-gold">SUTRA</span>
          </span>
          <h2 className="text-base font-bold text-brand-gold uppercase tracking-widest font-sans">
            {mode === 'login' && 'Sign In to Account'}
            {mode === 'register' && 'Create New Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <div className="w-10 h-[1.5px] bg-brand-gold mx-auto mt-2" />
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded p-3 text-xs font-bold flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Forms */}
        {mode === 'forgot' && resetSent ? (
          
          <div className="text-center space-y-4 py-4 font-sans text-xs md:text-sm text-brand-charcoalLight">
            <p className="font-bold text-brand-green">✓ Reset Link Dispatched!</p>
            <p className="leading-relaxed">
              We sent a password reset token to <span className="font-bold text-brand-green">{email}</span>. Click on the link inside the email to configure a new password.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode('login');
                setEmail('');
              }}
              className="mt-2 text-brand-gold hover:text-brand-green font-bold uppercase tracking-wider underline"
            >
              Back to Login
            </button>
          </div>

        ) : (
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name field for Register */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nikhil Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-brand-gold/30 rounded pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-gold text-brand-green font-sans"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                <input
                  type="email"
                  required
                  placeholder="nikhil@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-brand-gold/30 rounded pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-gold text-brand-green font-sans"
                />
              </div>
            </div>

            {/* Password field for Login & Register */}
            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-brand-gold hover:text-brand-green hover:underline font-bold font-sans"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-brand-gold/30 rounded pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-gold text-brand-green font-sans"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password field for Register */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-brand-gold/30 rounded pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-gold text-brand-green font-sans"
                  />
                </div>
              </div>
            )}

            {/* Optional delivery address for Register */}
            {mode === 'register' && (
              <div className="space-y-3 pt-2 border-t border-brand-creamDark">
                <button
                  type="button"
                  onClick={() => setAddAddressAtSignup(!addAddressAtSignup)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-brand-green uppercase tracking-wider pt-3"
                >
                  <span className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                    <span>Add a delivery address (optional)</span>
                  </span>
                  {addAddressAtSignup ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {addAddressAtSignup && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/60 border border-brand-gold/15 p-4 rounded">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-green uppercase tracking-wider block">Recipient Name</label>
                      <input
                        type="text"
                        required={addAddressAtSignup}
                        placeholder="e.g. Nikhil Kumar"
                        value={signupAddr.name}
                        onChange={(e) => setSignupAddr({ ...signupAddr, name: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-green uppercase tracking-wider block">Type</label>
                      <select
                        value={signupAddr.type}
                        onChange={(e) => setSignupAddr({ ...signupAddr, type: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-brand-green uppercase tracking-wider block">Street Address</label>
                      <input
                        type="text"
                        required={addAddressAtSignup}
                        placeholder="Flat 402, Ganga Apartment, Boring Road"
                        value={signupAddr.street}
                        onChange={(e) => setSignupAddr({ ...signupAddr, street: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                      <div>
                        <label className="text-[10px] font-bold text-brand-green uppercase tracking-wider block">City</label>
                        <input
                          type="text"
                          required={addAddressAtSignup}
                          value={signupAddr.city}
                          onChange={(e) => setSignupAddr({ ...signupAddr, city: e.target.value })}
                          className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-brand-green uppercase tracking-wider block">State</label>
                        <input
                          type="text"
                          required={addAddressAtSignup}
                          value={signupAddr.state}
                          onChange={(e) => setSignupAddr({ ...signupAddr, state: e.target.value })}
                          className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-brand-green uppercase tracking-wider block">ZIP Code</label>
                        <input
                          type="text"
                          required={addAddressAtSignup}
                          value={signupAddr.zip}
                          onChange={(e) => setSignupAddr({ ...signupAddr, zip: e.target.value })}
                          className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-brand-green uppercase tracking-wider block">Phone</label>
                      <input
                        type="tel"
                        required={addAddressAtSignup}
                        value={signupAddr.phone}
                        onChange={(e) => setSignupAddr({ ...signupAddr, phone: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/30 rounded px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-brand-green hover:bg-brand-greenDark text-brand-cream py-3 rounded font-sans text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center space-x-2 shadow-gold-glow mt-6"
            >
              <span>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Register Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Toggles */}
            <div className="text-center pt-4 border-t border-brand-creamDark text-xs font-sans text-brand-charcoalLight mt-6">
              {mode === 'login' && (
                <p>
                  New to ReetSutra?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-brand-gold font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              )}

              {mode === 'register' && (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-brand-gold font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-brand-gold font-bold hover:underline block mx-auto"
                >
                  Back to Sign In
                </button>
              )}
            </div>

          </form>
        )}

      </motion.div>
    </div>
  );
}
