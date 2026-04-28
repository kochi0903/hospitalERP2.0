import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { authenticate, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/settings - any authenticated user can read settings
router.get("/", authenticate, getSettings);

// PUT /api/settings - only admins can update settings
router.put("/", authenticate, allowRoles("admin"), updateSettings);

export default router;
