import express from "express";
import {
  addCategory,
  editCategory,
  deleteCategory,
  getCategories
} from "../controllers/categoryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, addCategory);
router.put("/:id", authMiddleware, adminMiddleware, editCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

export default router;
