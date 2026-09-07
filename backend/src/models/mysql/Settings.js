import { DataTypes } from "sequelize";
import { sequelize } from "../../config/mysql.js";

const SettingsMySQL = sequelize.define(
  "Settings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    storeName: {
      type: DataTypes.STRING,
      defaultValue: "ReetSutra Traditional Foods"
    },
    storeTagline: {
      type: DataTypes.STRING,
      defaultValue: "रीत हमारी, स्वाद हमारा, साथ अपनों का"
    },
    contactEmail: {
      type: DataTypes.STRING,
      defaultValue: "hello@reetsutra.com"
    },
    contactPhone: {
      type: DataTypes.STRING,
      defaultValue: "+91 76439 30659"
    },
    contactAddress: {
      type: DataTypes.STRING,
      defaultValue: "Patna, Bihar, India"
    },
    freeSampleOffer: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    socialInstagram: {
      type: DataTypes.STRING,
      defaultValue: "https://instagram.com/reetsutra"
    },
    socialFacebook: {
      type: DataTypes.STRING,
      defaultValue: "https://facebook.com/reetsutra"
    },
    socialYoutube: {
      type: DataTypes.STRING,
      defaultValue: "https://youtube.com/@reetsutra"
    },
    socialTelegram: {
      type: DataTypes.STRING,
      defaultValue: "https://t.me/reetsutra"
    },
    socialWhatsapp: {
      type: DataTypes.STRING,
      defaultValue: "https://wa.me/917643930659"
    },
    socialTwitter: {
      type: DataTypes.STRING,
      defaultValue: "https://twitter.com/reetsutra"
    },
    socialLinkedin: {
      type: DataTypes.STRING,
      defaultValue: "https://linkedin.com/company/reetsutra"
    },
    seoTitle: {
      type: DataTypes.STRING,
      defaultValue: "ReetSutra | Authentic Traditional Sweets & Snacks"
    },
    seoMetaDescription: {
      type: DataTypes.TEXT,
      defaultValue: "Shop authentic handcrafted Indian traditional foods."
    },
    seoKeywords: {
      type: DataTypes.STRING,
      defaultValue: "Thekua, Sattu, Khaja, Ghee, Pickles"
    },
    ourStoryTitle: {
      type: DataTypes.STRING,
      defaultValue: "Restoring the Forgotten Flavors of Bihar"
    },
    ourStorySubtitle: {
      type: DataTypes.STRING,
      defaultValue: "OUR MISSION"
    },
    ourStoryDescription: {
      type: DataTypes.TEXT,
      defaultValue: "ReetSutra is built on three pillars: Heritage preservation, premium natural quality, and direct empowerment of rural women collectives."
    },
    womenTitle: {
      type: DataTypes.STRING,
      defaultValue: "Empowering Rural Women Collectives"
    },
    womenDesc1: {
      type: DataTypes.TEXT,
      defaultValue: "At the heart of ReetSutra is our collaboration with local Self-Help Groups across districts."
    },
    womenDesc2: {
      type: DataTypes.TEXT,
      defaultValue: "By offering complete infrastructure training, fair pricing, and direct digital supply chains, we enable local women to achieve absolute financial security."
    },
    artisanCount: {
      type: DataTypes.STRING,
      defaultValue: "150+"
    },
    districtsCount: {
      type: DataTypes.STRING,
      defaultValue: "12+"
    },
    ourStoryImage: {
      type: DataTypes.STRING,
      defaultValue: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80"
    }
  },
  {
    timestamps: true,
    tableName: "settings"
  }
);

export default SettingsMySQL;
