import Expense from "../models/Expense.js";
import mongoose from "mongoose";
import PatientBill from "../models/PatientBilling.js";
import pdf from "html-pdf-node";
import { generateExpenseBillsHTML } from "../templates/expenseBillsTemplate.js";
import { logActivity, calculateDelta } from "../utils/auditLogger.js";
import { exportToExcel } from "../utils/excelGenerator.js";

const EXPENSE_TRACKED_FIELDS = [
  "amount",
  "category",
  "remarks",
  "date",
  "incurredBy",
  "paymentMethod",
];

// Utility to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createExpense = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is required" });
    }

    // Manual validation for required fields
    const { amount, remarks, category } = req.body;
    const errors = {};
    if (amount === undefined || typeof amount !== "number" || isNaN(amount)) {
      errors.amount = "Amount is required and must be a number";
    }
    if (remarks === undefined) {
      errors.remarks = "Remarks is required";
    }
    if (category === undefined) {
      errors.category = "Category is required";
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }
    if (req.user && req.user.id) {
      req.body.incurredBy = req.user.id;
    }

    const expense = new Expense(req.body);
    await expense.save();

    // Log Activity
    logActivity({
      action: "CREATE",
      entityType: "Expense",
      entityId: expense._id,
      performedBy: req.user.id,
      details: `Created expense for ${expense.category}: ${expense.remarks}`,
      req,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    // Pagination
    const page =
      parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
    const limit =
      parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    // Filtering (excluding pagination params)
    const { page: _p, limit: _l, trash, ...filters } = req.query;

    // Remove empty filter values
    Object.keys(filters).forEach(
      (key) =>
        (filters[key] === undefined || filters[key] === "") &&
        delete filters[key]
    );

    // ***************************************************************
    // FIX: Apply the regex filter logic BEFORE counting the documents
    // ***************************************************************
    
    // 1. Extract the filter value for category
    const categoryFilterValue = filters.category;

    // 2. Check if the category filter exists and is a string
    if (categoryFilterValue && typeof categoryFilterValue === 'string') {
      // 3. Create the regex object for a substring match (case-insensitive)
      const regexFilter = {
        $regex: categoryFilterValue,
        $options: 'i' // 'i' makes the match case-insensitive
      };
      // 4. Update the category field in the filters object
      filters.category = regexFilter;
    }
    
    // console.log(filters);

    // Handle trash view and soft-delete filter
    if (trash === "true") {
      filters.isDeleted = true;
    } else {
      filters.isDeleted = { $ne: true };
    }
    
    // Count total documents for pagination *AFTER* applying filters
    const total = await Expense.countDocuments(filters).setOptions({
      includeDeleted: trash === "true",
    });

    const expenses = await Expense.aggregate([
      {
        // This will now use the same filters object used for countDocuments
        $match: filters, 
      },
      {
        $sort: { date: -1, createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
    
    if (!expenses.length) {
      return res.status(200).json({
        data: [],
        pagination: { total: 0, page, limit, pages: 0, hasNext: false, hasPrev: false },
      });
    }

    res.json({
      data: expenses,
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

export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid expense ID" });
    }
    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid expense ID" });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is required" });
    }
    // Find existing for diff
    const existingExpense = await Expense.findById(id);
    if (!existingExpense) return res.status(404).json({ error: "Expense not found" });

    const updated = await Expense.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Log Activity
    const delta = calculateDelta(existingExpense, updated, EXPENSE_TRACKED_FIELDS);
    if (delta) {
      logActivity({
        action: "UPDATE",
        entityType: "Expense",
        entityId: updated._id,
        performedBy: req.user.id,
        changes: delta,
        details: `Updated expense for ${updated.category}`,
        req,
      });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an expense by ID (Soft Delete)
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid expense ID" });
    }
    const updated = await Expense.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: Date.now() },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Log Activity
    logActivity({
      action: "DELETE",
      entityType: "Expense",
      entityId: updated._id,
      performedBy: req.user.id,
      details: `Soft-deleted expense for ${updated.category}`,
      req,
    });

    res.json({ message: "Expense deleted successfully (soft-delete)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Restore a deleted expense by ID
export const restoreExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid expense ID" });
    }
    const updated = await Expense.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    ).setOptions({ includeDeleted: true });

    if (!updated) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Log Activity
    logActivity({
      action: "RESTORE",
      entityType: "Expense",
      entityId: updated._id,
      performedBy: req.user.id,
      details: `Restored expense for ${updated.category}`,
      req,
    });

    res.json({ message: "Expense restored successfully", expense: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const downloadExpensesByMonth = async (req, res) => {
  try {
    const { month } = req.params;
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

    // Populate incurredBy and approvedBy for names
    const expenses = await Expense.find({
      date: { $gte: start, $lte: end },
    }).populate("incurredBy", "name email");
    if (!expenses.length) {
      return res
        .status(404)
        .json({ error: "No expenses found for this month" });
    }
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const file = {
      content: generateExpenseBillsHTML(expenses, month, totalAmount),
    };
    const pdfBuffer = await pdf.generatePdf(file, { format: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=expenses_${month}.pdf`
    );
    return res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const exportExpensesExcel = async (req, res) => {
  try {
    const { fromDate, toDate, trash, ...filters } = req.query;

    Object.keys(filters).forEach(
      (key) => (filters[key] === undefined || filters[key] === "") && delete filters[key]
    );

    if (fromDate && toDate) {
      filters.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    if (trash === "true") {
      filters.isDeleted = true;
    } else {
      filters.isDeleted = { $ne: true };
    }

    const expenses = await Expense.find(filters)
      .populate("incurredBy", "name")
      .sort({ date: -1 });

    const columns = [
      { header: "Date", key: "dateStr", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Remarks", key: "remarks", width: 30 },
      { header: "Payment Method", key: "paymentMethod", width: 15 },
      { header: "Incurred By", key: "incurredByName", width: 20 },
    ];

    const data = expenses.map((exp) => ({
      ...exp._doc,
      dateStr: exp.date ? new Date(exp.date).toLocaleDateString() : "N/A",
      incurredByName: exp.incurredBy?.name || "N/A",
    }));

    await exportToExcel({
      data,
      columns,
      sheetName: "Expenses",
      res,
      fileName: `expenses_export_${new Date().toISOString().split("T")[0]}.xlsx`,
    });

    logActivity({
      action: "OTHER",
      entityType: "Expense",
      performedBy: req.user.id,
      details: `Exported ${expenses.length} expenses to Excel`,
      req,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
