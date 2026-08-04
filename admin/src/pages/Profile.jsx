import React, { useState } from "react";
import { User, Shield, Key, BellRing, Check, AlertCircle } from "lucide-react";
import { useData } from "../context/DataContext";

export const Profile = () => {
  const { adminProfile, updateAdminProfile } = useData();

  // Profile details states
  const [name, setName] = useState(adminProfile.name);
  const [email, setEmail] = useState(adminProfile.email);
  const [phone, setPhone] = useState(adminProfile.phone);
  const [avatar, setAvatar] = useState(adminProfile.avatar);

  // Security password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifSuccess, setNotifSuccess] = useState("");
  const [notifError, setNotifError] = useState("");

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !avatar) {
      setNotifError("All profile fields are required.");
      return;
    }

    updateAdminProfile({
      ...adminProfile,
      name,
      email,
      phone,
      avatar
    });

    setNotifSuccess("Profile information updated successfully.");
    setNotifError("");
    setTimeout(() => setNotifSuccess(""), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setNotifError("Please fill out all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotifError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setNotifError("New password must be at least 6 characters long.");
      return;
    }

    // Mock success
    setNotifSuccess("Security credentials updated successfully.");
    setNotifError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setNotifSuccess(""), 3000);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Admin Profile Settings
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Manage your personal profile settings, update contact cards, and change security credentials.
          </p>
        </div>

        {notifSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 animate-bounce">
            <Check size={16} /> {notifSuccess}
          </div>
        )}

        {notifError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5">
            <AlertCircle size={16} /> {notifError}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Profile Summary card */}
        <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="p-6 text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-secondary/20 shadow-md"
              />
              <span className="absolute bottom-1 right-1 p-1 bg-secondary text-primary rounded-full border border-white">
                <Shield size={14} />
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-primary">{name}</h3>
              <p className="text-xs text-charcoal-light font-bold uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-sm inline-block">
                {adminProfile.role}
              </p>
            </div>

            <div className="divide-y divide-primary/5 text-xs text-left">
              <div className="py-2.5 flex justify-between">
                <span className="text-charcoal-light font-medium">Email Address:</span>
                <span className="font-bold text-primary">{email}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-charcoal-light font-medium">Phone number:</span>
                <span className="font-semibold text-charcoal">{phone}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-charcoal-light font-medium">Access privileges:</span>
                <span className="font-bold text-emerald-700">All Modules (CRUD)</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-background border-t border-primary/5 text-center text-[10px] text-charcoal-light font-semibold">
            Last Login: {adminProfile.lastLogin}
          </div>
        </div>

        {/* Right Side: Account Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <form
            onSubmit={handleUpdateProfile}
            className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-xs"
          >
            <div className="p-6 space-y-4">
              <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2 flex items-center gap-2">
                <User size={18} className="text-secondary" />
                Personal Profile Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Direct Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Profile Avatar URL
                  </label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="bg-background px-6 py-4 border-t border-primary/5 flex justify-end">
              <button
                type="submit"
                className="px-4.5 py-2.5 bg-primary text-secondary rounded-lg font-display font-bold text-sm shadow-md hover:bg-primary-light transition-all cursor-pointer"
              >
                Update Profile
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-xs"
          >
            <div className="p-6 space-y-4">
              <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2 flex items-center gap-2">
                <Key size={18} className="text-secondary" />
                Change Password credentials
              </h3>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="bg-background px-6 py-4 border-t border-primary/5 flex justify-end">
              <button
                type="submit"
                className="px-4.5 py-2.5 bg-primary text-secondary rounded-lg font-display font-bold text-sm shadow-md hover:bg-primary-light transition-all cursor-pointer"
              >
                Change Credentials
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default Profile;
