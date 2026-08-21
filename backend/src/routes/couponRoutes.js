import express from "express";
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} from "../controllers/couponController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public validation route for cart/checkout
router.post("/validate", validateCoupon);

// Admin-protected CRUD routes
router.get("/", authMiddleware, adminMiddleware, getCoupons);
router.post("/", authMiddleware, adminMiddleware, createCoupon);
router.get("/:id", authMiddleware, adminMiddleware, getCouponById);
router.put("/:id", authMiddleware, adminMiddleware, updateCoupon);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCoupon);

export default router;
