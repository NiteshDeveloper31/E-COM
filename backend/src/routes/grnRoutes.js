import express from "express";
import { createGRN, getGRNLogs } from "../controllers/grnController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post("/", createGRN);
router.get("/", getGRNLogs);

export default router;
