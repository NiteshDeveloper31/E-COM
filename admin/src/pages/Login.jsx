import React, { useState } from "react";
import { ShieldCheck, AlertCircle, Loader } from "lucide-react";

import { API_BASE_URL } from "../config";

export const Login = ({ onLoginSuccess }) => {
  const [loginType, setLoginType] = useState("superadmin"); // "superadmin" | "admin"
  const [email, setEmail] = useState("admin@reetsutra.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Invalid credentials.");
      }

      const { user, token } = resData.data;

      if (user.role !== "admin" && user.role !== "superadmin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      if (loginType === "superadmin" && user.role !== "superadmin" && user.email !== "admin@reetsutra.com") {
        throw new Error("Access denied. This account does not have Super Admin privileges. Please use Sub-Admin Login.");
      }

      onLoginSuccess(token, user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-primary/10 overflow-hidden">
        {/* Header branding logo */}
        <div className="bg-primary p-6 text-center text-white border-b border-primary-light">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center font-display font-bold text-primary text-2xl mx-auto shadow-md">
            R
          </div>
          <h2 className="font-display font-bold text-xl mt-3 tracking-wider">
            ReetSutra Admin Portal
          </h2>
          <p className="text-xs text-white/70 mt-1 font-semibold">
            Sign in to manage traditional foods & snack inventory.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 bg-primary/5 p-1.5 border-b border-primary/10">
          <button
            type="button"
            onClick={() => {
              setLoginType("superadmin");
              setError("");
              setEmail("admin@reetsutra.com");
              setPassword("admin123");
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginType === "superadmin"
                ? "bg-primary text-secondary shadow-sm"
                : "text-charcoal-light hover:text-primary hover:bg-primary/5"
            }`}
          >
            <span>👑 Super Admin Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginType("admin");
              setError("");
              setEmail("");
              setPassword("");
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginType === "admin"
                ? "bg-primary text-secondary shadow-sm"
                : "text-charcoal-light hover:text-primary hover:bg-primary/5"
            }`}
          >
            <span>🛡️ Sub-Admin Login</span>
          </button>
        </div>

        {/* Login Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center pb-1">
            <span className="text-[11px] font-bold text-charcoal-light uppercase tracking-wider block">
              {loginType === "superadmin" ? "👑 Full Access Super Admin Terminal" : "🛡️ Restricted Sub-Admin Access"}
            </span>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-primary uppercase mb-1">
              {loginType === "superadmin" ? "Super Admin Email" : "Sub-Admin Email"}
            </label>
            <input
              type="email"
              placeholder={loginType === "superadmin" ? "admin@reetsutra.com" : "subadmin@reetsutra.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-secondary rounded-lg font-display font-bold text-sm shadow-md hover:bg-primary-light transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin text-secondary" /> Authenticating...
              </>
            ) : (
              <>
                <ShieldCheck size={16} /> {loginType === "superadmin" ? "Sign In as Super Admin" : "Sign In as Sub-Admin"}
              </>
            )}
          </button>
        </form>

        <div className="p-3.5 bg-background text-center text-[10px] text-charcoal-light font-semibold border-t border-primary/5">
          {loginType === "superadmin" ? "Super Admin Full Privileges Mode" : "Role-Based Access Control Terminal"}
        </div>
      </div>
    </div>
  );
};
export default Login;
