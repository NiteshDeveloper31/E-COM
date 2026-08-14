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

  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || "hello@reetsutra.com");
  const [contactPhone, setContactPhone] = useState(settings?.contactPhone || "+91 91234 56789");
  const [contactAddress, setContactAddress] = useState(settings?.contactAddress || "Patna, Bihar, India");

  const [socialInstagram, setSocialInstagram] = useState(settings?.socialInstagram || "https://instagram.com/reetsutra");
  const [socialFacebook, setSocialFacebook] = useState(settings?.socialFacebook || "https://facebook.com/reetsutra");
  const [socialYoutube, setSocialYoutube] = useState(settings?.socialYoutube || "https://youtube.com/@reetsutra");
  const [socialTelegram, setSocialTelegram] = useState(settings?.socialTelegram || "https://t.me/reetsutra");
  const [socialWhatsapp, setSocialWhatsapp] = useState(settings?.socialWhatsapp || "https://wa.me/919123456789");
  const [socialTwitter, setSocialTwitter] = useState(settings?.socialTwitter || "https://twitter.com/reetsutra");
  const [socialLinkedin, setSocialLinkedin] = useState(settings?.socialLinkedin || "https://linkedin.com/company/reetsutra");

  const [seoTitle, setSeoTitle] = useState(settings?.seoTitle || "");
  const [seoMetaDescription, setSeoMetaDescription] = useState(settings?.seoMetaDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(settings?.seoKeywords || "");
  const [robotsTxt, setRobotsTxt] = useState(settings?.robotsTxt || "User-agent: *\nAllow: /");

  React.useEffect(() => {
    if (settings) {
      if (settings.storeName) setStoreName(settings.storeName);
      if (settings.contactEmail) setContactEmail(settings.contactEmail);
      if (settings.contactPhone) setContactPhone(settings.contactPhone);
      if (settings.contactAddress) setContactAddress(settings.contactAddress);
      if (settings.socialInstagram) setSocialInstagram(settings.socialInstagram);
      if (settings.socialFacebook) setSocialFacebook(settings.socialFacebook);
      if (settings.socialYoutube) setSocialYoutube(settings.socialYoutube);
      if (settings.socialTelegram) setSocialTelegram(settings.socialTelegram);
      if (settings.socialWhatsapp) setSocialWhatsapp(settings.socialWhatsapp);
      if (settings.socialTwitter) setSocialTwitter(settings.socialTwitter);
      if (settings.socialLinkedin) setSocialLinkedin(settings.socialLinkedin);
    }
  }, [settings]);

  const handleSave = async (e) => {
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
      socialInstagram,
      socialFacebook,
      socialYoutube,
      socialTelegram,
      socialWhatsapp,
      socialTwitter,
      socialLinkedin,
      seoTitle,
      seoMetaDescription,
      seoKeywords,
      robotsTxt
    };

    await updateSettings(payload);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: "general", label: "General & Branding", icon: SettingsIcon },
    { id: "contact", label: "Contact & Socials", icon: Phone }
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
                    <div className="flex items-center gap-3 p-3 bg-background border border-primary/10 rounded-lg self-end h-10">
                      <span className="text-[10px] font-bold text-charcoal-light uppercase">Branding Preview:</span>
                      {storeLogo?.trim() ? (
                        <img
                          src={storeLogo}
                          alt="Logo"
                          className="w-7 h-7 rounded-md border border-secondary object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-primary text-secondary font-bold text-xs flex items-center justify-center border border-secondary/30 shadow-2xs">
                          R
                        </div>
                      )}
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
                        Instagram Profile Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://instagram.com/yourhandle"
                        value={socialInstagram}
                        onChange={(e) => setSocialInstagram(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Facebook Page Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://facebook.com/yourpage"
                        value={socialFacebook}
                        onChange={(e) => setSocialFacebook(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        YouTube Channel Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://youtube.com/@yourchannel"
                        value={socialYoutube}
                        onChange={(e) => setSocialYoutube(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Telegram Channel / Group Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://t.me/yourchannel"
                        value={socialTelegram}
                        onChange={(e) => setSocialTelegram(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        WhatsApp Link / Number
                      </label>
                      <input
                        type="text"
                        placeholder="https://wa.me/919123456789"
                        value={socialWhatsapp}
                        onChange={(e) => setSocialWhatsapp(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        X (Twitter) Profile Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://x.com/yourhandle"
                        value={socialTwitter}
                        onChange={(e) => setSocialTwitter(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-primary mb-1">
                        LinkedIn Page Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://linkedin.com/company/yourcompany"
                        value={socialLinkedin}
                        onChange={(e) => setSocialLinkedin(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
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
