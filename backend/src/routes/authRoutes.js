import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  createSubAdmin,
  getSubAdmins,
  updateSubAdmin,
  deleteSubAdmin,
  sendOTP,
  verifyOTPLogin,
  registerWithOTP,
  changePhoneWithOTP,
  changeEmailWithOTP
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp-login", verifyOTPLogin);
router.post("/verify-otp-register", registerWithOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected user routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/change-phone", authMiddleware, changePhoneWithOTP);
router.post("/change-email", authMiddleware, changeEmailWithOTP);

// Protected Super Admin Sub-Admin Management routes
router.post("/subadmins", authMiddleware, createSubAdmin);
router.get("/subadmins", authMiddleware, getSubAdmins);
router.put("/subadmins/:id", authMiddleware, updateSubAdmin);
router.delete("/subadmins/:id", authMiddleware, deleteSubAdmin);

export default router;
