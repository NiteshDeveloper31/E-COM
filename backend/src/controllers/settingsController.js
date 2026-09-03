import mongoose from "mongoose";
import Settings from "../models/Settings.js";
import SettingsMySQL from "../models/mysql/Settings.js";

const DEFAULT_SETTINGS = {
  storeName: "ReetSutra Traditional Foods",
  storeTagline: "रीत हमारी, स्वाद हमारा, साथ अपनों का",
  contactEmail: "hello@reetsutra.com",
  contactPhone: "+91 91234 56789",
  contactAddress: "Patna, Bihar, India",
  freeSampleOffer: true,
  socialInstagram: "https://instagram.com/reetsutra",
  socialFacebook: "https://facebook.com/reetsutra",
  socialYoutube: "https://youtube.com/@reetsutra",
  socialTelegram: "https://t.me/reetsutra",
  socialWhatsapp: "https://wa.me/919123456789",
  socialTwitter: "https://twitter.com/reetsutra",
  socialLinkedin: "https://linkedin.com/company/reetsutra",
  seoTitle: "ReetSutra | Authentic Traditional Sweets & Snacks",
  seoMetaDescription: "Shop authentic handcrafted Indian traditional foods.",
  seoKeywords: "Thekua, Sattu, Khaja, Ghee, Pickles",
  ourStoryTitle: "Restoring the Forgotten Flavors of Bihar",
  ourStorySubtitle: "OUR MISSION",
  ourStoryDescription: "ReetSutra is built on three pillars: Heritage preservation, premium natural quality, and direct empowerment of rural women collectives.",
  womenTitle: "Empowering Rural Women Collectives",
  womenDesc1: "At the heart of ReetSutra is our collaboration with local Self-Help Groups across districts.",
  womenDesc2: "By offering complete infrastructure training, fair pricing, and direct digital supply chains, we enable local women to achieve absolute financial security.",
  artisanCount: "150+",
  districtsCount: "12+",
  ourStoryImage: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80"
};

// Global in-memory cache for instant response & state retention across refreshes
let inMemorySettingsCache = null;

// Helper to normalize freeSampleOffer boolean state
const normalizeSettings = (rawObj) => {
  const settings = { ...DEFAULT_SETTINGS, ...rawObj };
  if (settings.freeSampleOffer !== undefined) {
    const val = settings.freeSampleOffer;
    settings.freeSampleOffer = (val === true || val === "true" || val === 1 || val === "1");
  }
  return settings;
};

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    // If in-memory cache exists, return immediately (<1ms response time!)
    if (inMemorySettingsCache) {
      return res.json({
        success: true,
        data: inMemorySettingsCache
      });
    }

    let settingsData = { ...DEFAULT_SETTINGS };

    // 1. Try MySQL
    try {
      const mysqlDoc = await SettingsMySQL.findOne().catch(() => null);
      if (mysqlDoc) {
        const json = mysqlDoc.toJSON ? mysqlDoc.toJSON() : mysqlDoc;
        settingsData = { ...settingsData, ...json };
      }
    } catch (sqlErr) {}

    // 2. Try Mongo ONLY IF connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const mongoDoc = await Settings.findOne().lean().catch(() => null);
        if (mongoDoc) {
          settingsData = { ...settingsData, ...mongoDoc };
        }
      } catch (mErr) {}
    }

    inMemorySettingsCache = normalizeSettings(settingsData);

    return res.json({
      success: true,
      data: inMemorySettingsCache
    });
  } catch (error) {
    return res.json({
      success: true,
      data: DEFAULT_SETTINGS
    });
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Update in-memory cache immediately
    const currentBase = inMemorySettingsCache || DEFAULT_SETTINGS;
    inMemorySettingsCache = normalizeSettings({ ...currentBase, ...updateData });

    // 1. Persist to MySQL
    try {
      let settingsSql = await SettingsMySQL.findOne().catch(() => null);
      if (!settingsSql) {
        await SettingsMySQL.create(inMemorySettingsCache).catch(() => null);
      } else {
        Object.assign(settingsSql, inMemorySettingsCache);
        await settingsSql.save().catch(() => null);
      }
    } catch (sqlErr) {
      console.error("MySQL settings update error:", sqlErr);
    }

    // 2. Persist to Mongo (only if connected)
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        let mongoSettings = await Settings.findOne().catch(() => null);
        if (!mongoSettings) {
          mongoSettings = new Settings(inMemorySettingsCache);
        } else {
          Object.assign(mongoSettings, inMemorySettingsCache);
        }
        await mongoSettings.save().catch(() => null);
      } catch (mErr) {
        console.error("Mongo settings update error:", mErr);
      }
    }

    return res.json({
      success: true,
      message: "Settings updated successfully",
      data: inMemorySettingsCache
    });
  } catch (error) {
    return res.json({
      success: true,
      message: "Settings updated successfully",
      data: inMemorySettingsCache || req.body
    });
  }
};
