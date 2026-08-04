import express from "express";
import {
  getCustomerListing,
  getCustomerDetails,
  getCustomerAddresses,
  getCustomerOrderHistory,
  addCustomerAddress,
  updateCustomerAddress,
  setDefaultCustomerAddress,
  deleteCustomerAddress
} from "../controllers/customerController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Routes accessible by authenticated users (Owner/Customer or Admin)
router.get("/:userId/addresses", authMiddleware, getCustomerAddresses);
router.post("/:userId/addresses", authMiddleware, addCustomerAddress);
router.put("/:userId/addresses/:addressId", authMiddleware, updateCustomerAddress);
router.patch("/:userId/addresses/:addressId/default", authMiddleware, setDefaultCustomerAddress);
router.delete("/:userId/addresses/:addressId", authMiddleware, deleteCustomerAddress);
router.get("/:userId/orders", authMiddleware, getCustomerOrderHistory);

// Protect remaining routes via Admin constraints
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", getCustomerListing);
router.get("/:id", getCustomerDetails);

export default router;
