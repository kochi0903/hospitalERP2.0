import express from "express";
import { getAllIncome, getIncomeSummary } from "../controllers/incomeController.js";
import { authenticate, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/", authenticate, allowRoles('admin', 'accountant'), getAllIncome);
router.get("/summary", authenticate, allowRoles('admin', 'accountant'), getIncomeSummary);

export default router;