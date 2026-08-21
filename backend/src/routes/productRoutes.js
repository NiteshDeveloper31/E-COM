import express from "express";
import {
  addProduct,
  editProduct,
  deleteProduct,
  getProducts,
  getProductById,
  bulkImportProducts,
  subscribeStockNotification
} from "../controllers/productController.js";
import {
  getProductReviews,
  addProductReview,
  deleteProductReview
} from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/notify", subscribeStockNotification);

// Reviews sub-resource routes
router.get("/:productId/reviews", getProductReviews);
router.post("/:productId/reviews", authMiddleware, addProductReview);
router.delete("/reviews/:reviewId", authMiddleware, deleteProductReview);

// Admin only routes
router.post("/bulk-import", authMiddleware, adminMiddleware, bulkImportProducts);
router.post("/", authMiddleware, adminMiddleware, addProduct);
router.put("/:id", authMiddleware, adminMiddleware, editProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
