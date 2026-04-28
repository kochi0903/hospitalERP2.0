import express from "express";
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  restoreExpense,
  downloadExpensesByMonth,
  exportExpensesExcel,
} from "../controllers/expenseController.js";
import { authenticate, allowRoles } from '../middleware/authMiddleware.js';
import checkEditLock from "../middleware/checkEditLock.js";
import checkDateWindow from "../middleware/checkDateWindow.js";
import Expense from "../models/Expense.js";

const router = express.Router();

router.post("/", authenticate, allowRoles('admin', 'accountant'), checkDateWindow("date"), createExpense);
router.get("/", authenticate, allowRoles('admin', 'accountant'), getAllExpenses);
router.get("/download/:month", authenticate, allowRoles('admin', 'accountant'), downloadExpensesByMonth);
router.get("/export/excel", authenticate, allowRoles('admin'), exportExpensesExcel);
router.get("/:id", authenticate, allowRoles('admin', 'accountant'), getExpenseById);
router.put("/:id", authenticate, allowRoles('admin', 'accountant'), checkEditLock(Expense), checkDateWindow("date"), updateExpense);
router.delete("/:id", authenticate, allowRoles('admin', 'accountant'), checkEditLock(Expense), deleteExpense);
router.patch("/:id/restore", authenticate, allowRoles('admin'), restoreExpense);

export default router;
