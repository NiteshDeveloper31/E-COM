import React, { useState } from "react";
import { Settings as SettingsIcon, Globe, Phone, ShieldCheck, Check, Info, BookOpen, Plus, Trash2, Edit3, Clock, Sparkles, Utensils, Eye, X, Gift, Tag } from "lucide-react";
import { useData } from "../context/DataContext";
import { getAdminImageUrl as getAdminImageUrlConfig } from "../config";

export const Settings = () => {
  const { settings, updateSettings, recipes, addRecipe, updateRecipe, deleteRecipe } = useData();
  const [activeTab, setActiveTab] = useState("general");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states initialized from context settings
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline);
  const [storeLogo, setStoreLogo] = useState(settings.storeLogo);
  const [freeSampleOffer, setFreeSampleOffer] = useState(() => settings?.freeSampleOffer !== false);
  const [currency, setCurrency] = useState(settings.currency);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [orderPrefix, setOrderPrefix] = useState(settings.orderPrefix);

  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || "hello@reetsutra.com");
  const [contactPhone, setContactPhone] = useState(settings?.contactPhone || "+91 76439 30659");
  const [contactAddress, setContactAddress] = useState(settings?.contactAddress || "Patna, Bihar, India");

  const [socialInstagram, setSocialInstagram] = useState(settings?.socialInstagram || "https://instagram.com/reetsutra");
  const [socialFacebook, setSocialFacebook] = useState(settings?.socialFacebook || "https://facebook.com/reetsutra");
  const [socialYoutube, setSocialYoutube] = useState(settings?.socialYoutube || "https://youtube.com/@reetsutra");
  const [socialTelegram, setSocialTelegram] = useState(settings?.socialTelegram || "https://t.me/reetsutra");
  const [socialWhatsapp, setSocialWhatsapp] = useState(settings?.socialWhatsapp || "https://wa.me/917643930659");
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

  // Recipe Card Form States
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeCategory, setRecipeCategory] = useState("Sweets");
  const [recipeImage, setRecipeImage] = useState("");
  const [recipePrepTime, setRecipePrepTime] = useState("15 Mins");
  const [recipeCookTime, setRecipeCookTime] = useState("25 Mins");
  const [recipeServings, setRecipeServings] = useState("4 Servings");
  const [recipeShortDesc, setRecipeShortDesc] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [recipeInstructions, setRecipeInstructions] = useState("");
  const [recipeTag, setRecipeTag] = useState("Festive Special");
  const [recipeAuthor, setRecipeAuthor] = useState("ReetSutra Kitchen");
  const [recipeStatus, setRecipeStatus] = useState("Active");
  const [isRecipeSaving, setIsRecipeSaving] = useState(false);

  React.useEffect(() => {
    if (settings) {
      if (settings.storeName) setStoreName(settings.storeName);
      if (settings.freeSampleOffer !== undefined) {
        const isOfferActive = settings.freeSampleOffer === true || settings.freeSampleOffer === 'true' || settings.freeSampleOffer === 1 || settings.freeSampleOffer === '1';
        setFreeSampleOffer(isOfferActive);
      }
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
    try {
      setIsSaving(true);
      const payload = {
        storeName,
        storeTagline,
        storeLogo,
        freeSampleOffer,
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
    } finally {
      setIsSaving(false);
    }
  };

  const openNewRecipeModal = () => {
    setEditingRecipe(null);
    setRecipeTitle("");
    setRecipeCategory("Sweets");
    setRecipeImage("");
    setRecipePrepTime("15 Mins");
    setRecipeCookTime("25 Mins");
    setRecipeServings("4 Servings");
    setRecipeShortDesc("");
    setRecipeIngredients("");
    setRecipeInstructions("");
    setRecipeTag("Festive Special");
    setRecipeAuthor("ReetSutra Kitchen");
    setRecipeStatus("Active");
    setIsRecipeModalOpen(true);
  };

  const openEditRecipeModal = (recipe) => {
    setEditingRecipe(recipe);
    setRecipeTitle(recipe.title || "");
    setRecipeCategory(recipe.category || "Sweets");
    setRecipeImage(recipe.image || "");
    setRecipePrepTime(recipe.prepTime || "15 Mins");
    setRecipeCookTime(recipe.cookTime || "25 Mins");
    setRecipeServings(recipe.servings || "4 Servings");
    setRecipeShortDesc(recipe.shortDescription || "");
    setRecipeIngredients(Array.isArray(recipe.ingredients) ? recipe.ingredients.join("\n") : (recipe.ingredients || ""));
    setRecipeInstructions(recipe.instructions || "");
    setRecipeTag(recipe.tag || "Festive Special");
    setRecipeAuthor(recipe.author || "ReetSutra Kitchen");
    setRecipeStatus(recipe.status || "Active");
    setIsRecipeModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert("Image file size should be less than 15MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecipeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();
    if (isRecipeSaving) return;
    setIsRecipeSaving(true);

    try {
      const payload = {
        title: recipeTitle,
        category: recipeCategory,
        image: recipeImage,
        prepTime: recipePrepTime,
        cookTime: recipeCookTime,
        servings: recipeServings,
        shortDescription: recipeShortDesc || "Traditional Bihari Delicacy Recipe",
        description: recipeShortDesc || "Traditional Bihari Delicacy Recipe",
        ingredients: recipeIngredients ? recipeIngredients.split("\n").map(i => i.trim()).filter(Boolean) : [],
        instructions: recipeInstructions || "Prepared following traditional handcrafting steps.",
        tag: recipeTag,
        author: recipeAuthor,
        status: recipeStatus
      };

      if (editingRecipe) {
        await updateRecipe(editingRecipe._id || editingRecipe.id, payload);
      } else {
        await addRecipe(payload);
      }
      setIsRecipeModalOpen(false);
    } catch (err) {
      console.error("Failed to save recipe:", err);
    } finally {
      setIsRecipeSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General & Branding", icon: SettingsIcon },
    { id: "contact", label: "Contact & Socials", icon: Phone },
    { id: "story", label: "Our Story Page", icon: BookOpen },
    { id: "recipes", label: "Recipes & Blog", icon: Utensils }
  ];

  const getAdminImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("http")) return url;
    return getAdminImageUrlConfig(url);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary leading-tight">
            Settings Configuration
          </h1>
          <p className="text-sm text-charcoal-light font-medium">
            Configure store branding, contact details, story content, and Recipe/Blog cards.
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
                type="button"
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
          {activeTab === "recipes" ? (
            <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/5 pb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-primary">
                    Recipes & Culinary Blog Cards
                  </h3>
                  <p className="text-xs text-charcoal-light">
                    Add, edit, or remove traditional Bihari recipe cards and blog posts for website visitors.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewRecipeModal}
                  className="px-4 py-2.5 bg-primary text-secondary rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-primary-light transition-all cursor-pointer shrink-0"
                >
                  <Plus size={16} /> Add Recipe / Blog Card
                </button>
              </div>

              {/* Recipe Cards Grid */}
              {recipes && recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {recipes.map((rec) => (
                    <div
                      key={rec._id || rec.id}
                      className="bg-background rounded-xl border border-primary/10 overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={getAdminImageUrl(rec.image)}
                          alt={rec.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80";
                          }}
                        />
                        <div className="absolute top-3 left-3 bg-primary/90 text-secondary px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {rec.category || "Recipe"}
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-primary px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm">
                          {rec.tag || "Special"}
                        </div>
                      </div>

                      <div className="p-4 space-y-2 flex-1">
                        <h4 className="font-display font-bold text-sm text-primary line-clamp-1">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-charcoal-light line-clamp-2 leading-relaxed">
                          {rec.shortDescription}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold pt-1 border-t border-primary/5">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-secondary" /> {rec.prepTime} Prep
                          </span>
                          <span>•</span>
                          <span>{rec.cookTime} Cook</span>
                          <span className="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            {rec.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-white border-t border-primary/5 flex items-center justify-between">
                        <span className="text-[11px] text-charcoal-light italic font-serif">
                          By {rec.author || "ReetSutra Kitchen"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditRecipeModal(rec)}
                            className="p-1.5 text-primary hover:bg-primary/5 rounded-md transition-all cursor-pointer"
                            title="Edit Recipe"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${rec.title}"?`)) {
                                deleteRecipe(rec._id || rec.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                            title="Delete Recipe"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-background rounded-xl border border-dashed border-primary/20 space-y-3">
                  <Utensils className="mx-auto text-primary/40" size={36} />
                  <h4 className="font-display font-bold text-primary text-base">No Recipes or Blog Cards Found</h4>
                  <p className="text-xs text-charcoal-light max-w-md mx-auto">
                    Click the button below to add your first authentic Bihari recipe or culinary blog post.
                  </p>
                  <button
                    type="button"
                    onClick={openNewRecipeModal}
                    className="px-4 py-2 bg-primary text-secondary rounded-lg font-bold text-xs inline-flex items-center gap-2 shadow-sm hover:bg-primary-light transition-all cursor-pointer"
                  >
                    <Plus size={14} /> Add First Recipe Card
                  </button>
                </div>
              )}
            </div>
          ) : (
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

                    {/* FREE SAMPLE OFFER MASTER TOGGLE CARD */}
                    <div className="mt-6 pt-5 border-t border-primary/10 space-y-3">
                      <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2 flex items-center gap-2">
                        <Gift size={18} className="text-secondary" /> Free Sample Offer Configuration
                      </h3>

                      <div className="p-4 bg-background border border-primary/15 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                        <div className="space-y-1">
                          <div className="font-display font-bold text-sm text-primary flex items-center gap-2">
                            <span>Enable Free Sample Selection at Checkout</span>
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                              freeSampleOffer
                                ? "bg-emerald-500 text-white"
                                : "bg-rose-500 text-white"
                            }`}>
                              {freeSampleOffer ? "ACTIVE (ON)" : "DISABLED (OFF)"}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-light font-medium">
                            When enabled, customers can select 1 free sample product during checkout. Switch OFF anytime to disable free samples.
                          </p>
                        </div>

                        {/* ON / OFF Toggle Switch Button */}
                        <button
                          type="button"
                          onClick={async () => {
                            const nextState = !freeSampleOffer;
                            setFreeSampleOffer(nextState);
                            await updateSettings({ ...settings, freeSampleOffer: nextState });
                          }}
                          className={`px-5 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all shadow-sm cursor-pointer shrink-0 ${
                            freeSampleOffer
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-rose-600 hover:bg-rose-700 text-white"
                          }`}
                        >
                          {freeSampleOffer ? "TURN OFFER OFF" : "TURN OFFER ON"}
                        </button>
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
                          Contact Support Phone
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
                        Physical Store Address
                      </label>
                      <input
                        type="text"
                        value={contactAddress}
                        onChange={(e) => setContactAddress(e.target.value)}
                        className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>

                    <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2 pt-4">
                      Social Media Channels
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1">Instagram URL</label>
                        <input
                          type="text"
                          value={socialInstagram}
                          onChange={(e) => setSocialInstagram(e.target.value)}
                          className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1">Facebook URL</label>
                        <input
                          type="text"
                          value={socialFacebook}
                          onChange={(e) => setSocialFacebook(e.target.value)}
                          className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1">YouTube URL</label>
                        <input
                          type="text"
                          value={socialYoutube}
                          onChange={(e) => setSocialYoutube(e.target.value)}
                          className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1">WhatsApp Support Number/Link</label>
                        <input
                          type="text"
                          value={socialWhatsapp}
                          onChange={(e) => setSocialWhatsapp(e.target.value)}
                          className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- OUR STORY PAGE DYNAMIC CONTENT --- */}
                {activeTab === "story" && (
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2">
                      Our Story & Mission Content Configuration
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Our Story Hero Title</label>
                      <input
                        type="text"
                        value={ourStoryTitle}
                        onChange={(e) => setOurStoryTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs sm:text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Our Story Subtitle</label>
                      <input
                        type="text"
                        value={ourStorySubtitle}
                        onChange={(e) => setOurStorySubtitle(e.target.value)}
                        className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs sm:text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Our Story Main Description</label>
                      <textarea
                        rows={3}
                        value={ourStoryDescription}
                        onChange={(e) => setOurStoryDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs sm:text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>

                    <h3 className="font-display font-semibold text-base text-primary border-b border-primary/5 pb-2 pt-2">
                      Women Collectives Section Content
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Women Collectives Heading</label>
                      <input
                        type="text"
                        value={womenTitle}
                        onChange={(e) => setWomenTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs sm:text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Paragraph 1 (Collaboration & SHGs)</label>
                      <textarea
                        rows={3}
                        value={womenDesc1}
                        onChange={(e) => setWomenDesc1(e.target.value)}
                        className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs sm:text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary mb-1">Paragraph 2 (Empowerment & Fair Pricing)</label>
                      <textarea
                        rows={3}
                        value={womenDesc2}
                        onChange={(e) => setWomenDesc2(e.target.value)}
                        className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs sm:text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1">Artisan Chefs Count</label>
                        <input
                          type="text"
                          value={artisanCount}
                          onChange={(e) => setArtisanCount(e.target.value)}
                          className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs sm:text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1">Rural Districts Count</label>
                        <input
                          type="text"
                          value={districtsCount}
                          onChange={(e) => setDistrictsCount(e.target.value)}
                          className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs sm:text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1">Story Feature Image URL</label>
                        <input
                          type="text"
                          value={ourStoryImage}
                          onChange={(e) => setOurStoryImage(e.target.value)}
                          className="w-full px-3 py-2 border border-primary/10 rounded-lg text-xs sm:text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
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
                  disabled={isSaving}
                  className={`px-6 py-2.5 rounded-lg font-display font-bold text-sm shadow-md transition-all flex items-center gap-2 ${
                    isSaving
                      ? "bg-slate-400 text-white cursor-not-allowed opacity-85"
                      : "bg-primary text-secondary hover:bg-primary-light cursor-pointer"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving Configuration...</span>
                    </>
                  ) : (
                    <span>Save Configuration</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT RECIPE MODAL --- */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-primary/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-primary">
                  {editingRecipe ? "Edit Recipe / Blog Card" : "Add New Recipe / Blog Card"}
                </h3>
                <p className="text-xs text-charcoal-light">
                  Fill in the recipe card details, ingredients, and cooking instructions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRecipeModalOpen(false)}
                className="p-2 text-charcoal-light hover:text-primary rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecipeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-primary mb-1">Recipe / Article Title *</label>
                  <input
                    type="text"
                    required
                    value={recipeTitle}
                    onChange={(e) => setRecipeTitle(e.target.value)}
                    placeholder="e.g. Authentic Bihari Wheat & Jaggery Thekua"
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Category</label>
                  <select
                    value={recipeCategory}
                    onChange={(e) => setRecipeCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                  >
                    <option value="Sweets">Sweets</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Pickles">Pickles & Preserves</option>
                    <option value="Healthy Living">Healthy Living</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Tag / Badge</label>
                  <input
                    type="text"
                    value={recipeTag}
                    onChange={(e) => setRecipeTag(e.target.value)}
                    placeholder="e.g. Festive Special, Superfood"
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={recipePrepTime}
                    onChange={(e) => setRecipePrepTime(e.target.value)}
                    placeholder="e.g. 15 Mins"
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Cook Time</label>
                  <input
                    type="text"
                    value={recipeCookTime}
                    onChange={(e) => setRecipeCookTime(e.target.value)}
                    placeholder="e.g. 25 Mins"
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Servings</label>
                  <input
                    type="text"
                    value={recipeServings}
                    onChange={(e) => setRecipeServings(e.target.value)}
                    placeholder="e.g. 4 Servings"
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Author Name</label>
                  <input
                    type="text"
                    value={recipeAuthor}
                    onChange={(e) => setRecipeAuthor(e.target.value)}
                    placeholder="e.g. ReetSutra Kitchen"
                    className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Recipe Card Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={recipeImage}
                    onChange={(e) => setRecipeImage(e.target.value)}
                    placeholder="Image URL or upload file below"
                    className="flex-1 px-3.5 py-2 border border-primary/10 rounded-lg text-xs sm:text-sm bg-background focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-lg cursor-pointer shrink-0">
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {recipeImage && (
                  <div className="mt-2 h-20 w-32 rounded-lg overflow-hidden border border-primary/10">
                    <img src={getAdminImageUrl(recipeImage)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Short Description / Card Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={recipeShortDesc}
                  onChange={(e) => setRecipeShortDesc(e.target.value)}
                  placeholder="Brief 2-line summary displayed on the card..."
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Ingredients (1 item per line)</label>
                <textarea
                  rows={4}
                  value={recipeIngredients}
                  onChange={(e) => setRecipeIngredients(e.target.value)}
                  placeholder="2 cups Whole Wheat Flour&#10;1 cup Organic Jaggery&#10;1/2 cup Pure Desi Cow Ghee"
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Step-by-Step Cooking Instructions / Full Recipe *</label>
                <textarea
                  rows={5}
                  required
                  value={recipeInstructions}
                  onChange={(e) => setRecipeInstructions(e.target.value)}
                  placeholder="1. Melt jaggery in warm water...&#10;2. Mix flour with warm ghee...&#10;3. Deep fry on low flame..."
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Card Status</label>
                <select
                  value={recipeStatus}
                  onChange={(e) => setRecipeStatus(e.target.value)}
                  className="w-full px-3.5 py-2 border border-primary/10 rounded-lg text-sm bg-background focus:outline-none"
                >
                  <option value="Active">Active (Visible on Website)</option>
                  <option value="Inactive">Inactive (Draft / Hidden)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-primary/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="px-4 py-2 text-charcoal-light hover:text-primary font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecipeSaving}
                  className="px-6 py-2.5 bg-primary text-secondary rounded-lg font-bold text-xs shadow-md hover:bg-primary-light transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecipeSaving ? "Saving..." : (editingRecipe ? "Update Recipe Card" : "Create Recipe Card")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default Settings;
