import React, { useState } from "react";
import { Settings as SettingsIcon, Globe, Phone, ShieldCheck, Check, Info, BookOpen } from "lucide-react";
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

  // Dynamic Our Story Content States
  const [ourStoryTitle, setOurStoryTitle] = useState(settings?.ourStoryTitle || "Restoring the Forgotten Flavors of Bihar");
  const [ourStorySubtitle, setOurStorySubtitle] = useState(settings?.ourStorySubtitle || "OUR MISSION");
  const [ourStoryDescription, setOurStoryDescription] = useState(settings?.ourStoryDescription || "ReetSutra is built on three pillars: Heritage preservation, premium natural quality, and direct empowerment of rural women collectives.");
  const [womenTitle, setWomenTitle] = useState(settings?.womenTitle || "Empowering Rural Women Collectives");
  const [womenDesc1, setWomenDesc1] = useState(settings?.womenDesc1 || "At the heart of ReetSutra is our collaboration with local Self-Help Groups (SHGs) across districts like Nalanda, Gaya, Madhubani, and Patna.");
  const [womenDesc2, setWomenDesc2] = useState(settings?.womenDesc2 || "By offering complete infrastructure training, fair pricing, and direct digital supply chains, we enable local women to achieve absolute financial security.");
  const [artisanCount, setArtisanCount] = useState(settings?.artisanCount || "150+");
  const [districtsCount, setDistrictsCount] = useState(settings?.districtsCount || "12+");
  const [ourStoryImage, setOurStoryImage] = useState(settings?.ourStoryImage || "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80");

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
      if (settings.ourStoryTitle) setOurStoryTitle(settings.ourStoryTitle);
      if (settings.ourStorySubtitle) setOurStorySubtitle(settings.ourStorySubtitle);
      if (settings.ourStoryDescription) setOurStoryDescription(settings.ourStoryDescription);
      if (settings.womenTitle) setWomenTitle(settings.womenTitle);
      if (settings.womenDesc1) setWomenDesc1(settings.womenDesc1);
      if (settings.womenDesc2) setWomenDesc2(settings.womenDesc2);
      if (settings.artisanCount) setArtisanCount(settings.artisanCount);
      if (settings.districtsCount) setDistrictsCount(settings.districtsCount);
      if (settings.ourStoryImage) setOurStoryImage(settings.ourStoryImage);
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
      robotsTxt,
      ourStoryTitle,
      ourStorySubtitle,
      ourStoryDescription,
      womenTitle,
      womenDesc1,
      womenDesc2,
      artisanCount,
      districtsCount,
      ourStoryImage
    };

    await updateSettings(payload);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: "general", label: "General & Branding", icon: SettingsIcon },
    { id: "contact", label: "Contact & Socials", icon: Phone },
    { id: "story", label: "Our Story Page", icon: BookOpen }
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Settings Configuration
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Configure default taxes, store metadata, contact details, and Our Story content.
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
                        Store Logo URL
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
                </div>
              )}

              {/* --- CONTACT & SOCIAL SETTINGS --- */}
              {activeTab === "contact" && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2">
                    Customer Service Coordinates
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">
                        Contact Support Email
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
                        Contact Helpline Phone
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-primary mb-1">
                        Store HQ Address
                      </label>
                      <textarea
                        rows={2}
                        value={contactAddress}
                        onChange={(e) => setContactAddress(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- OUR STORY CONTENT SETTINGS --- */}
              {activeTab === "story" && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2">
                    Our Story & Mission Content (/about)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Mission Subtitle / Badge</label>
                      <input
                        type="text"
                        value={ourStorySubtitle}
                        onChange={(e) => setOurStorySubtitle(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Mission Main Title</label>
                      <input
                        type="text"
                        value={ourStoryTitle}
                        onChange={(e) => setOurStoryTitle(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Mission Description / Narrative</label>
                    <textarea
                      rows={3}
                      value={ourStoryDescription}
                      onChange={(e) => setOurStoryDescription(e.target.value)}
                      className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                    />
                  </div>

                  <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2 pt-2">
                    Women Empowerment Section
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Section Heading</label>
                    <input
                      type="text"
                      value={womenTitle}
                      onChange={(e) => setWomenTitle(e.target.value)}
                      className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Paragraph 1</label>
                      <textarea
                        rows={3}
                        value={womenDesc1}
                        onChange={(e) => setWomenDesc1(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Paragraph 2</label>
                      <textarea
                        rows={3}
                        value={womenDesc2}
                        onChange={(e) => setWomenDesc2(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Artisan Chefs Count</label>
                      <input
                        type="text"
                        value={artisanCount}
                        onChange={(e) => setArtisanCount(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Rural Districts Count</label>
                      <input
                        type="text"
                        value={districtsCount}
                        onChange={(e) => setDistrictsCount(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Story Feature Image URL</label>
                      <input
                        type="text"
                        value={ourStoryImage}
                        onChange={(e) => setOurStoryImage(e.target.value)}
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
