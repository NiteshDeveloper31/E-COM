import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

// Import Routers
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import grnRoutes from "./routes/grnRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";

import User from "./models/User.js";
import Category from "./models/Category.js";
import { hashPassword } from "./utils/password.js";

// Load Environment variables
dotenv.config();

// Connect to MongoDB & auto-seed admin & categories
connectDB().then(async () => {
  try {
    // Drop legacy unique index on username if present in database
    await User.collection.dropIndex("username_1").catch(() => {});

    const adminExists = await User.findOne({ email: "admin@reetsutra.com" });
    if (!adminExists) {
      const hashedPassword = await hashPassword("admin123");
      await User.create({
        name: "Super Admin",
        email: "admin@reetsutra.com",
        password: hashedPassword,
        role: "superadmin",
        permissions: ["dashboard", "products", "inventory", "categories", "orders", "customers", "banners", "coupons", "analytics", "settings", "profile"]
      });
      console.log("✅ Default superadmin seeded (admin@reetsutra.com / admin123)");
    } else if (adminExists.role !== "superadmin") {
      adminExists.role = "superadmin";
      adminExists.permissions = ["dashboard", "products", "inventory", "categories", "orders", "customers", "banners", "coupons", "analytics", "settings", "profile"];
      await adminExists.save();
      console.log("✅ Updated admin@reetsutra.com role to superadmin");
    }

    // Seed default categories if empty
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const defaultCategories = [
        { name: 'Pickles', displayName: 'Pickle', image: '/images/mango_pickle.jpg', description: 'Traditional Bihari pickles made with authentic spices', slug: 'pickles' },
        { name: 'Ghee', displayName: 'Ghee', image: '/images/desi_cow_ghee.jpg', description: 'Pure A2 Bilona Cow Ghee', slug: 'ghee' },
        { name: 'Makhana', displayName: 'Makhana', image: '/images/makhana.jpg', description: 'Light & crunchy roasted makhana', slug: 'makhana' },
        { name: 'Thekua', displayName: 'Thekua', image: '/images/thekua.jpg', description: 'Authentic Bihari cookie made with jaggery & ghee', slug: 'thekua' },
        { name: 'Honey', displayName: 'Theney', image: '/images/honey.jpg', description: 'Pure natural wild forest honey', slug: 'honey' },
        { name: 'Sattu', displayName: 'Sattu', image: '/images/sattu.jpg', description: 'Traditional roasted chana sattu flour', slug: 'sattu' },
        { name: 'Snacks', displayName: 'Snacks', image: '/images/snacks.jpg', description: 'Authentic Bihari savory snacks', slug: 'snacks' },
        { name: 'Gift Boxes', displayName: 'Gift Boxes', image: '/images/premium_combo_box.jpg', description: 'Curated premium gift boxes', slug: 'gift-boxes' }
      ];
      await Category.insertMany(defaultCategories);
      console.log("✅ Default 8 categories seeded successfully");
    }
  } catch (err) {
    console.error("Seed check failed:", err.message);
  }
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Support large base64 image strings
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Basic Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ReetSutra Backend API is live and healthy.",
    timestamp: new Date()
  });
});

// Register Api Route Mappings
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/grn", grnRoutes);
app.use("/api/coupons", couponRoutes);

// Catch-all 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Centralized error handling middleware (must be registered last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
