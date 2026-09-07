import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "ReetSutra Traditional Foods" },
  storeTagline: { type: String, default: "रीत हमारी, स्वाद हमारा, साथ अपनों का" },
  contactEmail: { type: String, default: "hello@reetsutra.com" },
  contactPhone: { type: String, default: "+91 76439 30659" },
  contactAddress: { type: String, default: "Patna, Bihar, India" },
  freeSampleOffer: { type: Boolean, default: true },

  // Social Media Links
  socialInstagram: { type: String, default: "https://instagram.com/reetsutra" },
  socialFacebook: { type: String, default: "https://facebook.com/reetsutra" },
  socialYoutube: { type: String, default: "https://youtube.com/@reetsutra" },
  socialTelegram: { type: String, default: "https://t.me/reetsutra" },
  socialWhatsapp: { type: String, default: "https://wa.me/917643930659" },
  socialTwitter: { type: String, default: "https://twitter.com/reetsutra" },
  socialLinkedin: { type: String, default: "https://linkedin.com/company/reetsutra" },

  seoTitle: { type: String, default: "ReetSutra | Authentic Traditional Sweets & Snacks" },
  seoMetaDescription: { type: String, default: "Shop authentic handcrafted Indian traditional foods." },
  seoKeywords: { type: String, default: "Thekua, Sattu, Khaja, Ghee, Pickles" },

  // Our Story / About Us Dynamic Content
  ourStoryTitle: { type: String, default: "Restoring the Forgotten Flavors of Bihar" },
  ourStorySubtitle: { type: String, default: "OUR MISSION" },
  ourStoryDescription: { type: String, default: "ReetSutra is built on three pillars: Heritage preservation, premium natural quality, and direct empowerment of rural women collectives. We believe traditional recipes are sacred cultural trusts that deserve to be celebrated globally." },
  womenTitle: { type: String, default: "Empowering Rural Women Collectives" },
  womenDesc1: { type: String, default: "At the heart of ReetSutra is our collaboration with local Self-Help Groups (SHGs) across districts like Nalanda, Gaya, Madhubani, and Patna. These home chefs are master guardians of culinary methods developed over centuries." },
  womenDesc2: { type: String, default: "By offering complete infrastructure training, fair pricing, and direct digital supply chains, we enable local women to achieve absolute financial security. When you buy a pack of Thekua or hand-pounded Tilkut, your money goes directly into a woman artisan's bank account." },
  artisanCount: { type: String, default: "150+" },
  districtsCount: { type: String, default: "12+" },
  ourStoryImage: { type: String, default: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80" }
}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
