import { useState, useEffect } from "react";
import { Search, Filter, FileText, Edit, Trash2, Eye, Lock, RotateCcw } from "lucide-react";
import Button from "../ui/Button";
import { useSelector, useDispatch } from "react-redux";
import { setFilters } from "../../store/billingSlice";
import { Pagination } from "../ui/Pagination";
import { formatDateForTables } from "../../utils/formatter";
import Axios from "../../utils/Axios";
import { LockedBadge } from "../ui/LockedBadge";

const BillTable = ({
  bills,
  pagination,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onDownloadPdf,
  onPageChange,
  isTrash = false,
  onRestore,
}) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);
  const { filters } = useSelector((state) => state.bill);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");
  const [status, setStatus] = useState(filters.status || "");
  const [selectedMonth, setSelectedMonth] = useState(undefined);
  const [downloading, setDownloading] = useState(false);
  const canEdit = user?.role === "admin" || user?.role === "accountant";
  const canDelete = user?.role === "admin";

  const lockDays = parseInt(import.meta.env.VITE_EDIT_LOCK_DAYS) || 7;
  const checkIfLocked = (createdAt) => {
    if (user?.role === "admin") return false;
    if (user?.role !== "accountant") return false;
    return (Date.now() - new Date(createdAt).getTime()) > (lockDays * 24 * 60 * 60 * 1000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ ...filters, searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  const handleStatusChange = (value) => {
    setStatus(value);
    dispatch(setFilters({ ...filters, status: value || "" }));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleDownload = async () => {
    if (!selectedMonth) return;
    setDownloading(true);
    try {
      const response = await Axios.get(
        `/api/patient/income/download/${selectedMonth}`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.status === 200) throw new Error("Failed to download PDF");
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `income_${selectedMonth}.pdf`;
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
          <div className="relative">
            <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="pl-8 pr-8 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none bg-white cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="due">Due</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Patient</th>
              <th>Admission</th>
              <th>Discharge</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.length > 0 ? (
              bills.map((bill) => {
                const isLocked = checkIfLocked(bill.createdAt);
                return (
                  <tr key={bill._id}>
                    <td className="font-mono text-xs text-slate-500" title={bill._id}>
                      #…{bill._id.slice(-6)}
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{bill.patientName}</p>
                        <p className="text-[10px] text-slate-400">ID: {bill.patientId}</p>
                      </div>
                    </td>
                    <td className="text-sm text-slate-600">{formatDateForTables(bill.admissionDate)}</td>
                    <td className="text-sm text-slate-600">{formatDateForTables(bill.dischargeDate)}</td>
                    <td className="text-sm font-semibold text-slate-900">₹{bill.totalAmount?.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          bill.status === "paid" ? "badge-paid" :
                          bill.status === "due" ? "badge-due" :
                          "bg-red-50 text-red-600"
                        }`}>
                          {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1)}
                        </span>
                        {isLocked && <LockedBadge />}
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(bill)}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {onEdit && canEdit && !isLocked && !isTrash && (
                          <button
                            onClick={() => onEdit(bill)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                        )}
                        {onDelete && canDelete && !isTrash && (
                          <button
                            onClick={() => onDelete(bill._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                        {isTrash && user?.role === "admin" && (
                          <button
                            onClick={() => onRestore(bill._id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="Restore"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}
                        {onDownloadPdf && (
                          <button
                            onClick={() => onDownloadPdf(bill)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <FileText size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                  {pagination?.totalItems > 0
                    ? "No bills found on this page"
                    : "No bills found"}
                </td>
              </tr>
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

export default BillTable;
