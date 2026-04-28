import express from "express";
import { getAllLogs, getEntityLogs } from "../controllers/auditController.js";
import { authenticate, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// All audit routes are restricted to Admins
router.use(authenticate);
router.use(allowRoles("admin"));

router.get("/", getAllLogs);
router.get("/entity/:entityType/:entityId", getEntityLogs);

export default router;
