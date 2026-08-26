import express from "express";
import {
  addBanner,
  editBanner,
  deleteBanner,
  getBanners,
  uploadBannerImage
} from "../controllers/bannerController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getBanners);

// Admin only routes
router.post("/upload", authMiddleware, adminMiddleware, uploadBannerImage);
router.post("/", authMiddleware, adminMiddleware, addBanner);
router.put("/:id", authMiddleware, adminMiddleware, editBanner);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBanner);

export default router;
