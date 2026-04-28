import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Save, Calendar, Tag, FileText } from "lucide-react";
import Button from "../ui/Button";
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from "../../services/expenseApi";
import { setError, setMessage } from "../../store/expenseSlice";
import { FaRupeeSign } from "react-icons/fa";
import { convertDateString } from "../../utils/formatter";
import { useGetSettingsQuery } from "../../services/settingsApi";

// Main and subcategory options
const mainCategories = [
  "Nursing Home Supplies",
  "Swasthya Sathi",
  "Salaries",
  "Maintainance",
  "Shopping",
  "Insurance/Licenses",
  "Miscellaneous",
];

const subCategoryOptions = {
  "Nursing Home Supplies": [
    "Medicines and Salines",
    "Printing Posatge",
    "Computer Expenses",
    "Equipments",
    "Medical Supplies",
    "Others",
  ],
  "Swasthya Sathi": [
    "Food",
    "Travel Allowance",
    "Doctor Payment",
  ],
  "Salaries": [
    "Doctor",
    "Employees",
  ],
  "Maintainance": [
    "AC",
    "Repair Works",
    "Recharges",
    "Electric Bill",
  ],
  "Shopping": [],
};

const maxDate = new Date().toISOString().split("T")[0];

const ExpenseForm = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { selectedExpense } = useSelector((state) => state.expense);
  const { user } = useSelector((state) => state.user);

  // Fetch admin-configured data entry window
  const { data: settingsData } = useGetSettingsQuery();
  const dataEntryDays = settingsData?.settings?.dataEntryWindowDays || 7;
  const isAdmin = user?.role === "admin";

  // Admins bypass the date restriction
  const minDate = isAdmin
    ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : new Date(Date.now() - dataEntryDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    mainCategory: "",
    subCategory: "",
    category: "", // for backward compatibility
    remarks: "",
    paymentMode: "cash", // default to cash
  });

  // API Mutations
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  const isLoading = isCreating || isUpdating;
  const isEditing = !!selectedExpense;

  // Initialize form data when editing
  useEffect(() => {
    if (selectedExpense) {
      let mainCategory = "";
      let subCategory = "";
      if (selectedExpense.category) {
        // Find the main category that matches the start of the category string
        const foundMain = mainCategories.find((cat) =>
          selectedExpense.category.startsWith(cat)
        );
        if (foundMain) {
          mainCategory = foundMain;
          // Remove the main category from the start to get the subcategory (if any)
          const rest = selectedExpense.category.slice(foundMain.length).trim();
          subCategory = rest;
        } else {
          mainCategory = selectedExpense.category;
        }
      }
      setFormData({
        amount: selectedExpense.amount?.toString() || "",
        date:
          convertDateString(selectedExpense.date) ||
          new Date().toISOString().split("T")[0],
        mainCategory,
        subCategory,
        category: selectedExpense.category || "",
        remarks: selectedExpense.remarks || "",
        paymentMode: selectedExpense.paymentMode || "cash",
      });
    }
  }, [selectedExpense]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else if (formData.date < minDate || formData.date > maxDate) {
      newErrors.date = `Date must be within the last ${dataEntryDays} days`;
    }
    if (!formData.mainCategory) {
      newErrors.mainCategory = "Main category is required";
    }
    // If subcategory is required for this main category
    if (
      formData.mainCategory &&
      subCategoryOptions[formData.mainCategory] &&
      subCategoryOptions[formData.mainCategory].length > 0 &&
      !formData.subCategory
    ) {
      newErrors.subCategory = "Sub category is required";
    }
    if (!formData.remarks || formData.remarks.trim().length < 3) {
      newErrors.remarks = "Remarks must be at least 5 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      // Concatenate main and sub category for category field
      let category = formData.mainCategory;
      if (formData.subCategory) {
        category += " " + formData.subCategory;
      }
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        category,
        paymentMode: formData.paymentMode,
      };

      if (isEditing) {
        await updateExpense({
          id: selectedExpense._id,
          ...expenseData,
        }).unwrap();
        dispatch(setMessage("Expense updated successfully"));
      } else {
        await createExpense(expenseData).unwrap();
        dispatch(setMessage("Expense created successfully"));
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      dispatch(
        setError(
          error?.data?.error ||
            `Failed to ${isEditing ? "update" : "create"} expense`
        )
      );
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      if (field === "mainCategory") {
        return {
          ...prev,
          mainCategory: value,
          subCategory: "", // reset subcategory
        };
      }
      return { ...prev, [field]: value };
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Expense" : "Add New Expense"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaRupeeSign className="inline w-4 h-4 mr-1" />
              Amount
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter amount"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              min={minDate}
              max={maxDate}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Responsive Category Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Main Category */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Category
              </label>
              <select
                value={formData.mainCategory}
                onChange={(e) => handleChange("mainCategory", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.mainCategory ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Main Category</option>
                {mainCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.mainCategory && (
                <p className="mt-1 text-sm text-red-600">{errors.mainCategory}</p>
              )}
            </div>
            {/* Sub Category (if applicable) */}
            {formData.mainCategory && subCategoryOptions[formData.mainCategory] &&
              subCategoryOptions[formData.mainCategory].length > 0 && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Category
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => handleChange("subCategory", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.subCategory ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Sub Category</option>
                    {subCategoryOptions[formData.mainCategory].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  {errors.subCategory && (
                    <p className="mt-1 text-sm text-red-600">{errors.subCategory}</p>
                  )}
                </div>
              )}
          </div>
          {/* Category (hidden, for backward compatibility) */}
          <input type="hidden" value={formData.category} readOnly />
          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Mode
            </label>
            <div className="flex gap-6">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="paymentMode"
                  value="cash"
                  checked={formData.paymentMode === "cash"}
                  onChange={() => handleChange("paymentMode", "cash")}
                  className="form-radio text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Cash</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="paymentMode"
                  value="upi/bank"
                  checked={formData.paymentMode === "upi/bank"}
                  onChange={() => handleChange("paymentMode", "upi/bank")}
                  className="form-radio text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">UPI/Bank</span>
              </label>
            </div>
          </div>
          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="inline w-4 h-4 mr-1" />
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.remarks ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter remarks or description"
            />
            {errors.remarks && (
              <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
              loading={isLoading}
              icon={<Save size={16} />}
            >
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
