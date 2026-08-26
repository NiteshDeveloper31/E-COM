import express from "express";
import {
  getPublicRecipes,
  getAllRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe
} from "../controllers/recipeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public route for Frontend
router.get("/", getPublicRecipes);

// Protected Admin routes
router.get("/admin", authMiddleware, adminMiddleware, getAllRecipes);
router.post("/", authMiddleware, adminMiddleware, createRecipe);
router.put("/:id", authMiddleware, adminMiddleware, updateRecipe);
router.delete("/:id", authMiddleware, adminMiddleware, deleteRecipe);

export default router;
