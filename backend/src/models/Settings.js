import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "ReetSutra Traditional Foods" },
  storeTagline: { type: String, default: "रीत हमारी, स्वाद हमारा, साथ अपनों का" },
  contactEmail: { type: String, default: "hello@reetsutra.com" },
  contactPhone: { type: String, default: "+91 91234 56789" },
  contactAddress: { type: String, default: "Patna, Bihar, India" },

  // Social Media Links
  socialInstagram: { type: String, default: "https://instagram.com/reetsutra" },
  socialFacebook: { type: String, default: "https://facebook.com/reetsutra" },
  socialYoutube: { type: String, default: "https://youtube.com/@reetsutra" },
  socialTelegram: { type: String, default: "https://t.me/reetsutra" },
  socialWhatsapp: { type: String, default: "https://wa.me/919123456789" },
  socialTwitter: { type: String, default: "https://twitter.com/reetsutra" },
  socialLinkedin: { type: String, default: "https://linkedin.com/company/reetsutra" },

  seoTitle: { type: String, default: "ReetSutra | Authentic Traditional Sweets & Snacks" },
  seoMetaDescription: { type: String, default: "Shop authentic handcrafted Indian traditional foods." },
  seoKeywords: { type: String, default: "Thekua, Sattu, Khaja, Ghee, Pickles" }
}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
