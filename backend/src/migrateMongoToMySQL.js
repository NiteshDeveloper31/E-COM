import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { connectMySQL } from "./config/mysql.js";

// Mongoose Models
import MongoProduct from "./models/Product.js";
import MongoCategory from "./models/Category.js";
import MongoUser from "./models/User.js";
import MongoOrder from "./models/Order.js";
import MongoBanner from "./models/Banner.js";

// MySQL Sequelize Models
import ProductMySQL from "./models/mysql/Product.js";
import CategoryMySQL from "./models/mysql/Category.js";
import UserMySQL from "./models/mysql/User.js";
import OrderMySQL from "./models/mysql/Order.js";
import BannerMySQL from "./models/mysql/Banner.js";

export const migrateMongoToMySQL = async () => {
  try {
    console.log("🔄 Starting MongoDB ➔ MySQL Full Data Migration...");
    await connectMySQL();
    await connectDB();

    // 1. Migrate Categories
    const mongoCategories = await MongoCategory.find();
    console.log(`📦 Found ${mongoCategories.length} Categories in MongoDB...`);
    const categoryMap = {}; // Mongo _id -> MySQL id

    for (const mCat of mongoCategories) {
      const slug = mCat.slug || mCat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const [sqlCat] = await CategoryMySQL.findOrCreate({
        where: { slug },
        defaults: {
          name: mCat.name,
          slug,
          image: mCat.image,
          status: mCat.status || "Active"
        }
      });
      categoryMap[mCat._id.toString()] = sqlCat.id;
    }
    console.log("✅ Categories migrated to MySQL!");

    // 2. Migrate Products
    const mongoProducts = await MongoProduct.find();
    console.log(`🛍️ Found ${mongoProducts.length} Products in MongoDB...`);

    for (const mProd of mongoProducts) {
      const sqlCatId = categoryMap[mProd.category?.toString()] || null;
      const sku = mProd.sku || `RS-${mProd.name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await ProductMySQL.findOrCreate({
        where: { sku },
        defaults: {
          name: mProd.name,
          sku,
          description: mProd.description || "",
          shortDescription: mProd.shortDescription || "",
          price: mProd.price || 0,
          compareAtPrice: mProd.compareAtPrice || null,
          categoryId: sqlCatId,
          stock: mProd.stock != null ? mProd.stock : 0,
          status: mProd.status || "Active",
          image: mProd.image || "",
          images: mProd.images || [],
          video: mProd.video || "",
          weight: mProd.weight || "",
          ingredients: mProd.ingredients || [],
          benefits: mProd.benefits || [],
          brand: mProd.brand || "ReetSutra",
          gst: mProd.gst || 0,
          hsnCode: mProd.hsnCode || "",
          eanCode: mProd.eanCode || "",
          isBundle: Boolean(mProd.isBundle),
          bundleItems: mProd.bundleItems || []
        }
      });
    }
    console.log("✅ Products migrated to MySQL!");

    // 3. Migrate Users
    const mongoUsers = await MongoUser.find();
    console.log(`👤 Found ${mongoUsers.length} Users in MongoDB...`);
    const userMap = {};

    for (const mUser of mongoUsers) {
      const [sqlUser] = await UserMySQL.findOrCreate({
        where: { email: mUser.email },
        defaults: {
          name: mUser.name,
          email: mUser.email,
          password: mUser.password, // Keep hashed password as-is
          phone: mUser.phone || "",
          role: mUser.role === "superadmin" ? "admin" : (mUser.role || "customer"),
          status: "Active"
        }
      });
      userMap[mUser._id.toString()] = sqlUser.id;
    }
    console.log("✅ Users migrated to MySQL!");

    // 4. Migrate Orders
    const mongoOrders = await MongoOrder.find();
    console.log(`📋 Found ${mongoOrders.length} Orders in MongoDB...`);

    for (const mOrd of mongoOrders) {
      const sqlUserId = userMap[mOrd.userId?.toString()] || null;
      const orderCode = mOrd.orderCode || `RS_${String(mOrd._id).slice(-4).toUpperCase()}`;

      await OrderMySQL.findOrCreate({
        where: { orderCode },
        defaults: {
          orderCode,
          userId: sqlUserId,
          customerName: mOrd.customerName || "Customer",
          customerEmail: mOrd.customerEmail || "",
          customerPhone: mOrd.customerPhone || "",
          subtotal: mOrd.subtotal || 0,
          tax: mOrd.tax || 0,
          shipping: mOrd.shipping || 0,
          total: mOrd.total || 0,
          paymentMethod: mOrd.paymentMethod || "COD",
          paymentStatus: mOrd.paymentStatus || "Pending",
          orderStatus: mOrd.orderStatus || "Pending",
          shippingCourier: mOrd.shippingCourier || "",
          trackingNumber: mOrd.trackingNumber || "",
          packetNumber: mOrd.packetNumber || "",
          shippingAddress: mOrd.shippingAddress || {},
          items: mOrd.items || [],
          timeline: mOrd.timeline || []
        }
      });
    }
    console.log("✅ Orders migrated to MySQL!");

    console.log("🎉 SUCCESS: All MongoDB Data migrated to MySQL successfully!");
  } catch (err) {
    console.error("❌ Migration Error:", err.message);
  }
};

export default migrateMongoToMySQL;
