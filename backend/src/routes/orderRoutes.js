import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Protected Customer/Admin routes
router.post("/", authMiddleware, createOrder);
router.post("/razorpay/create", authMiddleware, createRazorpayOrder);
router.post("/razorpay/verify", authMiddleware, verifyRazorpayPayment);
router.get("/my-orders", authMiddleware, getUserOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/cancel", authMiddleware, cancelOrder);

// Admin only routes
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
