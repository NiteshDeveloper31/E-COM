import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
import recipeRoutes from "./routes/recipeRoutes.js";
import { seedDefaultRecipes } from "./controllers/recipeController.js";

import User from "./models/User.js";
import Category from "./models/Category.js";
import Banner from "./models/Banner.js";
import { hashPassword } from "./utils/password.js";

import { seedMySQLData } from "./seedMySQL.js";

// Load Environment variables
dotenv.config();

// Initialize MySQL Database connection
seedMySQLData();

// Connect to MongoDB & auto-seed admin & categories
connectDB().then(async () => {
  try {
    // Drop legacy unique index on username if present in database
    await User.collection.dropIndex("username_1").catch(() => {});

    // Auto-update legacy .jpg category image paths in database
    await Category.updateMany({ image: '/images/thekua.jpg' }, { image: '/images/thekua.jpeg' }).catch(() => {});
    await Category.updateMany({ image: '/images/desi_cow_ghee.jpg' }, { image: '/images/desi_cow_ghee.jpeg' }).catch(() => {});

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



    // Seed default permanent hero banner if empty
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.create({
        title: "The Taste of Bihar, Crafted with Tradition",
        subtitle: "Every Bite, A Story of Bihar, Shared With Loved Ones.",
        bannerType: "Permanent",
        targetDevice: "Both",
        desktopImage: "/assets/Final_Banner_Img_web.png",
        mobileImage: "/assets/Mobile_view_Banner_image.jpg",
        image: "/assets/Final_Banner_Img_web.png",
        buttonText: "SHOP NOW",
        buttonLink: "/shop",
        status: "Active",
        placement: "Main Hero Permanent"
      });
      console.log("✅ Default Permanent Banner seeded successfully");
    }

    await seedDefaultRecipes();
  } catch (err) {
    console.error("Seed check failed:", err.message);
  }
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Support large base64 image strings
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
app.use("/api/recipes", recipeRoutes);

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
