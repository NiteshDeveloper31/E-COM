import React, { useState } from "react";
import { ShieldCheck, AlertCircle, Loader } from "lucide-react";

export const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const response = await fetch("http://localhost:5000/api/auth/login", {
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

      if (user.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
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

        {/* Login Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-primary uppercase mb-1">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@reetsutra.com"
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
                <ShieldCheck size={16} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="p-4 bg-background text-center text-[10px] text-charcoal-light font-semibold border-t border-primary/5">
          Secure admin dashboard access terminal.
        </div>
      </div>
    </div>
  );
};
export default Login;
