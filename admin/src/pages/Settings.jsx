import React, { useState } from "react";
import { Settings as SettingsIcon, Globe, Phone, ShieldCheck, Check, Info } from "lucide-react";
import { useData } from "../context/DataContext";

export const Settings = () => {
  const { settings, updateSettings } = useData();
  const [activeTab, setActiveTab] = useState("general");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states initialized from context settings
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline);
  const [storeLogo, setStoreLogo] = useState(settings.storeLogo);
  const [currency, setCurrency] = useState(settings.currency);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [orderPrefix, setOrderPrefix] = useState(settings.orderPrefix);

  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [contactAddress, setContactAddress] = useState(settings.contactAddress);

  const [socialFacebook, setSocialFacebook] = useState(settings.socialFacebook);
  const [socialInstagram, setSocialInstagram] = useState(settings.socialInstagram);
  const [socialYoutube, setSocialYoutube] = useState(settings.socialYoutube);
  const [socialPinterest, setSocialPinterest] = useState(settings.socialPinterest);

  const [seoTitle, setSeoTitle] = useState(settings.seoTitle);
  const [seoMetaDescription, setSeoMetaDescription] = useState(settings.seoMetaDescription);
  const [seoKeywords, setSeoKeywords] = useState(settings.seoKeywords);
  const [robotsTxt, setRobotsTxt] = useState(settings.robotsTxt);

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      storeName,
      storeTagline,
      storeLogo,
      currency,
      timezone,
      taxRate: parseFloat(taxRate),
      orderPrefix,
      contactEmail,
      contactPhone,
      contactAddress,
      socialFacebook,
      socialInstagram,
      socialYoutube,
      socialPinterest,
      seoTitle,
      seoMetaDescription,
      seoKeywords,
      robotsTxt
    };

    updateSettings(payload);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: "general", label: "General & Branding", icon: SettingsIcon },
    { id: "contact", label: "Contact & Socials", icon: Phone },
    { id: "seo", label: "SEO & Robots.txt", icon: Globe }
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Settings Configuration
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Configure default taxes, store metadata, contact details, and SEO indexing.
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 animate-bounce">
            <Check size={16} /> Configurations saved successfully!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs on Left */}
        <div className="lg:col-span-1 flex flex-col gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-primary text-secondary shadow-md shadow-primary/10"
                    : "bg-white text-charcoal hover:bg-primary/5 hover:text-primary border border-primary/5"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content on Right */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-xs">
            <div className="p-6 space-y-6">
              
              {/* --- GENERAL SETTINGS --- */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2">
                    Store Branding & Configuration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Store Tagline
                      </label>
                      <input
                        type="text"
                        value={storeTagline}
                        onChange={(e) => setStoreTagline(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Store Logo URL (Mock upload)
                      </label>
                      <input
                        type="text"
                        value={storeLogo}
                        onChange={(e) => setStoreLogo(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background placeholder-charcoal-light focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    
                    {/* Logo Preview box */}
                    <div className="flex items-center gap-3 p-3 bg-background border border-primary/5 rounded-lg self-end h-10">
                      <span className="text-[10px] font-bold text-charcoal-light uppercase">Branding Preview:</span>
                      <img src={storeLogo} alt="Logo" className="w-8 h-8 rounded-md border border-secondary object-cover" />
                    </div>
                  </div>

                  <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2 pt-2">
                    Transactional Defaults
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Default Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      >
                        <option value="INR (₹)">Indian Rupee (₹)</option>
                        <option value="USD ($)">US Dollar ($)</option>
                        <option value="EUR (€)">Euro (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        GST Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Order Code Prefix
                      </label>
                      <input
                        type="text"
                        value={orderPrefix}
                        onChange={(e) => setOrderPrefix(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">
                      Timezone Locale
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                    >
                      <option value="IST (UTC+05:30)">India Standard Time (UTC+05:30)</option>
                      <option value="GMT (UTC+00:00)">GMT (UTC+00:00)</option>
                      <option value="PST (UTC-08:00)">Pacific Standard Time (UTC-08:00)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* --- CONTACT SETTINGS --- */}
              {activeTab === "contact" && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2">
                    Contact Channels
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Customer Support Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Hotline Phone Number
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">
                      Warehouse / Physical Address
                    </label>
                    <textarea
                      rows={2}
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                      className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
                    />
                  </div>

                  <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2 pt-2">
                    Social Media Integrations
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Facebook Page Link
                      </label>
                      <input
                        type="text"
                        value={socialFacebook}
                        onChange={(e) => setSocialFacebook(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Instagram Profile Link
                      </label>
                      <input
                        type="text"
                        value={socialInstagram}
                        onChange={(e) => setSocialInstagram(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        YouTube Channel
                      </label>
                      <input
                        type="text"
                        value={socialYoutube}
                        onChange={(e) => setSocialYoutube(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Pinterest Account
                      </label>
                      <input
                        type="text"
                        value={socialPinterest}
                        onChange={(e) => setSocialPinterest(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- SEO SETTINGS --- */}
              {activeTab === "seo" && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2">
                    Search Engine Optimization (SEO)
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">
                      Meta Title Tag
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">
                      Meta Description Tag
                    </label>
                    <textarea
                      rows={2}
                      value={seoMetaDescription}
                      onChange={(e) => setSeoMetaDescription(e.target.value)}
                      className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">
                      Focus Keywords (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                    />
                  </div>

                  <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2 pt-2">
                    Logistics / Search Indexing
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1 flex items-center gap-1">
                      Robots.txt Editor
                      <span className="text-charcoal-light font-medium flex items-center gap-0.5 text-[9px] lowercase bg-background border border-primary/5 px-1 py-0.5 rounded-sm">
                        <Info size={10} /> server index rules
                      </span>
                    </label>
                    <textarea
                      rows={4}
                      value={robotsTxt}
                      onChange={(e) => setRobotsTxt(e.target.value)}
                      className="w-full font-mono px-3.5 py-2 border border-primary/10 rounded-lg text-xs bg-primary-dark/5 text-primary focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Footer Action buttons */}
            <div className="bg-background px-6 py-4 border-t border-primary/5 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary text-secondary rounded-lg font-display font-bold text-sm shadow-md hover:bg-primary-light transition-all cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default Settings;
