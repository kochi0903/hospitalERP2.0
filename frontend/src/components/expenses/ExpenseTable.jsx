import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Filter, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import Button from "../ui/Button";
import { setFilters } from "../../store/expenseSlice";
import { formatCurrency, formatDateForTables } from "../../utils/formatter";
import { Pagination } from "../ui/Pagination";
import Axios from "../../utils/Axios";
import { LockedBadge } from "../ui/LockedBadge";

const ExpenseTable = ({
  expenses,
  pagination,
  isLoading,
  viewMode = "table",
  onEdit,
  onDelete,
  onView,
  onPageChange,
  isTrash = false,
  onRestore,
}) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);
  const { filters } = useSelector((state) => state.expense);

  const [selectedMonth, setSelectedMonth] = useState(undefined);
  const [downloading, setDownloading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "Nursing Home Supplies",
    "Swasthya Sathi",
    "Salaries",
    "Maintainance",
    "Shopping",
    "Insurance/Licenses",
    "Miscellaneous",
    "Medical Supplies",
  ];

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  const handleDownload = async () => {
    if (!selectedMonth) return;
    setDownloading(true);
    try {
      const response = await Axios.get(`/api/expense/download/${selectedMonth}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.status === 200) throw new Error("Failed to download PDF");
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses_${selectedMonth}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error downloading PDF: " + error.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ ...filters, [filterType]: value }));
  };

  const canEdit = user?.role === "admin" || user?.role === "accountant";
  const canDelete = user?.role === "admin";

  const lockDays = parseInt(import.meta.env.VITE_EDIT_LOCK_DAYS) || 7;
  const checkIfLocked = (createdAt) => {
    if (user?.role === "admin") return false;
    if (user?.role !== "accountant") return false;
    return (Date.now() - new Date(createdAt).getTime()) > (lockDays * 24 * 60 * 60 * 1000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            defaultValue={new Date().toISOString().slice(0, 7)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
          <Button
            variant="outline"
            size="xs"
            onClick={handleDownload}
            disabled={selectedMonth === undefined || downloading}
          >
            {downloading ? "…" : "Download"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            icon={<Filter size={14} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Remarks</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-400">
                  {pagination?.totalItems > 0
                    ? "No expenses found on this page"
                    : "No expenses found"}
                </td>
              </tr>
            ) : (
              expenses.map((expense) => {
                const isLocked = checkIfLocked(expense.createdAt);
                return (
                  <tr key={expense._id}>
                    <td className="text-sm text-slate-600">{formatDateForTables(expense.date)}</td>
                    <td className="text-sm font-semibold text-slate-900">{formatCurrency(expense.amount)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {expense.category?.length > 18
                            ? `${expense.category.slice(0, 18)}…`
                            : expense.category}
                        </span>
                        {isLocked && <LockedBadge />}
                      </div>
                    </td>
                    <td className="text-sm text-slate-600 max-w-xs truncate" title={expense.remarks}>
                      {expense.remarks}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onView(expense)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        {onEdit && canEdit && !isLocked && !isTrash && (
                          <button
                            onClick={() => onEdit(expense)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                        )}
                        {onDelete && canDelete && !isTrash && (
                          <button
                            onClick={() => onDelete(expense._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                        {isTrash && user?.role === "admin" && (
                          <button
                            onClick={() => onRestore(expense._id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="Restore"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100">
        <Pagination onPageChange={onPageChange} pagination={pagination} />
      </div>
    </div>
  );
};

export default ExpenseTable;
