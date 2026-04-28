import express from "express";
import {
  createBill,
  getBillPdf,
  getAllBills,
  toggleBillStatus,
  getBillById,
  updateBill,
  deleteBill,
  restoreBill,
  downloadIncomebyMonth,
  exportBillsExcel,
  getDoctorRevenueReport,
} from "../controllers/billingController.js";
import { authenticate, allowRoles } from "../middleware/authMiddleware.js";
import checkEditLock from "../middleware/checkEditLock.js";
import checkDateWindow from "../middleware/checkDateWindow.js";
import PatientBill from "../models/PatientBilling.js";

const router = express.Router();

router.post("/", authenticate, allowRoles("admin", "accountant"), checkDateWindow("admissionDate"), createBill);
router.get("/", authenticate, allowRoles("admin", "accountant"), getAllBills);
router.get(
  "/income/download/:month",
  authenticate,
  allowRoles("admin", "accountant"),
  downloadIncomebyMonth
);
router.get(
  "/export/excel",
  authenticate,
  allowRoles("admin"),
  exportBillsExcel
);
router.get(
  "/reports/revenue",
  authenticate,
  allowRoles("admin"),
  getDoctorRevenueReport
);
router.get(
  "/:id/pdf",
  authenticate,
  allowRoles("admin", "accountant"),
  getBillPdf
);
router.patch(
  "/:id/toggle-status",
  authenticate,
  allowRoles("admin", "accountant"),
  toggleBillStatus
);
router.get(
  "/:id",
  authenticate,
  allowRoles("admin", "accountant"),
  getBillById
);
router.put(
  "/:id",
  authenticate,
  allowRoles("admin", "accountant"),
  checkEditLock(PatientBill),
  checkDateWindow("admissionDate"),
  updateBill
);
router.delete(
  "/:id",
  authenticate,
  allowRoles("admin", "accountant"),
  checkEditLock(PatientBill),
  deleteBill
);
router.patch(
  "/:id/restore",
  authenticate,
  allowRoles("admin"),
  restoreBill
);


export default router;
