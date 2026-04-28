import PatientBill from "../models/PatientBilling.js";
import Income from "../models/Income.js";
import * as pdf from "html-pdf-node";
import { generateBillHTML } from "../templates/billTemplate.js";
import { generateIncomeBillsHTML } from "../templates/incomeBillsTemplate.js";
import { logActivity, calculateDelta } from "../utils/auditLogger.js";
import { exportToExcel } from "../utils/excelGenerator.js";

const BILL_TRACKED_FIELDS = [
  "patientName",
  "patientId",
  "status",
  "totalAmount",
  "services",
  "doctorName",
  "admissionDate",
  "dischargeDate",
  "address",
];

// Helper function to validate bill data
function validateBillData(data) {
  if (!data.patientName || typeof data.patientName !== "string") {
    return "Patient name is required and must be a string.";
  }
  if (!Array.isArray(data.services) || data.services.length === 0) {
    return "At least one service is required.";
  }
  for (const item of data.services) {
    if (!item.description || typeof item.description !== "string") {
      return "Each service must have a description.";
    }
    if (typeof item.cost !== "number" || item.cost < 0) {
      return "Each service must have a valid cost.";
    }
  }
  if (typeof data.totalAmount !== "number" || data.totalAmount < 0) {
    return "Total amount is required and must be a non-negative number.";
  }
  if (!data.address) {
    return "Address must not be empty.";
  }
  return null;
}

export const createBill = async (req, res) => {
  try {
    // Validate input
    const validationError = validateBillData(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Prevent duplicate bills for same patient and date (optional, example)
    const existingBill = await PatientBill.findOne({
      patientName: req.body.patientName,
      patientId: req.body.patientId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });
    if (existingBill) {
      return res
        .status(409)
        .json({ error: "Bill for this patient already exists today." });
    }

    if (!req.body.status) req.body.status = "due";

    const bill = new PatientBill(req.body);
    await bill.save();

    // Log Activity
    logActivity({
      action: "CREATE",
      entityType: "PatientBill",
      entityId: bill._id,
      performedBy: req.user?.id || bill.createdBy,
      details: `Created bill for ${bill.patientName}`,
      req,
    });

    let income = null;
    // Only create income if status is "paid"
    if (bill.status === "paid") {
      income = new Income({
        source: "Patient Billing",
        amount: bill.totalAmount,
        referenceId: bill._id,
      });
      await income.save();
    }

    res.status(201).json({ bill, income });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllBills = async (req, res) => {
  try {
    // Pagination
    const page =
      parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
    const limit =
      parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    // Filtering (excluding pagination params)
    const { page: _p, limit: _l, fromDate, toDate, search, trash, ...filters } = req.query;

    // Remove empty filter values
    Object.keys(filters).forEach(
      (key) =>
        (filters[key] === undefined || filters[key] === "") &&
        delete filters[key]
    );

    // Handle search filter (OR across patientName and patientId)
    if (search) {
      const regex = new RegExp(search, "i");
      filters.$or = [{ patientName: regex }, { patientId: regex }];
    }

    // Handle date range filter
    if (fromDate && toDate) {
      filters.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    // Handle trash view
    if (trash === "true") {
      filters.isDeleted = true;
    }

    // Count total documents for pagination
    const total = await PatientBill.countDocuments(filters).setOptions({
      includeDeleted: trash === "true",
    });

    const bills = await PatientBill.find(filters)
      .sort({ dischargeDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .setOptions({ includeDeleted: trash === "true" });

    if (!bills.length) {
      return res.status(200).json({
        data: [],
        pagination: { total: 0, page, limit, pages: 0, hasNext: false, hasPrev: false },
      });
    }

    res.json({
      data: bills,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBillPdf = async (req, res) => {
  try {
    const bill = await PatientBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    if (
      !bill.services ||
      !Array.isArray(bill.services) ||
      bill.services.length === 0
    ) {
      return res.status(400).json({ error: "Bill has no services." });
    }
    if (typeof bill.totalAmount !== "number") {
      return res.status(400).json({ error: "Bill total amount is invalid." });
    }

    const options = {
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    };
    const file = {
      content: generateBillHTML(bill),
    };

    const pdfBuffer = await pdf.generatePdf(file, options);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=bill-${bill._id}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};

// Toggle bill status from due to paid and create income if not already present
export const toggleBillStatus = async (req, res) => {
  try {
    const bill = await PatientBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    if (bill.status === "paid") {
      return res.status(400).json({ error: "Bill is already paid." });
    }

    bill.status = "paid";
    await bill.save();

    // Check if income already exists for this bill
    let income = await Income.findOne({
      referenceId: bill._id,
      source: "Patient Billing",
    });
    if (!income) {
      income = new Income({
        source: "Patient Billing",
        amount: bill.totalAmount,
        referenceId: bill._id,
      });
      await income.save();
    }

    res.json({ bill, income });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a bill by ID
export const getBillById = async (req, res) => {
  try {
    const bill = await PatientBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a bill by ID
export const updateBill = async (req, res) => {
  try {
    // Optional: Validate input if needed
    const validationError = validateBillData(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find the existing bill first
    const existingBill = await PatientBill.findById(req.params.id);
    if (!existingBill) return res.status(404).json({ error: "Bill not found" });
    const prevStatus = existingBill.status;
    const newStatus = req.body.status;

    // Capture original state for audit delta before modifying
    const originalData = existingBill.toObject();

    // Update the bill using save() to trigger all schema validators
    Object.assign(existingBill, req.body);
    const bill = await existingBill.save();

    // Log Activity
    const delta = calculateDelta(originalData, bill, BILL_TRACKED_FIELDS);
    if (delta) {
      logActivity({
        action: "UPDATE",
        entityType: "PatientBill",
        entityId: bill._id,
        performedBy: req.user.id,
        changes: delta,
        details: `Updated bill for ${bill.patientName}`,
        req,
      });
    }

    let income = null;
    // If status changed from due to paid, add to income
    if (prevStatus === "due" && newStatus === "paid") {
      // Check if income already exists
      income = await Income.findOne({
        referenceId: bill._id,
        source: "Patient Billing",
      });
      if (!income) {
        income = new Income({
          source: "Patient Billing",
          amount: bill.totalAmount,
          referenceId: bill._id,
        });
        await income.save();
      }
    }
    // If status changed from paid to due, remove from income
    if (prevStatus === "paid" && newStatus === "due") {
      await Income.deleteMany({
        referenceId: bill._id,
        source: "Patient Billing",
      });
    }

    res.json({ bill, income });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a bill by ID (Soft Delete)
export const deleteBill = async (req, res) => {
  try {
    const bill = await PatientBill.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: Date.now() },
      { new: true }
    );
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    // Soft-delete related income
    await Income.updateMany(
      { referenceId: bill._id, source: "Patient Billing" },
      { isDeleted: true, deletedAt: Date.now() }
    );

    // Log Activity
    logActivity({
      action: "DELETE",
      entityType: "PatientBill",
      entityId: bill._id,
      performedBy: req.user.id,
      details: `Soft-deleted bill for ${bill.patientName}`,
      req,
    });

    res.json({ message: "Bill deleted successfully (soft-delete)" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Restore a deleted bill by ID
export const restoreBill = async (req, res) => {
  try {
    const bill = await PatientBill.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    ).setOptions({ includeDeleted: true });

    if (!bill) return res.status(404).json({ error: "Bill not found" });

    // Restore related income
    await Income.updateMany(
      { referenceId: bill._id, source: "Patient Billing" },
      { isDeleted: false, deletedAt: null }
    ).setOptions({ includeDeleted: true });

    // Log Activity
    logActivity({
      action: "RESTORE",
      entityType: "PatientBill",
      entityId: bill._id,
      performedBy: req.user.id,
      details: `Restored bill for ${bill.patientName}`,
      req,
    });

    res.json({ message: "Bill restored successfully", bill });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const downloadIncomebyMonth = async (req, res) => {
  try {
    const { month } = req.params; // e.g., '2025-06'

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res
        .status(400)
        .json({ error: "Month parameter is required in YYYY-MM format" });
    }
    const [year, monthNum] = month.split("-").map(Number);
    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: "Invalid month format" });
    }
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Fetch bills within the month
    const bills = await PatientBill.find({
      admissionDate: {
        $gte: start,
        $lte: end,
      },
    });

    // Calculate total income
    const totalIncome = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const options = { format: "A4" };
    // Generate PDF buffer
    const file = {
      content: generateIncomeBillsHTML(bills, month, totalIncome),
    };
    const pdfBuffer = await pdf.generatePdf(file, options);

    // Set headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=income_${month}.pdf`
    );

    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @desc    Export Patient Bills to Excel
 * @route   GET /api/patient/export/excel
 * @access  Private/Admin
 */
export const exportBillsExcel = async (req, res) => {
  try {
    // Filtering logic (similar to getAllBills but without pagination)
    const { fromDate, toDate, trash, ...filters } = req.query;

    Object.keys(filters).forEach(
      (key) => (filters[key] === undefined || filters[key] === "") && delete filters[key]
    );

    if (fromDate && toDate) {
      filters.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    if (trash === "true") {
      filters.isDeleted = true;
    } else {
      filters.isDeleted = { $ne: true };
    }

    const bills = await PatientBill.find(filters)
      .sort({ createdAt: -1 })
      .setOptions({ includeDeleted: trash === "true" });

    const columns = [
      { header: "Patient Name", key: "patientName", width: 25 },
      { header: "Patient ID", key: "patientId", width: 15 },
      { header: "Doctor", key: "doctorName", width: 20 },
      { header: "Status", key: "status", width: 10 },
      { header: "Total Amount", key: "totalAmount", width: 15 },
      { header: "Admission Date", key: "admissionDateStr", width: 18 },
      { header: "Discharge Date", key: "dischargeDateStr", width: 18 },
      { header: "Address", key: "address", width: 30 },
      { header: "Created At", key: "createdAtStr", width: 18 },
    ];

    const data = bills.map((bill) => ({
      ...bill._doc,
      patientId: bill.patientId || "N/A",
      totalAmount: bill.totalAmount || 0,
      admissionDateStr: bill.admissionDate ? new Date(bill.admissionDate).toLocaleDateString() : "N/A",
      dischargeDateStr: bill.dischargeDate ? new Date(bill.dischargeDate).toLocaleDateString() : "N/A",
      createdAtStr: new Date(bill.createdAt).toLocaleDateString(),
    }));

    await exportToExcel({
      data,
      columns,
      sheetName: "Patient Bills",
      res,
      fileName: `patient_bills_${new Date().toISOString().split("T")[0]}.xlsx`,
    });

    // Log Activity (fire-and-forget after response is sent — wrapped in try-catch to prevent crashes)
    try {
      logActivity({
        action: "OTHER",
        entityType: "PatientBill",
        performedBy: req.user.id,
        details: `Exported ${bills.length} bills to Excel`,
        req,
      });
    } catch (auditErr) {
      console.error("Audit log failed after Excel export:", auditErr.message);
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

/**
 * @desc    Get Doctor-wise Revenue Report with filters
 * @route   GET /api/patient/reports/revenue
 * @access  Private/Admin
 */
export const getDoctorRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = {
      status: "paid",
      isDeleted: { $ne: true },
    };

    if (startDate || endDate) {
      matchQuery.dischargeDate = {};
      if (startDate) matchQuery.dischargeDate.$gte = new Date(startDate);
      if (endDate) matchQuery.dischargeDate.$lte = new Date(endDate);
    }

    const report = await PatientBill.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$doctorName",
          totalRevenue: { $sum: "$totalAmount" },
          billCount: { $sum: 1 },
          avgRevenue: { $avg: "$totalAmount" },
        },
      },
      {
        $project: {
          doctorName: "$_id",
          totalRevenue: 1,
          billCount: 1,
          avgRevenue: { $round: ["$avgRevenue", 2] },
          _id: 0,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
