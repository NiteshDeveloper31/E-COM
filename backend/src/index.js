import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

import { seedMySQLData } from "./seedMySQL.js";

// Load Environment variables
dotenv.config();

// Initialize MySQL Database connection
seedMySQLData();

const app = express();

// Enable robust CORS for all origins, headers, methods and preflight requests
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.options("*", cors());

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
